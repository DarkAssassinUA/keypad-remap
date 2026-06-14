// USB HID Keycode and Modifier Definitions
// Reference: USB HID Usage Tables

const MODIFIERS = [
    { label: 'Ctrl', labelRu: 'Ctrl', value: 0x01, key: 'Control' },
    { label: 'Shift', labelRu: 'Shift', value: 0x02, key: 'Shift' },
    { label: 'Alt', labelRu: 'Alt', value: 0x04, key: 'Alt' },
    { label: 'Win', labelRu: 'Win', value: 0x08, key: 'Meta' },
    { label: 'Right Ctrl', labelRu: 'Прав. Ctrl', value: 0x10, key: 'ControlRight' },
    { label: 'Right Shift', labelRu: 'Прав. Shift', value: 0x20, key: 'ShiftRight' },
    { label: 'Right Alt', labelRu: 'Прав. Alt', value: 0x40, key: 'AltRight' },
    { label: 'Right Win', labelRu: 'Прав. Win', value: 0x80, key: 'MetaRight' }
];

const KEYCODES = {
    0x04: 'A', 0x05: 'B', 0x06: 'C', 0x07: 'D', 0x08: 'E', 0x09: 'F', 0x0A: 'G', 0x0B: 'H',
    0x0C: 'I', 0x0D: 'J', 0x0E: 'K', 0x0F: 'L', 0x10: 'M', 0x11: 'N', 0x12: 'O', 0x13: 'P',
    0x14: 'Q', 0x15: 'R', 0x16: 'S', 0x17: 'T', 0x18: 'U', 0x19: 'V', 0x1A: 'W', 0x1B: 'X',
    0x1C: 'Y', 0x1D: 'Z',
    0x1E: '1', 0x1F: '2', 0x20: '3', 0x21: '4', 0x22: '5', 0x23: '6', 0x24: '7', 0x25: '8',
    0x26: '9', 0x27: '0',
    0x28: 'Enter', 0x29: 'Escape', 0x2A: 'Backspace', 0x2B: 'Tab', 0x2C: 'Space',
    0x2D: '-', 0x2E: '=', 0x2F: '[', 0x30: ']', 0x31: '\\', 0x32: '#', 0x33: ';', 0x34: '\'',
    0x35: '`', 0x36: ',', 0x37: '.', 0x38: '/',
    0x39: 'Caps Lock',
    0x3A: 'F1', 0x3B: 'F2', 0x3C: 'F3', 0x3D: 'F4', 0x3E: 'F5', 0x3F: 'F6', 0x40: 'F7',
    0x41: 'F8', 0x42: 'F9', 0x43: 'F10', 0x44: 'F11', 0x45: 'F12',
    0x46: 'Print Screen', 0x47: 'Scroll Lock', 0x48: 'Pause', 0x49: 'Insert', 0x4A: 'Home',
    0x4B: 'Page Up', 0x4C: 'Delete', 0x4D: 'End', 0x4E: 'Page Down',
    0x4F: 'Right Arrow', 0x50: 'Left Arrow', 0x51: 'Down Arrow', 0x52: 'Up Arrow',
    0x53: 'Num Lock',
    0x54: 'Keypad /', 0x55: 'Keypad *', 0x56: 'Keypad -', 0x57: 'Keypad +', 0x58: 'Keypad Enter',
    0x59: 'Keypad 1', 0x5A: 'Keypad 2', 0x5B: 'Keypad 3', 0x5C: 'Keypad 4', 0x5D: 'Keypad 5',
    0x5E: 'Keypad 6', 0x5F: 'Keypad 7', 0x60: 'Keypad 8', 0x61: 'Keypad 9', 0x62: 'Keypad 0',
    0x63: 'Keypad .',
    0x68: 'F13', 0x69: 'F14', 0x6A: 'F15', 0x6B: 'F16', 0x6C: 'F17', 0x6D: 'F18', 0x6E: 'F19',
    0x6F: 'F20', 0x70: 'F21', 0x71: 'F22', 0x72: 'F23', 0x73: 'F24'
};

