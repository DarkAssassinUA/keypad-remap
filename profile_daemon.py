#!/usr/bin/env python3
"""
WebHID Macro Pad Profile Daemon
Monitors the active Windows window and auto-switches device profiles.
Uses hidapi64.dll (x64) via ctypes -- no pip install required.

HTTP API (port 8001):
  GET  /status          -> daemon status, current window, active profile
  GET  /active-window   -> current foreground window info
  GET  /profiles        -> all saved profiles
  POST /profiles        -> save profiles (sent from browser)
  POST /apply/<id>      -> manually apply profile by id
  POST /connect         -> reconnect to device

Usage:
  python profile_daemon.py
  python profile_daemon.py --hidapi path\\to\\hidapi64.dll
"""

import ctypes
import ctypes.wintypes as wintypes
import json
import os
import sys
import time
import threading
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Path resolution for AppData/Local/keypad-remap
def get_appdata_path():
    local_appdata = os.environ.get("LOCALAPPDATA")
    if not local_appdata:
        # Fallback to current directory if LOCALAPPDATA is missing (rare on Windows)
        return os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(local_appdata, "keypad-remap")
    os.makedirs(target_dir, exist_ok=True)
    return target_dir

# Config
VERSION       = "1.1"
HTTP_PORT     = 8001
PROFILES_FILE = os.path.join(get_appdata_path(), "profiles_daemon.json")
POLL_INTERVAL = 1.0    # seconds between window checks
PACKET_DELAY  = 0.015  # seconds between HID packets

# Target device VID/PID pairs
DEVICE_FILTERS = [
    (0x514c, 0x8850),
    (0x1189, 0x8890),
    (0x1189, 0x8840),
    (0x1189, 0x8842),
    (0x1189, 0x8850),
]

# HID interface we want: vendor usage page 0xFF00, usage 0x01
TARGET_USAGE_PAGE = 0xFF00
TARGET_USAGE      = 0x0001

# Windows API
user32   = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32


def get_foreground_window_info():
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        return {"title": "", "exe": "", "pid": 0}
    length = user32.GetWindowTextLengthW(hwnd) + 1
    buf = ctypes.create_unicode_buffer(length)
    user32.GetWindowTextW(hwnd, buf, length)
    title = buf.value
    pid = wintypes.DWORD(0)
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    pid_val = pid.value
    exe = ""
    try:
        hproc = kernel32.OpenProcess(0x1000, False, pid_val)
        if hproc:
            exebuf = ctypes.create_unicode_buffer(512)
            sz = wintypes.DWORD(512)
            if kernel32.QueryFullProcessImageNameW(hproc, 0, exebuf, ctypes.byref(sz)):
                exe = os.path.basename(exebuf.value)
            kernel32.CloseHandle(hproc)
    except Exception:
        pass
    return {"title": title, "exe": exe, "pid": pid_val}


# ── HIDAPI wrapper ─────────────────────────────────────────────────────────────

class HIDDeviceInfo(ctypes.Structure):
    pass

HIDDeviceInfo._fields_ = [
    ("path",               ctypes.c_char_p),
    ("vendor_id",          ctypes.c_ushort),
    ("product_id",         ctypes.c_ushort),
    ("serial_number",      ctypes.c_wchar_p),
    ("release_number",     ctypes.c_ushort),
    ("manufacturer_string",ctypes.c_wchar_p),
    ("product_string",     ctypes.c_wchar_p),
    ("usage_page",         ctypes.c_ushort),
    ("usage",              ctypes.c_ushort),
    ("interface_number",   ctypes.c_int),
    ("next",               ctypes.POINTER(HIDDeviceInfo)),
]


