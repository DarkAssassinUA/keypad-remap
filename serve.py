#!/usr/bin/env python3
"""Simple HTTP server that always sends UTF-8 charset in Content-Type."""
import http.server
import os

PORT = 8000

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        ctype = super().guess_type(path)
        # Force UTF-8 charset for text types
        if isinstance(ctype, str) and ctype.startswith("text/"):
            if "charset" not in ctype:
                ctype += "; charset=utf-8"
        if isinstance(ctype, str) and "javascript" in ctype and "charset" not in ctype:
            ctype += "; charset=utf-8"
        return ctype

    def log_message(self, fmt, *args):
        print(f"[HTTP] {self.address_string()} - {fmt % args}")

os.chdir(os.path.dirname(os.path.abspath(__file__)))
with http.server.HTTPServer(("", PORT), UTF8Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}  (UTF-8 enforced)")
    httpd.serve_forever()