// Map browser event.code to USB HID keycodes
const BROWSER_CODE_MAP = {
    'KeyA': 0x04, 'KeyB': 0x05, 'KeyC': 0x06, 'KeyD': 0x07, 'KeyE': 0x08, 'KeyF': 0x09,
    'KeyG': 0x0A, 'KeyH': 0x0B, 'KeyI': 0x0C, 'KeyJ': 0x0D, 'KeyK': 0x0E, 'KeyL': 0x0F,
    'KeyM': 0x10, 'KeyN': 0x11, 'KeyO': 0x12, 'KeyP': 0x13, 'KeyQ': 0x14, 'KeyR': 0x15,
    'KeyS': 0x16, 'KeyT': 0x17, 'KeyU': 0x18, 'KeyV': 0x19, 'KeyW': 0x1A, 'KeyX': 0x1B,
    'KeyY': 0x1C, 'KeyZ': 0x1D,
    'Digit1': 0x1E, 'Digit2': 0x1F, 'Digit3': 0x20, 'Digit4': 0x21, 'Digit5': 0x22,
    'Digit6': 0x23, 'Digit7': 0x24, 'Digit8': 0x25, 'Digit9': 0x26, 'Digit0': 0x27,
    'Enter': 0x28, 'NumpadEnter': 0x58, 'Escape': 0x29, 'Backspace': 0x2A, 'Tab': 0x2B, 'Space': 0x2C,
    'Minus': 0x2D, 'Equal': 0x2E, 'BracketLeft': 0x2F, 'BracketRight': 0x30, 'Backslash': 0x31,
    'Semicolon': 0x33, 'Quote': 0x34, 'Backquote': 0x35, 'Comma': 0x36, 'Period': 0x37, 'Slash': 0x38,
    'CapsLock': 0x39,
    'F1': 0x3A, 'F2': 0x3B, 'F3': 0x3C, 'F4': 0x3D, 'F5': 0x3E, 'F6': 0x3F, 'F7': 0x40,
    'F8': 0x41, 'F9': 0x42, 'F10': 0x43, 'F11': 0x44, 'F12': 0x45,
    'PrintScreen': 0x46, 'ScrollLock': 0x47, 'Pause': 0x48, 'Insert': 0x49, 'Home': 0x4A,
    'PageUp': 0x4B, 'Delete': 0x4C, 'End': 0x4D, 'PageDown': 0x4E,
    'ArrowRight': 0x4F, 'ArrowLeft': 0x50, 'ArrowDown': 0x51, 'ArrowUp': 0x52,
    'NumLock': 0x53,
    'NumpadDivide': 0x54, 'NumpadMultiply': 0x55, 'NumpadSubtract': 0x56, 'NumpadAdd': 0x57,
    'Numpad1': 0x59, 'Numpad2': 0x5A, 'Numpad3': 0x5B, 'Numpad4': 0x5C, 'Numpad5': 0x5D,
    'Numpad6': 0x5E, 'Numpad7': 0x5F, 'Numpad8': 0x60, 'Numpad9': 0x61, 'Numpad0': 0x62,
    'NumpadDecimal': 0x63,
    'F13': 0x68, 'F14': 0x69, 'F15': 0x6A, 'F16': 0x6B, 'F17': 0x6C, 'F18': 0x6D, 'F19': 0x6E,
    'F20': 0x6F, 'F21': 0x70, 'F22': 0x71, 'F23': 0x72, 'F24': 0x73
};

const MEDIA_KEYS = [
    { label: 'Next track', labelRu: 'Следующий трек', value: 0xb5 },
    { label: 'Stop', labelRu: 'Стоп', value: 0xb7 },
    { label: 'Previous track', labelRu: 'Предыдущий трек', value: 0xb6 },
    { label: 'Play/Pause', labelRu: 'Воспроизведение/Пауза', value: 0xcd },
    { label: 'Screen brightness+', labelRu: 'Яркость экрана +', value: 0x6f },
    { label: 'My Computer', labelRu: 'Мой компьютер', value: 0x194 },
    { label: 'Screen brightness-', labelRu: 'Яркость экрана -', value: 0x70 },
    { label: 'Volume-', labelRu: 'Громкость -', value: 0xea },
    { label: 'Volume+', labelRu: 'Громкость +', value: 0xe9 },
    { label: 'Mute', labelRu: 'Отключить звук', value: 0xe2 },
    { label: 'Multimedia', labelRu: 'Мультимедиа', value: 0x183 },
    { label: 'Calculator', labelRu: 'Калькулятор', value: 0x192 },
    { label: 'WWW home', labelRu: 'WWW Домой', value: 0x223 },
    { label: 'E-mail', labelRu: 'Почта', value: 0x18a },
    { label: 'Bass+', labelRu: 'Бас +', value: 0x152 },
    { label: 'WWW Pagerefresh', labelRu: 'WWW Обновить страницу', value: 0x227 },
    { label: 'Treble-', labelRu: 'Высокие частоты -', value: 0x155 },
    { label: 'Treble+', labelRu: 'Высокие частоты +', value: 0x154 },
    { label: 'WWW Pageforward', labelRu: 'WWW Вперед', value: 0x225 },
    { label: 'Bass-', labelRu: 'Бас -', value: 0x153 },
    { label: 'WWW Pageback', labelRu: 'WWW Назад', value: 0x224 }
];

const MOUSE_BUTTONS = [
    { label: 'Left Click', labelRu: 'Левый клик', value: 0x01 },
    { label: 'Right Click', labelRu: 'Правый клик', value: 0x02 },
    { label: 'Middle Click', labelRu: 'Средний клик', value: 0x04 }
];

// Export to window object for browser access
window.KeyboardCodes = {
    MODIFIERS,
    KEYCODES,
    BROWSER_CODE_MAP,
    MEDIA_KEYS,
    MOUSE_BUTTONS
};