class HidApi:
    def __init__(self, dll_path):
        self._lib = ctypes.CDLL(dll_path)
        lib = self._lib
        lib.hid_init()

        lib.hid_enumerate.restype  = ctypes.POINTER(HIDDeviceInfo)
        lib.hid_enumerate.argtypes = [ctypes.c_ushort, ctypes.c_ushort]

        lib.hid_free_enumeration.restype  = None
        lib.hid_free_enumeration.argtypes = [ctypes.POINTER(HIDDeviceInfo)]

        lib.hid_open_path.restype  = ctypes.c_void_p
        lib.hid_open_path.argtypes = [ctypes.c_char_p]

        lib.hid_close.restype  = None
        lib.hid_close.argtypes = [ctypes.c_void_p]

        lib.hid_write.restype  = ctypes.c_int
        lib.hid_write.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_size_t]

        lib.hid_error.restype  = ctypes.c_wchar_p
        lib.hid_error.argtypes = [ctypes.c_void_p]

    def find_device_path(self):
        """Enumerate all HID devices and return path of the first matching
        VID/PID + usage_page=0xFF00, usage=0x01 interface."""
        devs = self._lib.hid_enumerate(0, 0)
        d = devs
        found_path = None
        vid_pids = set(DEVICE_FILTERS)
        while d:
            di = d.contents
            if ((di.vendor_id, di.product_id) in vid_pids and
                    di.usage_page == TARGET_USAGE_PAGE and
                    di.usage == TARGET_USAGE):
                found_path = di.path  # bytes
                break
            d = di.next
        self._lib.hid_free_enumeration(devs)
        return found_path

    def open(self):
        """Open the vendor HID interface. Returns handle (int) or None."""
        path = self.find_device_path()
        if not path:
            return None
        handle = self._lib.hid_open_path(path)
        return handle if handle else None

    def close(self, handle):
        if handle:
            self._lib.hid_close(handle)

    def write(self, handle, data: bytes) -> int:
        buf = ctypes.create_string_buffer(data, len(data))
        return self._lib.hid_write(handle, buf, len(data))

    def error(self, handle) -> str:
        return self._lib.hid_error(handle) or ""


# ── Global state ───────────────────────────────────────────────────────────────

state = {
    "running":          True,
    "hid":              None,   # HidApi instance
    "device":           None,   # open handle (int)
    "device_vid":       0,
    "device_pid":       0,
    "profiles":         [],
    "active_profile_id":None,
    "current_window":   {"title": "", "exe": "", "pid": 0},
    "lock":             threading.Lock(),
}

DEFAULT_PROFILES = [
    {"id": "spotify",   "name": "Spotify",      "icon": "\U0001f3b5", "color": "#1DB954",
     "rules": ["Spotify.exe", "spotify"], "packets": {}},
    {"id": "photoshop", "name": "Photoshop",     "icon": "\U0001f3a8", "color": "#31A8FF",
     "rules": ["Photoshop.exe"],          "packets": {}},
    {"id": "chrome",    "name": "Browser",       "icon": "\U0001f310", "color": "#4285F4",
     "rules": ["chrome.exe","firefox.exe","msedge.exe","brave.exe"], "packets": {}},
    {"id": "discord",   "name": "Discord",       "icon": "\U0001f4ac", "color": "#5865F2",
     "rules": ["Discord.exe"],            "packets": {}},
    {"id": "premiere",  "name": "Premiere Pro",  "icon": "\U0001f3ac", "color": "#EA77FF",
     "rules": ["Adobe Premiere Pro.exe"], "packets": {}},
    {"id": "obs",       "name": "OBS Studio",    "icon": "\U0001f4f9", "color": "#302E31",
     "rules": ["obs64.exe","obs.exe"],   "packets": {}},
    {"id": "default",   "name": "Default",       "icon": "\u2328\ufe0f",  "color": "#888888",
     "rules": [],                         "packets": {}},
]


def load_profiles():
    if os.path.exists(PROFILES_FILE):
        try:
            with open(PROFILES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARN] Failed to load profiles: {e}")
    save_profiles(DEFAULT_PROFILES)
    return DEFAULT_PROFILES


def save_profiles(profiles):
    try:
        with open(PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump(profiles, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save profiles: {e}")


# ── Device connection ──────────────────────────────────────────────────────────

def try_connect_device():
    hid = state["hid"]
    if not hid:
        return None
    handle = hid.open()
    if handle:
        # Read back VID/PID for status display
        path = hid.find_device_path()
        # Parse VID/PID from path string if needed (best-effort)
        vid, pid = 0, 0
        for v, p in DEVICE_FILTERS:
            tag = f"VID_{v:04X}&PID_{p:04X}".encode()
            if path and tag in path.upper():
                vid, pid = v, p
                break
        state["device_vid"] = vid
        state["device_pid"] = pid
        print(f"[HID] Connected: VID={vid:#06x} PID={pid:#06x}")
        return handle
    return None


def ensure_device_connected():
    with state["lock"]:
        if state["device"]:
            return True
        handle = try_connect_device()
        if handle:
            state["device"] = handle
            return True
    return False


def send_packets(packets_list):
    if not ensure_device_connected():
        print("[HID] No device connected - will retry next poll")
        return False
    hid    = state["hid"]
    handle = state["device"]
    print(f"[HID] Sending {len(packets_list)} packets...")
    for idx, raw in enumerate(packets_list):
        raw_bytes = bytes(raw)
        # Check if first byte is Report ID 0x03, extract payload
        if len(raw_bytes) > 0 and raw_bytes[0] == 0x03:
            report_id = b'\x03'
            payload = raw_bytes[1:]
        else:
            report_id = b'\x03'
            payload = raw_bytes
            
        # Pad payload to 64 bytes
        if len(payload) < 64:
            payload = payload + b'\x00' * (64 - len(payload))
        else:
            payload = payload[:64]
            
        data = report_id + payload
        
        # Log hex representation
        hex_str = data.hex()
        print(f"  TX [{idx+1}/{len(packets_list)}]: {hex_str[:32]}...")
        
        ret = hid.write(handle, data)
        if ret < 0:
            print(f"[HID] Write error: {hid.error(handle)}")
            with state["lock"]:
                hid.close(handle)
                state["device"] = None
            return False
        time.sleep(PACKET_DELAY)
    return True


# ── Profile logic ──────────────────────────────────────────────────────────────

def apply_profile(profile_id: str, layer: int = 0):
    profiles = state["profiles"]
    profile  = next((p for p in profiles if p["id"] == profile_id), None)
    if not profile:
        print(f"[DAEMON] Profile '{profile_id}' not found")
        return False
    packets_by_layer = profile.get("packets", {})
    if not packets_by_layer and profile_id != 'default':
        print(f"[DAEMON] Profile '{profile.get('name')}' has no packets yet - configure via browser")
        return False
    packets = packets_by_layer.get(str(layer)) or packets_by_layer.get("0", []) if packets_by_layer else []
    if not packets and profile_id != 'default':
        return False
    
    if packets:
        print(f"[DAEMON] Applying '{profile.get('name')}' layer={layer} ({len(packets)} packets)")
        ok = send_packets(packets)
    else:
        # For default profile with empty bindings, just consider it applied successfully
        print(f"[DAEMON] Applying empty default profile '{profile.get('name')}' layer={layer}")
        ok = True
        
    if ok:
        with state["lock"]:
            state["active_profile_id"] = profile_id
    return ok


def find_matching_profile(window_info: dict):
    exe   = window_info.get("exe",   "").lower()
    title = window_info.get("title", "").lower()
    for profile in state["profiles"]:
        if profile.get("disabled"):
            continue
        rules = profile.get("rules", [])
        if not rules:
            continue
        for rule in rules:
            if rule.lower() in exe or rule.lower() in title:
                return profile["id"]
    # fallback: try 'default' profile first
    for profile in state["profiles"]:
        if profile.get("disabled"):
            continue
        if profile.get("id") == "default":
            return profile["id"]
    # secondary fallback: first profile that has no rules and has packets
    for profile in state["profiles"]:
        if profile.get("disabled"):
            continue
        if not profile.get("rules") and profile.get("packets"):
            return profile["id"]
    return None


# ── Polling thread ─────────────────────────────────────────────────────────────

def polling_thread():
    last_profile_id  = None
    retry_connect_at = 0.0
    while state["running"]:
        try:
            win = get_foreground_window_info()
            with state["lock"]:
                state["current_window"] = win

            # Reconnect if device lost
            if not state["device"] and time.time() >= retry_connect_at:
                handle = try_connect_device()
                if handle:
                    with state["lock"]:
                        state["device"] = handle
                    print("[HID] Reconnected")
                    last_profile_id = None   # re-apply current profile
                else:
                    retry_connect_at = time.time() + 5.0  # retry in 5s

            matched = find_matching_profile(win)
            if matched and matched != last_profile_id:
                print(f"[POLL] '{win.get('exe')}' -> profile '{matched}'")
                if apply_profile(matched):
                    last_profile_id = matched
        except Exception as e:
            print(f"[POLL] Error: {e}")
        time.sleep(POLL_INTERVAL)


# ── HTTP Server ────────────────────────────────────────────────────────────────

class DaemonHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # silence default access log

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type",   "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path.rstrip("/")
        if path == "/status":
            with state["lock"]:
                self.send_json({
                    "running":          True,
                    "device_connected": state["device"] is not None,
                    "device_vid":       f'{state["device_vid"]:#06x}',
                    "device_pid":       f'{state["device_pid"]:#06x}',
                    "active_profile_id":state["active_profile_id"],
                    "current_window":   state["current_window"],
                    "profiles_count":   len(state["profiles"]),
                    "version":          VERSION,
                })
        elif path == "/active-window":
            with state["lock"]:
                self.send_json(state["current_window"])
        elif path == "/profiles":
            with state["lock"]:
                self.send_json(state["profiles"])
        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        path   = urlparse(self.path).path.rstrip("/")
        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length) if length > 0 else b"{}"
        try:
            data = json.loads(body)
        except Exception:
            self.send_json({"error": "Invalid JSON"}, 400)
            return

        if path == "/profiles":
            if not isinstance(data, list):
                self.send_json({"error": "Expected JSON array"}, 400)
                return
            with state["lock"]:
                state["profiles"] = data
            save_profiles(data)
            print(f"[HTTP] Profiles synced ({len(data)})")
            self.send_json({"ok": True, "count": len(data)})

        elif path.startswith("/apply/"):
            profile_id = path[len("/apply/"):]
            layer = data.get("layer", 0) if isinstance(data, dict) else 0
            ok = apply_profile(profile_id, layer)
            self.send_json({"ok": ok, "profile_id": profile_id})

        elif path == "/connect":
            with state["lock"]:
                if state["device"] and state["hid"]:
                    state["hid"].close(state["device"])
                    state["device"] = None
            connected = ensure_device_connected()
            self.send_json({"ok": connected})

        else:
            self.send_json({"error": "Not found"}, 404)


# ── Entry point ────────────────────────────────────────────────────────────────

def find_hidapi_dll(hint=None):
    base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    candidates = []
    if hint:
        candidates.append(hint)
    # Prefer x64 DLL for 64-bit Python
    candidates += [
        os.path.join(base_dir, "hidapi64.dll"),
        os.path.join(base_dir, "hidapi.dll"),
        r"c:\Windows\System32\hidapi.dll",
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return None


def main():
    parser = argparse.ArgumentParser(description="WebHID Macro Pad Profile Daemon")
    parser.add_argument("--hidapi", default=None, help="Path to hidapi64.dll")
    parser.add_argument("--port",   default=HTTP_PORT, type=int)
    args = parser.parse_args()

    print("=" * 60)
    print("  WebHID Macro Pad Profile Daemon  v1.1")
    print("=" * 60)

    dll_path = find_hidapi_dll(args.hidapi)
    if dll_path:
        print(f"[HID] Using: {dll_path}")
        try:
            state["hid"] = HidApi(dll_path)
            print("[HID] hidapi loaded OK")
        except OSError as e:
            if "193" in str(e):
                print("[HID] ERROR: hidapi.dll is 32-bit but Python is 64-bit!")
                print("[HID]   -> Use hidapi64.dll (already in folder)")
            else:
                print(f"[HID] Load error: {e}")
    else:
        print("[HID] hidapi.dll not found - running without device support")

    state["profiles"] = load_profiles()
    print(f"[DAEMON] Loaded {len(state['profiles'])} profiles")

    if state["hid"]:
        print("[HID] Device auto-connection scheduled via background thread")

    t = threading.Thread(target=polling_thread, daemon=True)
    t.start()
    print(f"[DAEMON] Polling started ({POLL_INTERVAL}s interval)")

    server = HTTPServer(("localhost", args.port), DaemonHandler)
    print(f"[HTTP]  http://localhost:{args.port}")
    print()
    print("  Configure profiles in browser, click 'Sync to Daemon',")
    print("  then daemon will auto-switch on app change. Ctrl+C to stop.")
    print("=" * 60)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[DAEMON] Stopping...")
        state["running"] = False
        with state["lock"]:
            if state["device"] and state["hid"]:
                state["hid"].close(state["device"])
        print("[DAEMON] Done.")


if __name__ == "__main__":
    main()
