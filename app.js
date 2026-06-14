// WebHID Macro Pad Configurator Core JavaScript Logic

const DEVICE_FILTERS = [
    { vendorId: 0x1189, productId: 0x8890 }, // Ch57x_2 (K8890)
    { vendorId: 0x1189, productId: 0x8840 }, // Ch57x_1
    { vendorId: 0x1189, productId: 0x8842 }, // Ch57x_1 (Alternative)
    { vendorId: 0x1189, productId: 0x8850 }, // Ch57x_1 (Alternative 2)
    { vendorId: 0x514c, productId: 0x8850 }  // Ch57x_3 (K8850 4x4)
];

// Mouse Preset Mappings (aligns with manufacturer gestures/scrolls)
const MOUSE_PRESETS = {
    none: { button: 0, wheel: 0, dx: 0, dy: 0, modifiers: 0 },
    left: { button: 1, wheel: 0, dx: 0, dy: 0, modifiers: 0 },
    right: { button: 2, wheel: 0, dx: 0, dy: 0, modifiers: 0 },
    middle: { button: 4, wheel: 0, dx: 0, dy: 0, modifiers: 0 },
    wheel_up: { button: 0, wheel: 3, dx: 0, dy: 0, modifiers: 0 },
    wheel_down: { button: 0, wheel: -3, dx: 0, dy: 0, modifiers: 0 },
    ctrl_wheel_up: { button: 0, wheel: 3, dx: 0, dy: 0, modifiers: 0x01 },
    ctrl_wheel_down: { button: 0, wheel: -3, dx: 0, dy: 0, modifiers: 0x01 },
    shift_wheel_up: { button: 0, wheel: 3, dx: 0, dy: 0, modifiers: 0x02 },
    shift_wheel_down: { button: 0, wheel: -3, dx: 0, dy: 0, modifiers: 0x02 },
    alt_wheel_up: { button: 0, wheel: 3, dx: 0, dy: 0, modifiers: 0x04 },
    alt_wheel_down: { button: 0, wheel: -3, dx: 0, dy: 0, modifiers: 0x04 },
    swipe_left: { button: 1, wheel: 0, dx: -120, dy: 0, modifiers: 0 },
    swipe_right: { button: 1, wheel: 0, dx: 120, dy: 0, modifiers: 0 },
    swipe_up: { button: 1, wheel: 0, dx: 0, dy: -120, modifiers: 0 },
    swipe_down: { button: 1, wheel: 0, dx: 0, dy: 120, modifiers: 0 },
    like: { button: 5, wheel: 0, dx: 0, dy: 0, modifiers: 0 }
};

const MOUSE_PRESET_LABELS = {
    left: 'Mouse LeftKey',
    right: 'Mouse Right',
    middle: 'Mouse Middle',
    wheel_up: 'Mouse Wheel+',
    wheel_down: 'Mouse Wheel-',
    ctrl_wheel_up: 'Ctrl+Mouse Up',
    ctrl_wheel_down: 'Ctrl+Mouse Down',
    shift_wheel_up: 'Shift+Mouse Up',
    shift_wheel_down: 'Shift+Mouse Down',
    alt_wheel_up: 'Alt+Mouse Up',
    alt_wheel_down: 'Alt+Mouse Down',
    swipe_left: 'Left Swipe',
    swipe_right: 'Right Swipe',
    swipe_up: 'Up Swipe',
    swipe_down: 'Down Swipe',
    like: 'Like (Double Click)'
};

// App State
let currentLang = localStorage.getItem('lang') || 'ru';

const TRANSLATIONS = {
    ru: {
        appTitle: "WebHID Конфигуратор Макропадов",
        statusDisconnected: "Отключено",
        statusConnected: "Подключено: ",
        btnConnect: "Подключить",
        btnDisconnect: "Отключить",
        lblLayout: "Тип кейпада",
        lblModel: "Модель (Протокол)",
        lblLayer: "Слой",
        btnClear: "Очистить",
        btnClearAll: "Очистить всё",
        btnRead: "Считать с устройства",
        btnUpload: "Записать в устройство",
        cardTitleConfig: "Настройка клавиши",
        defaultActiveKey: "Выберите клавишу",
        tabKeyboard: "Клавиатура",
        tabMedia: "Медиа",
        tabMouse: "Мышь",
        lblShortcut: "Нажатие / Сочетание клавиш",
        lblShortcutStatus: "Нажмите здесь и введите сочетание клавиш",
        lblShortcutValue: "Ожидание ввода...",
        lblShortcutListening: "Запись... Введите сочетание и кликните сюда для сохранения",
        lblShortcutCaptured: "Сочетание сохранено! Нажмите для перезаписи",
        lblShortcutNotSupported: "Клавиша не поддерживается. Нажмите для повтора",
        lblShortcutConfiguredManually: "Сочетание настроено вручную!",
        lblManualKeyboard: "ИЛИ НАСТРОЙТЕ ВРУЧНУЮ",
        lblModifiers: "Модификаторы",
        lblKeyboardKey: "Клавиша / Символ",
        btnResetShortcut: "Сбросить",
        lblMediaAction: "Выберите действие",
        lblMouseAction: "Действие / Жест мыши",
        lblMouseBtn: "Клик мыши",
        lblMouseWheel: "Прокрутка колесика",
        lblMouseModifiers: "Модификаторы колесика / клика",
        lblMouseMoveX: "Смещение X (пикс)",
        lblMouseMoveY: "Смещение Y (пикс)",
        cardTitleLed: "Режим подсветки",
        lblLedDesc: "Настройте эффекты анимации подсветки и цвета клавиш.",
        lblLedMode: "Режим анимации",
        lblLedColor: "Цвет подсветки",
        cardTitleConsole: "Системный лог событий и настройки",
        btnCopyLogs: "Копировать лог",
        btnExport: "Экспорт профиля",
        btnImport: "Импорт профиля",
        preset_none: "Нет",
        preset_left: "Левая кнопка мыши",
        preset_right: "Правая кнопка мыши",
        preset_middle: "Средняя кнопка (колесико)",
        preset_wheel_up: "Прокрутка вверх",
        preset_wheel_down: "Прокрутка вниз",
        preset_ctrl_wheel_up: "Ctrl + Прокрутка вверх",
        preset_ctrl_wheel_down: "Ctrl + Прокрутка вниз",
        preset_shift_wheel_up: "Shift + Прокрутка вверх",
        preset_shift_wheel_down: "Shift + Прокрутка вниз",
        preset_alt_wheel_up: "Alt + Прокрутка вверх",
        preset_alt_wheel_down: "Alt + Прокрутка вниз",
        preset_swipe_left: "Свайп влево",
        preset_swipe_right: "Свайп вправо",
        preset_swipe_up: "Свайп вверх",
        preset_swipe_down: "Свайп вниз",
        preset_like: "Лайк (Двойной клик)",
        preset_custom: "Своё действие...",
        opt_none: "Нет",
        opt_left_click: "Левый клик",
        opt_right_click: "Правый клик",
        opt_middle_click: "Средний клик",
        opt_scroll_up: "Прокрутка вверх",
        opt_scroll_down: "Прокрутка вниз",
        prof_panelTitle: "Профили приложений",
        prof_syncBtn: "Сохранить в компаньон",
        prof_newBtn: "+ Новый профиль",
        prof_daemonOk: "🟢 Компаньон активен · Устройство подключено",
        prof_daemonWarn: "🟡 Компаньон активен · Устройство не найдено",
        prof_daemonOff: "🔴 Компаньон не запущен",
        prof_noRules: "\u2014 нет правил \u2014",
        prof_configured: "\u2713 Настроен",
        prof_noConfig: "Нет конфига",
        prof_active: "\u25b6 Активен",
        prof_ttLoad: "Загрузить в редактор",
        prof_ttSave: "Сохранить текущий конфиг в профиль",
        prof_ttEdit: "Редактировать",
        prof_ttDelete: "Удалить",
        prof_promptName: "Название профиля:",
        prof_promptNameDefault: "Новый профиль",
        prof_promptIcon: "Иконка (эмодзи):",
        prof_promptRules: "Правила совпадения (exe или название, через запятую):",
        prof_confirmDelete: "Удалить профиль?",
        prof_syncOk: "Профили успешно сохранены в демон!",
        prof_syncErr: "Ошибка сохранения в демон.",
        prof_syncOffline: "Компаньон недоступен. Запустите Keypad_Companion.exe.",
        prof_hint: "💡 <b>Как использовать:</b> настройте биндинги клавиш \u2192 нажмите 💾 у нужного профиля \u2192 нажмите «Сохранить в компаньон» \u2192 запустите <code>Keypad_Companion.exe</code>. Компаньон будет автоматически переключать профили при смене активного приложения.",
        prof_logBuilding: "Сборка пакетов для профиля",
        prof_logSaved: "Профиль сохранён",
        prof_logLoaded: "Профиль загружен в редактор.",
        prof_logNoConfig: "Нет сохранённой конфигурации.",
        viz_unbound: "Не назначено",
        viz_mediaKey: "Медиа кнопка",
        viz_mouseAction: "Действие мыши",
        viz_unknown: "Неизвестно",
        viz_mouseBtn: "Кнопка ",
        viz_scrollUp: "Скролл +",
        viz_scrollDown: "Скролл -",
        viz_move: "Сдвиг",
        viz_like: "Лайк",
        viz_upperCCW: "Верхняя против ч/с",
        viz_upperCW:  "Верхняя по ч/с",
        viz_lowerCCW: "Нижняя против ч/с",
        viz_lowerCW:  "Нижняя по ч/с",
        viz_centerClick: "Центральный клик",
        viz_press: "Нажатие",
        viz_knob: "Крутилка ",
        viz_upperRing: "Верхнее кольцо",
        viz_lowerRing: "Нижнее кольцо",
        viz_button: "Кнопка K",
        viz_knobLabel: "Крутилка",
        viz_rotCCW: "Поворот влево (CCW)",
        viz_rotCW:  "Поворот вправо (CW)",
        viz_pressBtn: "Нажатие"
    },
    en: {
        appTitle: "WebHID Macro Pad Configurator",
        statusDisconnected: "Disconnected",
        statusConnected: "Connected: ",
        btnConnect: "Connect Device",
        btnDisconnect: "Disconnect",
        lblLayout: "Keypad Layout",
        lblModel: "Device Model (Protocol)",
        lblLayer: "Layer",
        btnClear: "Clear",
        btnClearAll: "Clear All",
        btnRead: "Read from Device",
        btnUpload: "Upload to Device",
        cardTitleConfig: "Key Configuration",
        defaultActiveKey: "Select a Key",
        tabKeyboard: "Keyboard",
        tabMedia: "Media",
        tabMouse: "Mouse",
        lblShortcut: "Keypress / Shortcut",
        lblShortcutStatus: "Click here and type a shortcut",
        lblShortcutValue: "Press Keys",
        lblShortcutListening: "Recording... Press keys, then click here to save",
        lblShortcutCaptured: "Shortcut saved! Click to re-record.",
        lblShortcutNotSupported: "Key not supported. Click to try again.",
        lblShortcutConfiguredManually: "Shortcut configured manually!",
        lblManualKeyboard: "OR CONFIGURE MANUALLY",
        lblModifiers: "Modifiers",
        lblKeyboardKey: "Key / Symbol",
        btnResetShortcut: "Clear",
        lblMediaAction: "Select Action",
        lblMouseAction: "Mouse Action / Gesture",
        lblMouseBtn: "Mouse Click",
        lblMouseWheel: "Mouse Wheel Scroll",
        lblMouseModifiers: "Wheel / Click Modifiers",
        lblMouseMoveX: "Move X (px)",
        lblMouseMoveY: "Move Y (px)",
        cardTitleLed: "LED Backlight Mode",
        lblLedDesc: "Configure the onboard RGB animation effects and colors.",
        lblLedMode: "Animation Mode",
        lblLedColor: "LED Color",
        cardTitleConsole: "Hardware Event Log & Settings",
        btnCopyLogs: "Copy Logs",
        btnExport: "Export Profile",
        btnImport: "Import Profile",
        preset_none: "None",
        preset_left: "Mouse LeftKey",
        preset_right: "Mouse Right",
        preset_middle: "Mouse Middle",
        preset_wheel_up: "Mouse Wheel+",
        preset_wheel_down: "Mouse Wheel-",
        preset_ctrl_wheel_up: "Ctrl+Mouse Up",
        preset_ctrl_wheel_down: "Ctrl+Mouse Down",
        preset_shift_wheel_up: "Shift+Mouse Up",
        preset_shift_wheel_down: "Shift+Mouse Down",
        preset_alt_wheel_up: "Alt+Mouse Up",
        preset_alt_wheel_down: "Alt+Mouse Down",
        preset_swipe_left: "Left Swipe",
        preset_swipe_right: "Right Swipe",
        preset_swipe_up: "Up Swipe",
        preset_swipe_down: "Down Swipe",
        preset_like: "Like (Double Click)",
        preset_custom: "Custom Action...",
        opt_none: "None",
        opt_left_click: "Left Click",
        opt_right_click: "Right Click",
        opt_middle_click: "Middle Click",
        opt_scroll_up: "Scroll Up",
        opt_scroll_down: "Scroll Down",
        prof_panelTitle: "Application Profiles",
        prof_syncBtn: "Sync to Companion",
        prof_newBtn: "+ New Profile",
        prof_daemonOk: "🟢 Companion active · Device connected",
        prof_daemonWarn: "🟡 Companion active · Device not found",
        prof_daemonOff: "🔴 Companion not running",
        prof_noRules: "\u2014 no rules \u2014",
        prof_configured: "\u2713 Configured",
        prof_noConfig: "No config",
        prof_active: "\u25B6 Active",
        prof_ttLoad: "Load into editor",
        prof_ttSave: "Save current config to profile",
        prof_ttEdit: "Edit",
        prof_ttDelete: "Delete",
        prof_promptName: "Profile name:",
        prof_promptNameDefault: "New Profile",
        prof_promptIcon: "Icon (emoji):",
        prof_promptRules: "Match rules (exe or title, comma-separated):",
        prof_confirmDelete: "Delete this profile?",
        prof_syncOk: "Profiles synced to companion successfully!",
        prof_syncErr: "Companion sync error.",
        prof_syncOffline: "Companion not available. Run Keypad_Companion.exe.",
        prof_hint: "💡 <b>How to use:</b> Configure key bindings \u2192 click \uD83D\uDCBE on the profile \u2192 click \u2018Sync to Companion\u2019 \u2192 run <code>Keypad_Companion.exe</code> in the background. The companion will auto-switch profiles when you change the active app.",
        prof_logBuilding: "Building packets for profile",
        prof_logSaved: "Profile saved",
        prof_logLoaded: "Profile loaded into editor.",
        prof_logNoConfig: "No saved configuration.",
        viz_unbound: "Not assigned",
        viz_mediaKey: "Media Key",
        viz_mouseAction: "Mouse Action",
        viz_unknown: "Unknown",
        viz_mouseBtn: "Button ",
        viz_scrollUp: "Scroll +",
        viz_scrollDown: "Scroll -",
        viz_move: "Move",
        viz_like: "Like",
        viz_upperCCW: "Upper CCW",
        viz_upperCW:  "Upper CW",
        viz_lowerCCW: "Lower CCW",
        viz_lowerCW:  "Lower CW",
        viz_centerClick: "Center Click",
        viz_press: "Press",
        viz_knob: "Knob ",
        viz_upperRing: "Upper Ring",
        viz_lowerRing: "Lower Ring",
        viz_button: "Button K",
        viz_knobLabel: "Knob",
        viz_rotCCW: "Rotate Left (CCW)",
        viz_rotCW:  "Rotate Right (CW)",
        viz_pressBtn: "Press Button"
    }
};

let activeDevice = null;
let activeQueries = {};    // Active query callbacks for reading device config
let currentLayout = localStorage.getItem('current_layout') || '6x1'; // Default layout
let currentLayer = 0;      // Active layer 0-3 (UI selector)
let activeKeyElement = null; // Currently selected key in visualizer (DOM)
let activeKeyData = null;  // Reference to current active key state
let activeModel = localStorage.getItem('active_model') || 'Ch57x_2'; // Active keyboard model

// Structure of configuration state:
// config[layer][keyId] = { type: 'none' | 'keyboard' | 'media' | 'mouse', ... }
let configState = {};

// Initialise the config state for 4 layers
function initializeConfig() {
    configState = {};
    for (let layer = 0; layer < 4; layer++) {
        configState[layer] = {};
        // Initialise bindings for buttons (1 to 12)
        for (let b = 1; b <= 12; b++) {
            configState[layer][`button-${b}`] = { type: 'none' };
        }
        // Initialise bindings for knobs (up to 3 knobs to support Concentric Dial model)
        for (let k = 0; k < 3; k++) {
            configState[layer][`knob-${k}-ccw`] = { type: 'none' };
            configState[layer][`knob-${k}-press`] = { type: 'none' };
            configState[layer][`knob-${k}-cw`] = { type: 'none' };
        }
    }
}

// DOM Elements
const elements = {
    btnConnect: document.getElementById('btn-connect'),
    btnLang: document.getElementById('btn-lang'),
    statusText: document.getElementById('status-text'),
    statusIndicator: document.getElementById('status-indicator'),
    selectLayout: document.getElementById('select-layout'),
    selectLayer: document.getElementById('select-layer'),
    keypadChassis: document.getElementById('keypad-chassis'),
    btnClear: document.getElementById('btn-clear'),
    btnClearAll: document.getElementById('btn-clear-all'),
    btnRead: document.getElementById('btn-read'),
    btnUpload: document.getElementById('btn-upload'),
    activeKeyTitle: document.getElementById('active-key-title'),
    configPanel: document.getElementById('config-panel'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Keyboard Tab
    keyCaptureBox: document.getElementById('key-capture-box'),
    keyCaptureValue: document.getElementById('key-capture-value'),
    keyCaptureStatus: document.getElementById('key-capture-status'),
    btnClearShortcut: document.getElementById('btn-clear-shortcut'),
    selectKeyboardKey: document.getElementById('select-keyboard-key'),
    chkCtrl: document.getElementById('chk-ctrl'),
    chkShift: document.getElementById('chk-shift'),
    chkAlt: document.getElementById('chk-alt'),
    chkWin: document.getElementById('chk-win'),
    chkRCtrl: document.getElementById('chk-rctrl'),
    chkRShift: document.getElementById('chk-rshift'),
    chkRAlt: document.getElementById('chk-ralt'),
    chkRWin: document.getElementById('chk-rwin'),
    
    // Media Tab
    selectMedia: document.getElementById('select-media'),
    
    // Mouse Tab
    selectMouseAction: document.getElementById('select-mouse-action'),
    mouseCustomSettings: document.getElementById('mouse-custom-settings'),
    selectMouseBtn: document.getElementById('select-mouse-btn'),
    selectMouseWheel: document.getElementById('select-mouse-wheel'),
    chkMouseCtrl: document.getElementById('chk-mouse-ctrl'),
    chkMouseShift: document.getElementById('chk-mouse-shift'),
    chkMouseAlt: document.getElementById('chk-mouse-alt'),
    inputMouseDx: document.getElementById('input-mouse-dx'),
    inputMouseDy: document.getElementById('input-mouse-dy'),
    
    // RGB controls
    selectLedMode: document.getElementById('select-led-mode'),
    ledColorsContainer: document.getElementById('led-colors-container'),
    
    // Config profile tools
    btnExport: document.getElementById('btn-export'),
    btnImport: document.getElementById('btn-import'),
    importFileInput: document.getElementById('import-file-input'),
    selectModel: document.getElementById('select-model'),
    consoleLog: document.getElementById('console-log')
};

// Logging function
function log(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'console-line';
    
    let typeClass = 'console-info';
    if (type === 'success') typeClass = 'console-success';
    if (type === 'error') typeClass = 'console-error';
    if (type === 'tx') typeClass = 'console-tx';
    
    line.innerHTML = `<span class="console-time">[${time}]</span><span class="${typeClass}">${message}</span>`;
    elements.consoleLog.appendChild(line);
    elements.consoleLog.scrollTop = elements.consoleLog.scrollHeight;
}

// Get dimensions of selected layout
function getLayoutConfig(layoutName) {
    switch (layoutName) {
        case '3x1': return { cols: 3, knobs: 1, keys: 3 };
        case '3x2': return { cols: 3, knobs: 2, keys: 3 };
        case '6x1': return { cols: 3, knobs: 1, keys: 6 };
        case '6x2': return { cols: 3, knobs: 2, keys: 6 };
        case '12x2': return { cols: 4, knobs: 2, keys: 12 };
        case 'media_dial': return { cols: 0, knobs: 3, keys: 0 };
        default: return { cols: 3, knobs: 1, keys: 6 };
    }
}

// Map Key bindings to readable labels for Visualiser display
function getBindingLabel(binding) {
    const T = TRANSLATIONS[currentLang];
    if (!binding || binding.type === 'none') return T.viz_unbound;

    if (binding.type === 'keyboard') {
        const modStrings = [];
        window.KeyboardCodes.MODIFIERS.forEach(m => {
            if ((binding.modifiers & m.value) === m.value) {
                modStrings.push(currentLang === 'ru' && m.labelRu ? m.labelRu : m.label);
            }
        });
        let keyLabel = window.KeyboardCodes.KEYCODES[binding.code] || `0x${binding.code.toString(16)}`;
        if (currentLang === 'ru') {
            const ruKeyLabels = {
                'Right Arrow':  '\u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u043f\u0440\u0430\u0432\u043e',
                'Left Arrow':   '\u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u043b\u0435\u0432\u043e',
                'Down Arrow':   '\u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u043d\u0438\u0437',
                'Up Arrow':     '\u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u0432\u0435\u0440\u0445',
                'Space':        '\u041f\u0440\u043e\u0431\u0435\u043b'
            };
            if (ruKeyLabels[keyLabel]) keyLabel = ruKeyLabels[keyLabel];
        }
        return [...modStrings, keyLabel].join(' + ');
    }

    if (binding.type === 'media') {
        const mKey = window.KeyboardCodes.MEDIA_KEYS.find(k => k.value === binding.code);
        if (mKey) return currentLang === 'ru' && mKey.labelRu ? mKey.labelRu : mKey.label;
        return T.viz_mediaKey;
    }

    if (binding.type === 'mouse') {
        let matchedPresetName = null;
        for (const [name, preset] of Object.entries(MOUSE_PRESETS)) {
            if (binding.button === preset.button && binding.wheel === preset.wheel &&
                binding.dx === preset.dx && binding.dy === preset.dy &&
                (binding.modifiers || 0) === (preset.modifiers || 0)) {
                matchedPresetName = name; break;
            }
        }
        if (matchedPresetName && MOUSE_PRESET_LABELS[matchedPresetName]) {
            return currentLang === 'ru' ? TRANSLATIONS.ru[`preset_${matchedPresetName}`] : MOUSE_PRESET_LABELS[matchedPresetName];
        }
        const parts = [];
        const mods = [];
        if ((binding.modifiers & 0x01) === 0x01) mods.push('Ctrl');
        if ((binding.modifiers & 0x02) === 0x02) mods.push('Shift');
        if ((binding.modifiers & 0x04) === 0x04) mods.push('Alt');
        if (binding.button) {
            parts.push(binding.button === 5 ? T.viz_like : (T.viz_mouseBtn + binding.button));
        }
        if (binding.wheel) parts.push(binding.wheel > 0 ? T.viz_scrollUp : T.viz_scrollDown);
        if (binding.dx || binding.dy) parts.push(`${T.viz_move}(${binding.dx},${binding.dy})`);
        const modStr = mods.length > 0 ? mods.join('+') + ' + ' : '';
        return parts.length > 0 ? modStr + parts.join(', ') : T.viz_mouseAction;
    }

    return T.viz_unknown;
}

// // Build Visual Keyboard elements dynamically
function renderKeypad() {
    elements.keypadChassis.innerHTML = '';
    const layout = getLayoutConfig(currentLayout);

    // Custom layout visualizer for Concentric Media Dial
    if (currentLayout === 'media_dial') {
        const T = TRANSLATIONS[currentLang];
        const dialContainer = document.createElement('div');
        dialContainer.className = 'dial-container';

        const UNBOUND = T.viz_unbound;

        function createArrow(keyId, label, posClass, direction) {
            const arrowEl = document.createElement('div');
            arrowEl.className = `dial-action-arrow ${posClass}`;
            arrowEl.dataset.type = 'dial_action';
            arrowEl.dataset.keyId = keyId;
            arrowEl.dataset.label = label;
            arrowEl.style.position = 'absolute';
            if (posClass.includes('top'))    arrowEl.style.top    = '24px';
            if (posClass.includes('bottom')) arrowEl.style.bottom = '24px';
            if (posClass.includes('left'))   arrowEl.style.left   = '24px';
            if (posClass.includes('right'))  arrowEl.style.right  = '24px';
            const binding = configState[currentLayer][keyId];
            const displayLabel = getBindingLabel(binding);
            arrowEl.innerHTML = `
                <div class="arrow-icon ${direction}"></div>
                <div class="arrow-label" title="${displayLabel}">${displayLabel}</div>
                <div class="arrow-sublabel">${label}</div>
            `;
            arrowEl.addEventListener('click', () => selectKey(arrowEl));
            return arrowEl;
        }

        const chassis = document.createElement('div');
        chassis.className = 'dial-chassis';

        chassis.appendChild(createArrow('knob-1-ccw', T.viz_upperCCW, 'inner-top-left',     'ccw'));
        chassis.appendChild(createArrow('knob-1-cw',  T.viz_upperCW,  'inner-top-right',    'cw'));

        // Center button
        const centerBtn = document.createElement('div');
        centerBtn.className = 'dial-center-button';
        centerBtn.style.position = 'absolute';
        centerBtn.style.top  = 'calc(50% - 70px)';
        centerBtn.style.left = 'calc(50% - 70px)';
        centerBtn.dataset.type  = 'dial_action';
        centerBtn.dataset.keyId = 'knob-0-press';
        centerBtn.dataset.label = T.viz_centerClick;
        const centerBinding = configState[currentLayer]['knob-0-press'];
        const centerLabel   = getBindingLabel(centerBinding);
        centerBtn.innerHTML = `
            <div class="center-btn-title" title="${centerLabel}">${centerLabel}</div>
            <div class="center-btn-subtitle">${T.viz_centerClick}</div>
        `;
        centerBtn.addEventListener('click', () => selectKey(centerBtn));
        chassis.appendChild(centerBtn);

        chassis.appendChild(createArrow('knob-0-ccw', T.viz_lowerCCW, 'inner-bottom-left',  'ccw'));
        chassis.appendChild(createArrow('knob-0-cw',  T.viz_lowerCW,  'inner-bottom-right', 'cw'));

        dialContainer.appendChild(chassis);
        elements.keypadChassis.appendChild(dialContainer);
        return;
    }

        

    // Create buttons grid container
    const buttonsGrid = document.createElement('div');
    buttonsGrid.style.display = 'grid';
    buttonsGrid.style.gridTemplateColumns = `repeat(${layout.cols}, 80px)`;
    buttonsGrid.style.gap = '1.5rem';
    
    for (let i = 1; i <= layout.keys; i++) {
        const keyId = `button-${i}`;
        const binding = configState[currentLayer][keyId];
        const T = TRANSLATIONS[currentLang];
        const keyEl = document.createElement('div');
        keyEl.className = 'key-element';
        keyEl.id = keyId;
        keyEl.dataset.type = 'button';
        keyEl.dataset.index = i;
        keyEl.innerHTML = `
            <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 2px;">${T.viz_button}${i}</div>
            <div class="key-label" title="${getBindingLabel(binding)}">${getBindingLabel(binding)}</div>
        `;
        keyEl.addEventListener('click', () => selectKey(keyEl));
        buttonsGrid.appendChild(keyEl);
    }

    elements.keypadChassis.appendChild(buttonsGrid);

    if (layout.knobs > 0) {
        const knobsGrid = document.createElement('div');
        knobsGrid.style.display = 'flex';
        knobsGrid.style.flexDirection = 'row';
        knobsGrid.style.gap = '1.5rem';
        knobsGrid.style.marginLeft = '2rem';
        knobsGrid.style.borderLeft = '1px solid rgba(255,255,255,0.05)';
        knobsGrid.style.paddingLeft = '2rem';
        const T = TRANSLATIONS[currentLang];
        for (let k = 0; k < layout.knobs; k++) {
            const knobId = `knob-${k}`;
            const knobEl = document.createElement('div');
            knobEl.className = 'knob-element';
            knobEl.id = knobId;
            knobEl.dataset.type = 'knob';
            knobEl.dataset.index = k;
            let knobLabel = T.viz_knob + (k + 1);
            if (currentLayout.includes('3x2') || currentLayout.includes('6x2')) {
                knobLabel = k === 0 ? T.viz_upperRing : T.viz_lowerRing;
            }
            knobEl.innerHTML = `
                <div class="knob-dial" id="dial-${knobId}"></div>
                <div class="knob-title" style="font-size: 0.7rem; text-align: center; max-width: 60px; line-height: 1.1;">${knobLabel}</div>
            `;
            knobEl.addEventListener('click', () => selectKey(knobEl));
            knobsGrid.appendChild(knobEl);
        }
        elements.keypadChassis.appendChild(knobsGrid);
    }
}

// Select a key for editing
function selectKey(element) {
    if (activeKeyElement) activeKeyElement.classList.remove('active');
    activeKeyElement = element;
    activeKeyElement.classList.add('active');
    elements.configPanel.style.pointerEvents = 'auto';
    elements.configPanel.style.opacity = '1';
    if (elements.btnClear) elements.btnClear.disabled = false;
    const keyType = element.dataset.type;
    const T = TRANSLATIONS[currentLang];
    if (keyType === 'button') {
        const index = parseInt(element.dataset.index);
        const keyId = `button-${index}`;
        elements.activeKeyTitle.textContent = T.viz_button + index;
        activeKeyData = { type: 'button', id: keyId, index: index };
        loadKeyConfiguration(configState[currentLayer][keyId]);
    } else if (keyType === 'knob') {
        const index = parseInt(element.dataset.index);
        let action = 'cw';
        if (activeKeyData && activeKeyData.knobIndex === index && activeKeyData.action) {
            action = activeKeyData.action;
        }
        showKnobActionSelector(index, action);
    } else if (keyType === 'dial_action') {
        const keyId = element.dataset.keyId;
        const label = element.dataset.label;
        elements.activeKeyTitle.textContent = label;
        activeKeyData = { type: 'knob', id: keyId };
        loadKeyConfiguration(configState[currentLayer][keyId]);
    }
}

function showKnobActionSelector(knobIndex, defaultAction = 'cw') {
    const T = TRANSLATIONS[currentLang];
    elements.activeKeyTitle.innerHTML = `
        ${T.viz_knobLabel} ${knobIndex + 1}:
        <select id="select-knob-action" style="padding: 0.2rem 0.4rem; font-size: 0.8rem; border-radius: 4px; margin-left: 0.25rem;">
            <option value="ccw"   ${defaultAction === 'ccw'   ? 'selected' : ''}>${T.viz_rotCCW}</option>
            <option value="press" ${defaultAction === 'press' ? 'selected' : ''}>${T.viz_pressBtn}</option>
            <option value="cw" ${defaultAction === 'cw' ? 'selected' : ''}>${T.viz_rotCW}</option>
        </select>
    `;
    
    const actionSelect = document.getElementById('select-knob-action');
    
    const updateActiveKnobData = () => {
        const action = actionSelect.value;
        const keyId = `knob-${knobIndex}-${action}`;
        activeKeyData = { type: 'knob', id: keyId, knobIndex: knobIndex, action: action };
        
        // Rotate visual dial for fun!
        const dial = document.getElementById(`dial-knob-${knobIndex}`);
        if (dial) {
            if (action === 'ccw') dial.style.transform = 'rotate(-45deg)';
            if (action === 'press') dial.style.transform = 'rotate(0deg)';
            if (action === 'cw') dial.style.transform = 'rotate(45deg)';
        }
        
        loadKeyConfiguration(configState[currentLayer][keyId]);
    };
    
    actionSelect.addEventListener('change', updateActiveKnobData);
    updateActiveKnobData();
}

// Load configurations into sidebar panels
function loadKeyConfiguration(binding) {
    if (!binding || binding.type === 'none') {
        // Reset to default empty forms
        elements.keyCaptureValue.textContent = TRANSLATIONS[currentLang].lblShortcutValue;
        elements.keyCaptureValue.style.color = 'var(--text-muted)';
        elements.selectMedia.value = 'none';
        
        // Reset Keyboard Tab
        syncKeyboardManualInputs(0, 0);
        
        // Reset Mouse Tab
        if (elements.selectMouseAction) elements.selectMouseAction.value = 'none';
        if (elements.mouseCustomSettings) elements.mouseCustomSettings.style.display = 'none';
        elements.selectMouseBtn.value = '0';
        elements.selectMouseWheel.value = '0';
        elements.inputMouseDx.value = '0';
        elements.inputMouseDy.value = '0';
        if (elements.chkMouseCtrl) elements.chkMouseCtrl.checked = false;
        if (elements.chkMouseShift) elements.chkMouseShift.checked = false;
        if (elements.chkMouseAlt) elements.chkMouseAlt.checked = false;
        
        // Show first tab
        switchTab('keyboard');
        return;
    }
    
    switchTab(binding.type);
    
    if (binding.type === 'keyboard') {
        const modStrings = [];
        window.KeyboardCodes.MODIFIERS.forEach(m => {
            if ((binding.modifiers & m.value) === m.value) {
                modStrings.push(m.label);
            }
        });
        const keyLabel = window.KeyboardCodes.KEYCODES[binding.code] || `0x${binding.code.toString(16)}`;
        elements.keyCaptureValue.textContent = [...modStrings, keyLabel].join(' + ');
        elements.keyCaptureValue.style.color = 'var(--accent-cyan)';
        
        // Sync manual inputs
        syncKeyboardManualInputs(binding.modifiers || 0, binding.code || 0);
        
    } else if (binding.type === 'media') {
        elements.selectMedia.value = binding.code.toString();
        
    } else if (binding.type === 'mouse') {
        // Reset keyboard manual inputs just in case
        syncKeyboardManualInputs(0, 0);
        
        // Unpack preset or custom mode
        let matchedPreset = 'custom';
        for (const [name, preset] of Object.entries(MOUSE_PRESETS)) {
            if (binding.button === preset.button &&
                binding.wheel === preset.wheel &&
                binding.dx === preset.dx &&
                binding.dy === preset.dy &&
                (binding.modifiers || 0) === (preset.modifiers || 0)) {
                matchedPreset = name;
                break;
            }
        }
        
        if (elements.selectMouseAction) {
            elements.selectMouseAction.value = matchedPreset;
        }
        
        elements.selectMouseBtn.value = (binding.button || 0).toString();
        elements.selectMouseWheel.value = (binding.wheel || 0).toString();
        elements.inputMouseDx.value = (binding.dx || 0).toString();
        elements.inputMouseDy.value = (binding.dy || 0).toString();
        if (elements.chkMouseCtrl) elements.chkMouseCtrl.checked = ((binding.modifiers || 0) & 0x01) === 0x01;
        if (elements.chkMouseShift) elements.chkMouseShift.checked = ((binding.modifiers || 0) & 0x02) === 0x02;
        if (elements.chkMouseAlt) elements.chkMouseAlt.checked = ((binding.modifiers || 0) & 0x04) === 0x04;
        
        if (elements.mouseCustomSettings) {
            elements.mouseCustomSettings.style.display = (matchedPreset === 'custom') ? 'flex' : 'none';
        }
    }
}

// Switch tabs inside config sidebar
function switchTab(tabId) {
    // Allow fallback for none type
    const activeTab = tabId === 'none' ? 'keyboard' : tabId;
    
    elements.tabs.forEach(tab => {
        if (tab.dataset.tab === activeTab) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    elements.tabContents.forEach(content => {
        if (content.id === `tab-${activeTab}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Key Capturing Listeners
let isListeningToKeys = false;
let capturedShortcut = { modifiers: 0, code: 0 };

elements.keyCaptureBox.addEventListener('click', () => {
    if (!isListeningToKeys) {
        isListeningToKeys = true;
        elements.keyCaptureBox.classList.add('listening');
        elements.keyCaptureStatus.textContent = TRANSLATIONS[currentLang].lblShortcutListening;
        elements.keyCaptureValue.textContent = '...';
        elements.keyCaptureValue.style.color = 'var(--accent-cyan)';
        capturedShortcut = { modifiers: 0, code: 0 };
    } else {
        isListeningToKeys = false;
        elements.keyCaptureBox.classList.remove('listening');
        elements.keyCaptureStatus.textContent = TRANSLATIONS[currentLang].lblShortcutCaptured;
        
        // Sync to manual inputs
        syncKeyboardManualInputs(capturedShortcut.modifiers, capturedShortcut.code);
        
        // Update State
        saveCurrentBinding({
            type: 'keyboard',
            modifiers: capturedShortcut.modifiers,
            code: capturedShortcut.code
        });
    }
});

// Capture global keydown events when listening
window.addEventListener('keydown', (e) => {
    if (!isListeningToKeys) return;
    
    // Prevent default browser shortcuts (like Ctrl+S, Ctrl+P, Tab, etc.) when configuring keys
    e.preventDefault();
    
    // Determine active modifiers (including Left/Right differences)
    let modifiers = 0;
    if (e.ctrlKey) {
        if (e.code === 'ControlRight') modifiers |= 0x10;
        else if (e.code === 'ControlLeft' || !e.code.endsWith('Right')) modifiers |= 0x01;
    }
    if (e.shiftKey) {
        if (e.code === 'ShiftRight') modifiers |= 0x20;
        else if (e.code === 'ShiftLeft' || !e.code.endsWith('Right')) modifiers |= 0x02;
    }
    if (e.altKey) {
        if (e.code === 'AltRight') modifiers |= 0x40;
        else if (e.code === 'AltLeft' || !e.code.endsWith('Right')) modifiers |= 0x04;
    }
    if (e.metaKey) {
        if (e.code === 'MetaRight') modifiers |= 0x80;
        else if (e.code === 'MetaLeft' || !e.code.endsWith('Right')) modifiers |= 0x08;
    }
    
    // Check if key is a standalone modifier
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        capturedShortcut.modifiers = modifiers;
        
        const modStrings = [];
        window.KeyboardCodes.MODIFIERS.forEach(m => {
            if ((modifiers & m.value) === m.value) {
                modStrings.push(currentLang === 'ru' && m.labelRu ? m.labelRu : m.label);
            }
        });
        
        const isRu = (currentLang === 'ru');
        let keyLabel = '...';
        if (capturedShortcut.code) {
            keyLabel = window.KeyboardCodes.KEYCODES[capturedShortcut.code] || `0x${capturedShortcut.code.toString(16)}`;
            if (isRu) {
                const ruKeyLabels = {
                    'Right Arrow': 'Стрелка вправо',
                    'Left Arrow': 'Стрелка влево',
                    'Down Arrow': 'Стрелка вниз',
                    'Up Arrow': 'Стрелка вверх',
                    'Space': 'Пробел'
                };
                if (ruKeyLabels[keyLabel]) keyLabel = ruKeyLabels[keyLabel];
            }
        }
        
        elements.keyCaptureValue.textContent = [...modStrings, keyLabel].join(' + ');
        return;
    }
    
    // Map browser key down event code to USB HID keycode
    const hidCode = window.KeyboardCodes.BROWSER_CODE_MAP[e.code];
    if (!hidCode) {
        log(`Unrecognised keyboard key: ${e.code}`, 'error');
        elements.keyCaptureStatus.textContent = TRANSLATIONS[currentLang].lblShortcutNotSupported;
        return;
    }
    
    capturedShortcut = { modifiers, code: hidCode };
    
    const label = getBindingLabel({ type: 'keyboard', modifiers, code: hidCode });
    elements.keyCaptureValue.textContent = label;
});

// Sync manual checkboxes and select key
function syncKeyboardManualInputs(modifiers, code) {
    if (elements.chkCtrl) elements.chkCtrl.checked = (modifiers & 0x01) === 0x01;
    if (elements.chkShift) elements.chkShift.checked = (modifiers & 0x02) === 0x02;
    if (elements.chkAlt) elements.chkAlt.checked = (modifiers & 0x04) === 0x04;
    if (elements.chkWin) elements.chkWin.checked = (modifiers & 0x08) === 0x08;
    if (elements.chkRCtrl) elements.chkRCtrl.checked = (modifiers & 0x10) === 0x10;
    if (elements.chkRShift) elements.chkRShift.checked = (modifiers & 0x20) === 0x20;
    if (elements.chkRAlt) elements.chkRAlt.checked = (modifiers & 0x40) === 0x40;
    if (elements.chkRWin) elements.chkRWin.checked = (modifiers & 0x80) === 0x80;
    
    if (elements.selectKeyboardKey) elements.selectKeyboardKey.value = code.toString();
}

// Handle manual input changes
function handleManualKeyboardChange() {
    if (!activeKeyData) return;
    
    let modifiers = 0;
    if (elements.chkCtrl && elements.chkCtrl.checked) modifiers |= 0x01;
    if (elements.chkShift && elements.chkShift.checked) modifiers |= 0x02;
    if (elements.chkAlt && elements.chkAlt.checked) modifiers |= 0x04;
    if (elements.chkWin && elements.chkWin.checked) modifiers |= 0x08;
    if (elements.chkRCtrl && elements.chkRCtrl.checked) modifiers |= 0x10;
    if (elements.chkRShift && elements.chkRShift.checked) modifiers |= 0x20;
    if (elements.chkRAlt && elements.chkRAlt.checked) modifiers |= 0x40;
    if (elements.chkRWin && elements.chkRWin.checked) modifiers |= 0x80;
    
    const code = parseInt(elements.selectKeyboardKey.value) || 0;
    
    capturedShortcut = { modifiers, code };
    
    if (modifiers === 0 && code === 0) {
        saveCurrentBinding({ type: 'none' });
        elements.keyCaptureValue.textContent = TRANSLATIONS[currentLang].lblShortcutValue;
        elements.keyCaptureValue.style.color = 'var(--text-muted)';
        elements.keyCaptureStatus.textContent = TRANSLATIONS[currentLang].lblShortcutStatus;
    } else {
        saveCurrentBinding({
            type: 'keyboard',
            modifiers: modifiers,
            code: code
        });
        const label = getBindingLabel({ type: 'keyboard', modifiers, code });
        elements.keyCaptureValue.textContent = label;
        elements.keyCaptureValue.style.color = 'var(--accent-cyan)';
        elements.keyCaptureStatus.textContent = TRANSLATIONS[currentLang].lblShortcutConfiguredManually;
    }
}

// Bind change listeners to manual controls
[elements.chkCtrl, elements.chkShift, elements.chkAlt, elements.chkWin,
 elements.chkRCtrl, elements.chkRShift, elements.chkRAlt, elements.chkRWin,
 elements.selectKeyboardKey].forEach(el => {
    if (el) el.addEventListener('change', handleManualKeyboardChange);
});

// Clear key capture shortcut
elements.btnClearShortcut.addEventListener('click', () => {
    capturedShortcut = { modifiers: 0, code: 0 };
    elements.keyCaptureValue.textContent = TRANSLATIONS[currentLang].lblShortcutValue;
    elements.keyCaptureValue.style.color = 'var(--text-muted)';
    elements.keyCaptureStatus.textContent = TRANSLATIONS[currentLang].lblShortcutStatus;
    syncKeyboardManualInputs(0, 0);
    saveCurrentBinding({ type: 'none' });
});

// Update state on dropdown media change
elements.selectMedia.addEventListener('change', () => {
    const val = parseInt(elements.selectMedia.value);
    if (isNaN(val)) {
        saveCurrentBinding({ type: 'none' });
    } else {
        saveCurrentBinding({ type: 'media', code: val });
    }
});

// Update state on mouse settings changes
function handleMouseInputChange() {
    const button = parseInt(elements.selectMouseBtn.value);
    const wheel = parseInt(elements.selectMouseWheel.value);
    const dx = parseInt(elements.inputMouseDx.value) || 0;
    const dy = parseInt(elements.inputMouseDy.value) || 0;
    
    let modifiers = 0;
    if (elements.chkMouseCtrl && elements.chkMouseCtrl.checked) modifiers |= 0x01;
    if (elements.chkMouseShift && elements.chkMouseShift.checked) modifiers |= 0x02;
    if (elements.chkMouseAlt && elements.chkMouseAlt.checked) modifiers |= 0x04;
    
    if (button === 0 && wheel === 0 && dx === 0 && dy === 0) {
        saveCurrentBinding({ type: 'none' });
    } else {
        saveCurrentBinding({
            type: 'mouse',
            button,
            wheel,
            dx: Math.min(127, Math.max(-127, dx)),
            dy: Math.min(127, Math.max(-127, dy)),
            modifiers
        });
    }
}

// Handle preset dropdown action selection
function handleMousePresetChange() {
    if (!activeKeyData) return;
    
    const action = elements.selectMouseAction.value;
    
    if (action === 'custom') {
        elements.mouseCustomSettings.style.display = 'flex';
        handleMouseInputChange();
    } else {
        elements.mouseCustomSettings.style.display = 'none';
        
        const preset = MOUSE_PRESETS[action];
        if (!preset || (preset.button === 0 && preset.wheel === 0 && preset.dx === 0 && preset.dy === 0)) {
            saveCurrentBinding({ type: 'none' });
        } else {
            saveCurrentBinding({
                type: 'mouse',
                button: preset.button,
                wheel: preset.wheel,
                dx: preset.dx,
                dy: preset.dy,
                modifiers: preset.modifiers || 0
            });
        }
    }
}

if (elements.selectMouseAction) {
    elements.selectMouseAction.addEventListener('change', handleMousePresetChange);
}
elements.selectMouseBtn.addEventListener('change', handleMouseInputChange);
elements.selectMouseWheel.addEventListener('change', handleMouseInputChange);
if (elements.chkMouseCtrl) elements.chkMouseCtrl.addEventListener('change', handleMouseInputChange);
if (elements.chkMouseShift) elements.chkMouseShift.addEventListener('change', handleMouseInputChange);
if (elements.chkMouseAlt) elements.chkMouseAlt.addEventListener('change', handleMouseInputChange);
elements.inputMouseDx.addEventListener('change', handleMouseInputChange);
elements.inputMouseDy.addEventListener('change', handleMouseInputChange);

// Save current editing binding to global config state
function saveCurrentBinding(binding) {
    if (!activeKeyData) return;
    
    configState[currentLayer][activeKeyData.id] = binding;
    
    // Update Visualizer element text if label exists
    if (activeKeyElement) {
        const labelEl = activeKeyElement.querySelector('.key-label') || 
                        activeKeyElement.querySelector('.arrow-label') || 
                        activeKeyElement.querySelector('.center-btn-title');
        if (labelEl) {
            const displayLabel = getBindingLabel(binding);
            // Handle fallback labels for media dial layout
            const isRu = (currentLang === 'ru');
            const unboundLabel = isRu ? 'Не назначено' : 'Unbound';
            if (activeKeyElement.classList.contains('dial-action-arrow') && displayLabel === unboundLabel) {
                labelEl.textContent = activeKeyElement.dataset.label;
            } else if (activeKeyElement.classList.contains('dial-center-button') && displayLabel === unboundLabel) {
                labelEl.textContent = isRu ? 'Центральный клик' : 'Center Click';
            } else {
                labelEl.textContent = displayLabel;
            }
            labelEl.title = displayLabel;
        }
    }
}

// Clear selected key config
elements.btnClear.addEventListener('click', () => {
    if (!activeKeyData || !activeKeyData.id) return;
    
    configState[currentLayer][activeKeyData.id] = { type: 'none' };
    log(`Cleared binding for selected key (${activeKeyData.id.replace(/-/g, ' ')}).`, 'info');
    
    // Refresh visualizer
    renderKeypad();
    
    // Re-select key to refresh configuration panel inputs with empty configuration
    const keyId = activeKeyData.id;
    let newEl = document.getElementById(keyId);
    if (!newEl) {
        newEl = elements.keypadChassis.querySelector(`[data-key-id="${keyId}"]`);
    }
    if (newEl) {
        selectKey(newEl);
    }
});

// Clear all bindings for the current layer
elements.btnClearAll.addEventListener('click', () => {
    // Reset buttons
    for (let b = 1; b <= 12; b++) {
        configState[currentLayer][`button-${b}`] = { type: 'none' };
    }
    // Reset knobs
    for (let k = 0; k < 3; k++) {
        configState[currentLayer][`knob-${k}-ccw`] = { type: 'none' };
        configState[currentLayer][`knob-${k}-press`] = { type: 'none' };
        configState[currentLayer][`knob-${k}-cw`] = { type: 'none' };
    }
    
    log(`Cleared all bindings for Layer ${parseInt(currentLayer) + 1}.`, 'info');
    renderKeypad();
    
    // Deselect active
    if (activeKeyElement) {
        activeKeyElement.classList.remove('active');
        activeKeyElement = null;
        activeKeyData = null;
        elements.activeKeyTitle.textContent = TRANSLATIONS[currentLang].defaultActiveKey;
        elements.configPanel.style.pointerEvents = 'none';
        elements.configPanel.style.opacity = '0.5';
    }
    if (elements.btnClear) {
        elements.btnClear.disabled = true;
    }
});

// Import / Export JSON Profiles
elements.btnExport.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configState, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `keypad_profile_layer_${currentLayer + 1}.json`);
    dlAnchorElem.click();
    log("Configuration exported successfully.");
});

elements.btnImport.addEventListener('click', () => {
    elements.importFileInput.click();
});

elements.importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const importedConfig = JSON.parse(evt.target.result);
            // Simple validation of imported object
            if (typeof importedConfig === 'object') {
                configState = { ...configState, ...importedConfig };
                log("Profile imported successfully!", "success");
                renderKeypad();
                if (activeKeyElement) selectKey(activeKeyElement);
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            log(`Failed to parse profile JSON: ${err.message}`, "error");
        }
    };
    reader.readAsText(file);
});

// Populate dropdown lists & tabs at boot
function populateDropdowns() {
    const isRu = (currentLang === 'ru');
    // Populate Media codes select
    elements.selectMedia.innerHTML = `<option value="none">${isRu ? 'Нет' : 'None'}</option>`;
    window.KeyboardCodes.MEDIA_KEYS.forEach(k => {
        const option = document.createElement('option');
        option.value = k.value.toString();
        option.textContent = isRu && k.labelRu ? k.labelRu : k.label;
        elements.selectMedia.appendChild(option);
    });

    // Populate Keyboard keys select
    if (elements.selectKeyboardKey) {
        elements.selectKeyboardKey.innerHTML = `<option value="0">${isRu ? 'Нет' : 'None'}</option>`;
        const sortedKeys = Object.entries(window.KeyboardCodes.KEYCODES)
            .map(([codeStr, label]) => ({ code: parseInt(codeStr), label }))
            .sort((a, b) => a.label.localeCompare(b.label));

        sortedKeys.forEach(k => {
            const option = document.createElement('option');
            option.value = k.code.toString();
            option.textContent = k.label;
            elements.selectKeyboardKey.appendChild(option);
        });
    }
}

// Layout Switcher
elements.selectLayout.addEventListener('change', (e) => {
    currentLayout = e.target.value;
    localStorage.setItem('current_layout', currentLayout);
    log(`Layout switched to: ${elements.selectLayout.options[elements.selectLayout.selectedIndex].text}`);
    renderKeypad();
    // Reset key configurations sidebar selection
    activeKeyElement = null;
    activeKeyData = null;
    elements.activeKeyTitle.textContent = TRANSLATIONS[currentLang].defaultActiveKey;
    elements.configPanel.style.pointerEvents = 'none';
    elements.configPanel.style.opacity = '0.5';
    if (elements.btnClear) elements.btnClear.disabled = true;
});

// Model Switcher
elements.selectModel.addEventListener('change', (e) => {
    activeModel = e.target.value;
    localStorage.setItem('active_model', activeModel);
    log(`Device model override switched to: ${activeModel}`);
    updateLedControls();
});

const LED_MODE_LABELS = {
    default: {
        en: [
            "Off (Disable LEDs)",
            "Static Backlight",
            "Press Shock Mode",
            "Press Shock Alternate",
            "Press Fade Light",
            "White Backlight"
        ],
        ru: [
            "Выключено",
            "Статическая подсветка",
            "Режим отклика на нажатие",
            "Режим отклика (альтернативный)",
            "Затухание при нажатии",
            "Постоянный белый"
        ]
    },
    Ch57x_3: {
        en: [
            "Off (Disable LEDs)",
            "Static Backlight",
            "Colorloop",
            "Press Shock",
            "Fade Light",
            "Alternate Fade Light"
        ],
        ru: [
            "Выключено",
            "Статическая подсветка",
            "Цветовая волна",
            "Отклик на нажатие",
            "Плавно гаснет при нажатии",
            "Альтернативное затухание"
        ]
    }
};

// Flag: true while updateLedControls() is running, to suppress phantom change events
let _ledUpdating = false;

// Update visibility and option labels of LED controls
function updateLedControls() {
    // 1. Color Visibility
    const colorGroup = elements.ledColorsContainer.closest('.form-group');
    if (colorGroup) {
        if (activeModel === 'Ch57x_3') {
            colorGroup.style.display = 'none';
        } else {
            colorGroup.style.display = 'block';
        }
    }
    
    // 2. Mode Option Labels
    const labelsGroup = (activeModel === 'Ch57x_3') ? LED_MODE_LABELS.Ch57x_3 : LED_MODE_LABELS.default;
    const labels = labelsGroup[currentLang] || labelsGroup['en'];
    const select = elements.selectLedMode;
    if (select) {
        const currentVal = select.value;
        _ledUpdating = true; // Suppress LED send during label refresh
        Array.from(select.options).forEach((opt, idx) => {
            if (labels[idx] !== undefined) {
                opt.textContent = labels[idx];
            }
        });
        select.value = currentVal;
        _ledUpdating = false;
    }
}

// Layer Switcher
elements.selectLayer.addEventListener('change', (e) => {
    currentLayer = parseInt(e.target.value);
    log(`Switched to Layer ${currentLayer + 1}`);
    renderKeypad();
    // Refresh configuration details panel if key is selected
    if (activeKeyElement) {
        selectKey(activeKeyElement);
    }
});

// Switch tabs on click
elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        if (elements.configPanel.style.pointerEvents === 'none') return;
        const tabId = tab.dataset.tab;
        switchTab(tabId);
        
        // Save an empty action of that type immediately on tab switch to avoid configuration mismatches
        if (tabId === 'keyboard') {
            saveCurrentBinding({ type: 'keyboard', modifiers: 0, code: 0 });
            elements.keyCaptureValue.textContent = TRANSLATIONS[currentLang].lblShortcutValue;
            elements.keyCaptureValue.style.color = 'var(--text-muted)';
            syncKeyboardManualInputs(0, 0);
        } else if (tabId === 'media') {
            elements.selectMedia.value = 'none';
            saveCurrentBinding({ type: 'none' });
        } else if (tabId === 'mouse') {
            if (elements.selectMouseAction) elements.selectMouseAction.value = 'none';
            if (elements.mouseCustomSettings) elements.mouseCustomSettings.style.display = 'none';
            elements.selectMouseBtn.value = '0';
            elements.selectMouseWheel.value = '0';
            elements.inputMouseDx.value = '0';
            elements.inputMouseDy.value = '0';
            if (elements.chkMouseCtrl) elements.chkMouseCtrl.checked = false;
            if (elements.chkMouseShift) elements.chkMouseShift.checked = false;
            if (elements.chkMouseAlt) elements.chkMouseAlt.checked = false;
            saveCurrentBinding({ type: 'none' });
        }
    });
});

// WebHID Interface Core Logic
async function connectDevice() {
    try {
        log("Requesting USB HID device permissions from user...");
        const devices = await navigator.hid.requestDevice({
            filters: DEVICE_FILTERS
        });
        
        if (devices.length === 0) {
            log("No device selected.", "error");
            return;
        }
        
        // Log details of all returned devices to the console log
        log(`User selected/authorized ${devices.length} device interfaces:`);
        devices.forEach((d, idx) => {
            let desc = `Device [${idx}]: ${d.productName || 'Unknown'} (VID=0x${d.vendorId.toString(16)}, PID=0x${d.productId.toString(16)})`;
            if (d.collections && d.collections.length > 0) {
                const colls = d.collections.map(c => {
                    let s = `UsagePage=0x${c.usagePage.toString(16)}, Usage=0x${c.usage.toString(16)}`;
                    if (c.outputReports && c.outputReports.length > 0) {
                        s += ` [OutReports: ${c.outputReports.map(r => r.reportId).join(',')}]`;
                    }
                    if (c.inputReports && c.inputReports.length > 0) {
                        s += ` [InReports: ${c.inputReports.map(r => r.reportId).join(',')}]`;
                    }
                    return s;
                }).join(' | ');
                desc += ` - Collections: ${colls}`;
            } else {
                desc += ` - No collections info`;
            }
            log(desc);
        });

        // Find the device interface that corresponds to the custom configuration collection
        // Vendor-defined usage page is typically >= 0xff00 (65280)
        let configDevice = devices.find(d => 
            d.collections && d.collections.some(c => c.usagePage >= 0xff00)
        );
        
        // If not found by custom usage page, fallback to first interface
        if (!configDevice) {
            log("No vendor-defined interface (UsagePage >= 0xFF00) found, falling back to first interface...", "warning");
            configDevice = devices[0];
        } else {
            const matchedColl = configDevice.collections.find(c => c.usagePage >= 0xff00);
            log(`Selected configuration interface: UsagePage=0x${matchedColl.usagePage.toString(16)}, Usage=0x${matchedColl.usage.toString(16)}`, "success");
        }
        
        setupDevice(configDevice);
    } catch (err) {
        log(`WebHID connection failed: ${err.message}`, "error");
    }
}

async function setupDevice(device) {
    activeDevice = device;
    
    try {
        if (!activeDevice.opened) {
            await activeDevice.open();
        }
        
        // Initial handshake: write 64-byte zero report (required by some controllers to accept config packets)
        try {
            if (deviceSupportsReportId3()) {
                await activeDevice.sendReport(0x03, new Uint8Array(64));
            } else {
                await activeDevice.sendReport(0x00, new Uint8Array(64));
            }
        } catch (err) {
            log("Handshake skipped: " + err.message, "info");
        }
        
        // Update connection status UI
        const tConn = TRANSLATIONS[currentLang];
        elements.statusText.textContent = tConn.statusConnected + (activeDevice.productName || 'Macro Keyboard');
        elements.statusIndicator.className = 'status-indicator connected';
        elements.btnConnect.textContent = tConn.btnDisconnect;
        elements.btnConnect.classList.remove('btn-primary');
        elements.btnConnect.classList.add('btn-secondary');
        
        // Enable device controls
        elements.btnRead.disabled = false;
        elements.btnUpload.disabled = false;
        elements.selectLedMode.disabled = false;
        
        log(`Connected to device successfully: ${activeDevice.productName} [VID=${activeDevice.vendorId.toString(16)}, PID=${activeDevice.productId.toString(16)}]`, "success");
        
        // Auto-detect and switch layout based on Product ID (PID)
        let detectedLayout = '6x1'; // Default fallback
        if (activeDevice.vendorId === 0x1189) {
            if (activeDevice.productId === 0x8840 || activeDevice.productId === 0x8842 || activeDevice.productId === 0x8850) {
                detectedLayout = (activeDevice.productId === 0x8850) ? '12x2' : '3x1';
                activeModel = 'Ch57x_1';
            } else if (activeDevice.productId === 0x8890) {
                // Keep 'media_dial' if currently selected, since they share the same PID
                detectedLayout = (currentLayout === 'media_dial') ? 'media_dial' : '6x1';
                activeModel = 'Ch57x_2';
            }
        } else if (activeDevice.vendorId === 0x514c) {
            if (activeDevice.productId === 0x8850) {
                detectedLayout = 'media_dial';
                activeModel = 'Ch57x_3';
            }
        }
        
        elements.selectLayout.value = detectedLayout;
        if (elements.selectModel) {
            elements.selectModel.value = activeModel;
        }
        localStorage.setItem('active_model', activeModel);
        currentLayout = detectedLayout;
        localStorage.setItem('current_layout', currentLayout);
        renderKeypad();
        updateLedControls();
        log(`Auto-detected keyboard model: ${activeModel}, layout: ${elements.selectLayout.options[elements.selectLayout.selectedIndex].text} based on Product ID 0x${activeDevice.productId.toString(16)}.`);
        
        // Setup packet listner for debug logs and query resolutions
        activeDevice.addEventListener('inputreport', (event) => {
            const { data, reportId } = event;
            const bytes = new Uint8Array(data.buffer);
            
            // Check if this matches a pending query response
            let keyNum, typeCode;
            if (activeModel === 'Ch57x_3') {
                if (bytes[0] === 0xfd || bytes[0] === 0xfa) {
                    keyNum = bytes[1];
                    const layer = bytes[2];
                    const type = bytes[3];
                    typeCode = (layer << 4) | type;
                } else {
                    keyNum = bytes[0];
                    typeCode = bytes[1];
                }
            } else {
                keyNum = bytes[0];
                typeCode = bytes[1];
            }
            const queryKeyName = `${keyNum}-${typeCode}`;
            
            if (activeQueries[queryKeyName]) {
                activeQueries[queryKeyName](bytes);
                delete activeQueries[queryKeyName];
            }
            
            const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
            // debug(`Received HID Report ID ${reportId}: ${hex}`);
        });
        
        // Auto-read device configuration upon connection
        await readConfigFromDevice();
        
    } catch (err) {
        log(`Failed to open HID device: ${err.message}`, "error");
        disconnectDevice();
    }
}

function disconnectDevice() {
    if (activeDevice) {
        activeDevice.close();
        activeDevice = null;
    }
    
    const tDisc = TRANSLATIONS[currentLang];
    
    // Update UI Status
    elements.statusText.textContent = tDisc.statusDisconnected;
    elements.statusIndicator.className = 'status-indicator disconnected';
    elements.btnConnect.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        ${tDisc.btnConnect}
    `;
    elements.btnConnect.classList.remove('btn-secondary');
    elements.btnConnect.classList.add('btn-primary');
    
    // Disable device commands
    elements.btnRead.disabled = true;
    elements.btnUpload.disabled = true;
    elements.selectLedMode.disabled = true;
    
    log(tDisc.statusDisconnected + ".", "info");
}

elements.btnConnect.addEventListener('click', () => {
    if (activeDevice) {
        disconnectDevice();
    } else {
        connectDevice();
    }
});

// Handle auto connection at boot if already granted permission
navigator.hid.getDevices().then(devices => {
    const matching = devices.filter(d => 
        DEVICE_FILTERS.some(f => f.vendorId === d.vendorId && f.productId === d.productId)
    );
    if (matching.length > 0) {
        log("Auto-connecting to previously authorised macro pad...");
        let configDevice = matching.find(d => 
            d.collections && d.collections.some(c => c.usagePage >= 0xff00)
        );
        if (!configDevice) {
            configDevice = matching[0];
        } else {
            const matchedColl = configDevice.collections.find(c => c.usagePage >= 0xff00);
            log(`Selected configuration interface: UsagePage=0x${matchedColl.usagePage.toString(16)}, Usage=0x${matchedColl.usage.toString(16)}`, "success");
        }
        setupDevice(configDevice);
    }
});

// Monitor device connect/disconnect events
navigator.hid.addEventListener('connect', (e) => {
    log(`HID device plugged in: ${e.device.productName}`, "info");
    if (!activeDevice) {
        const d = e.device;
        const isTarget = DEVICE_FILTERS.some(f => f.vendorId === d.vendorId && f.productId === d.productId);
        if (isTarget) {
            const isConfigInterface = d.collections && d.collections.some(c => c.usagePage >= 0xff00);
            if (isConfigInterface) {
                log(`Auto-connecting to configuration interface of plugged-in device...`);
                setupDevice(d);
            }
        }
    }
});

navigator.hid.addEventListener('disconnect', (e) => {
    log(`HID device removed: ${e.device.productName}`, "info");
    if (activeDevice && activeDevice.vendorId === e.device.vendorId && activeDevice.productId === e.device.productId) {
        disconnectDevice();
    }
});

// Helper to translate keyId into device key number
function getKeyNum(keyId) {
    if (currentLayout === 'media_dial') {
        if (keyId === 'knob-0-ccw') return 8;  // Lower CCW
        if (keyId === 'knob-0-cw') return 7;   // Lower CW
        if (keyId === 'knob-0-press') return 3;// Center Press
        if (keyId === 'knob-1-ccw') return 4;  // Upper CCW
        if (keyId === 'knob-1-cw') return 2;   // Upper CW
        return 0;
    }
    if (keyId.startsWith('button-')) {
        const idx = parseInt(keyId.split('-')[1]);
        return idx; // e.g. button-1 -> 1
    } else if (keyId.startsWith('knob-')) {
        const parts = keyId.split('-'); // e.g. knob-0-ccw
        const k = parseInt(parts[1]);
        const action = parts[2];
        const actionIdx = action === 'ccw' ? 0 : (action === 'press' ? 1 : 2);
        
        let base = 12;
        if (activeModel === 'Ch57x_1') base = 15;
        else if (activeModel === 'Ch57x_3') base = 16;
        
        return base + 1 + 3 * k + actionIdx;
    }
    return 0;
}

// Upload configurations to hardware via WebHID reports
async function uploadToDevice() {
    if (!activeDevice) {
        log("Cannot upload: device not connected.", "error");
        return;
    }
    
    log(`Preparing configuration packets for Layer ${currentLayer + 1} using model ${activeModel}...`);
    const layout = getLayoutConfig(currentLayout);
    const packets = [];
    
    // Helper to add padded 64-byte packets
    function queuePacket(msgBytes) {
        const buf = new Uint8Array(64);
        buf.set(msgBytes);
        packets.push(buf);
    }
    
    // Helper key binding serializer
    function serializeBinding(keyId) {
        const keyNum = getKeyNum(keyId);
        let binding = configState[currentLayer][keyId];
        if (!binding || binding.type === 'none') {
            binding = { type: 'keyboard', code: 0, modifiers: 0 };
        }
        
        const modifiers = binding.modifiers || 0;
        
        if (activeModel === 'Ch57x_2') {
            // Ch57x_2 (K8890) serialization
            // 1. Send start command for this key binding
            queuePacket([0x03, 0xfe, currentLayer + 1, 0x01, 0x01, 0, 0, 0, 0]);
            
            // 2. Send binding data
            if (binding.type === 'keyboard') {
                const type = 0x01;
                const comboLen = 1;
                
                // Packet 1 (empty combo item)
                queuePacket([
                    0x03, keyNum, ((currentLayer + 1) << 4) | type,
                    comboLen, 0, 0, 0, 0, 0
                ]);
                
                // Packet 2 (shortcut keys)
                queuePacket([
                    0x03, keyNum, ((currentLayer + 1) << 4) | type,
                    comboLen, 1, modifiers, binding.code, 0, 0
                ]);
            } else if (binding.type === 'media') {
                const type = 0x02;
                const low = binding.code & 0xff;
                const high = (binding.code >> 8) & 0xff;
                queuePacket([
                    0x03, keyNum, ((currentLayer + 1) << 4) | type,
                    low, high, 0, 0, 0, 0
                ]);
            } else if (binding.type === 'mouse') {
                const type = 0x03;
                const dxByte = binding.dx < 0 ? (256 + binding.dx) : binding.dx;
                const dyByte = binding.dy < 0 ? (256 + binding.dy) : binding.dy;
                const wheelByte = binding.wheel < 0 ? (256 + binding.wheel) : binding.wheel;
                queuePacket([
                    0x03, keyNum, ((currentLayer + 1) << 4) | type,
                    binding.button, dxByte, dyByte, wheelByte, modifiers, 0
                ]);
            }
            
            // 3. Send finish command for this key binding
            queuePacket([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);
            
        } else if (activeModel === 'Ch57x_1') {
            // Ch57x_1 (K884x) serialization
            if (binding.type === 'keyboard') {
                const type = 0x01;
                queuePacket([
                    0x03, 0xfe, keyNum, currentLayer + 1, type,
                    0, 0, 0, 0, 0, 1, modifiers, binding.code
                ]);
            } else if (binding.type === 'media') {
                const type = 0x02;
                const low = binding.code & 0xff;
                const high = (binding.code >> 8) & 0xff;
                queuePacket([
                    0x03, 0xfe, keyNum, currentLayer + 1, type,
                    0, 0, 0, 0, 0, 0, low, high
                ]);
            } else if (binding.type === 'mouse') {
                const type = 0x03;
                const dxByte = binding.dx < 0 ? (256 + binding.dx) : binding.dx;
                const dyByte = binding.dy < 0 ? (256 + binding.dy) : binding.dy;
                const wheelByte = binding.wheel < 0 ? (256 + binding.wheel) : binding.wheel;
                
                let mouseMod = 0;
                if ((modifiers & 0x01) === 0x01) mouseMod = 1;
                else if ((modifiers & 0x02) === 0x02) mouseMod = 2;
                else if ((modifiers & 0x04) === 0x04) mouseMod = 4;
                
                if (binding.button) {
                    queuePacket([
                        0x03, 0xfe, keyNum, currentLayer + 1, type,
                        0, 0, 0, 0, 0, 1, mouseMod, binding.button
                    ]);
                } else if (binding.wheel) {
                    queuePacket([
                        0x03, 0xfe, keyNum, currentLayer + 1, type,
                        0, 0, 0, 0, 0, 3, mouseMod, 0, 0, 0, wheelByte
                    ]);
                } else {
                    queuePacket([
                        0x03, 0xfe, keyNum, currentLayer + 1, type,
                        0, 0, 0, 0, 0, 5, mouseMod, 0, dxByte, dyByte
                    ]);
                }
            }
            
            // Finish and finalize for this key binding
            queuePacket([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);
            queuePacket([0x03, 0xfd, 0xfe, 0xff]);
            queuePacket([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);
            
        } else if (activeModel === 'Ch57x_3') {
            // Ch57x_3 (K8850 4x4) serialization
            if (binding.type === 'keyboard') {
                const type = 0x01;
                if (modifiers === 0 && binding.code) {
                    // Single key compact mode
                    queuePacket([
                        0x03, 0xfd, keyNum, currentLayer + 1, type,
                        0x00, 0x01, 0x00, 0x00, binding.code, 0x00
                    ]);
                } else {
                    // Triplet mode: [keycode, 0x00, 0x32] per entry
                    const keySequence = [];
                    const mods = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];
                    const modValMapping = [0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8];
                    mods.forEach((m, idx) => {
                        if ((modifiers & m) === m) {
                            keySequence.push(modValMapping[idx], 0, 0x32);
                        }
                    });
                    if (binding.code) {
                        keySequence.push(binding.code, 0, 0x32);
                    }
                    
                    const p = [0x03, 0xfd, keyNum, currentLayer + 1, type, 0, keySequence.length / 3, 0, 0];
                    p.push(...keySequence);
                    queuePacket(p);
                }
            } else if (binding.type === 'media') {
                const type = 0x02;
                const low = binding.code & 0xff;
                const high = (binding.code >> 8) & 0xff;
                queuePacket([
                    0x03, 0xfd, keyNum, currentLayer + 1, type,
                    0, 4, 0, 0,
                    low, 0, 0,
                    high, 0, 0,
                    0, 0, 0,
                    0, 0, 0
                ]);
            } else if (binding.type === 'mouse') {
                const type = 0x03;
                const dxByte = binding.dx < 0 ? (256 + binding.dx) : binding.dx;
                const dyByte = binding.dy < 0 ? (256 + binding.dy) : binding.dy;
                const wheelByte = binding.wheel < 0 ? (256 + binding.wheel) : binding.wheel;
                
                const mouseData = new Uint8Array(17);
                mouseData[0] = 1;
                mouseData[1] = 4;
                
                let mouseMod = 0;
                if ((modifiers & 0x01) === 0x01) mouseMod = 0xf1;
                else if ((modifiers & 0x02) === 0x02) mouseMod = 0xf2;
                else if ((modifiers & 0x04) === 0x04) mouseMod = 0xf3;
                mouseData[4] = mouseMod;
                
                if (binding.button) {
                    mouseData[7] = binding.button;
                } else if (binding.wheel) {
                    mouseData[16] = wheelByte;
                } else {
                    mouseData[10] = dxByte;
                    mouseData[13] = dyByte;
                }
                
                const p = [0x03, 0xfd, keyNum, currentLayer + 1, type];
                p.push(...mouseData);
                queuePacket(p);
            }
            
            // Finalize command for this key binding
            queuePacket([0x03, 0xfd, 0xfe, 0xff]);
        }
    }
    
    // Serialize all buttons of selected layout
    for (let b = 1; b <= layout.keys; b++) {
        serializeBinding(`button-${b}`);
    }
    
    // Serialize all knobs of selected layout
    for (let k = 0; k < layout.knobs; k++) {
        serializeBinding(`knob-${k}-ccw`);
        serializeBinding(`knob-${k}-press`);
        serializeBinding(`knob-${k}-cw`);
    }
    
    // Send packets one by one with a small delay
    try {
        log(`Uploading ${packets.length} packets...`);
        for (let i = 0; i < packets.length; i++) {
            const p = packets[i];
            const hex = Array.from(p).map(b => b.toString(16).padStart(2, '0')).join(' ');
            log(`TX [${i + 1}/${packets.length}]: ${hex.substring(0, 30)}...`, 'tx');
            
            // WebHID: sendReport(reportId, data_excluding_reportId)
            // p[0] is Report ID (0x03)
            if (deviceSupportsReportId3()) {
                const payload = new Uint8Array(64);
                payload.set(p.subarray(1));
                await activeDevice.sendReport(p[0], payload);
            } else {
                await activeDevice.sendReport(0x00, p);
            }
            // Small sleep to ensure device buffer catches up
            await new Promise(r => setTimeout(r, 10));
        }
        log("Layer configuration uploaded to device successfully!", "success");
    } catch (err) {
        log(`Upload failed: ${err.message}`, "error");
    }
}
elements.btnUpload.addEventListener('click', uploadToDevice);

// ═══════════════════════════════════════════════════════════════════════════
// PROFILES SYSTEM
// Stores named profiles (each with pre-serialized HID packets per layer).
// Browser computes packets; daemon replays them without browser being open.
// ═══════════════════════════════════════════════════════════════════════════

const DAEMON_URL = 'http://localhost:8001';

// Profiles stored in localStorage: [{ id, name, icon, color, rules, layers, packets }]
let appProfiles = JSON.parse(localStorage.getItem('app_profiles') || 'null') || getDefaultProfiles();
let activeProfileId = localStorage.getItem('active_profile_id') || null;
let daemonStatus = { connected: false, device_connected: false, active_profile_id: null };
let windowPollingInterval = null;

function createBlankConfig() {
    const blankConfig = {};
    for (let layer = 0; layer < 4; layer++) {
        blankConfig[layer] = {};
        for (let b = 1; b <= 12; b++) {
            blankConfig[layer][`button-${b}`] = { type: 'none' };
        }
        for (let k = 0; k < 3; k++) {
            blankConfig[layer][`knob-${k}-ccw`] = { type: 'none' };
            blankConfig[layer][`knob-${k}-press`] = { type: 'none' };
            blankConfig[layer][`knob-${k}-cw`] = { type: 'none' };
        }
    }
    return blankConfig;
}

function getDefaultProfiles() {
    return [
        { id: 'spotify',   name: 'Spotify',        icon: '\uD83C\uDFB5', color: '#1DB954', rules: ['Spotify.exe', 'spotify'],                                                       layers: createBlankConfig() },
        { id: 'chrome',    name: '\u0411\u0440\u0430\u0443\u0437\u0435\u0440',  icon: '\uD83C\uDF10', color: '#4285F4', rules: ['chrome.exe', 'firefox.exe', 'msedge.exe', 'brave.exe', 'opera.exe'], layers: createBlankConfig() },
        { id: 'discord',   name: 'Discord',         icon: '\uD83D\uDCAC', color: '#5865F2', rules: ['Discord.exe'],                                                                  layers: createBlankConfig() },
        { id: 'photoshop', name: 'Photoshop',       icon: '\uD83C\uDFA8', color: '#31A8FF', rules: ['Photoshop.exe'],                                                                layers: createBlankConfig() },
        { id: 'premiere',  name: 'Premiere Pro',    icon: '\uD83C\uDFAC', color: '#EA77FF', rules: ['Adobe Premiere Pro.exe'],                                                       layers: createBlankConfig() },
        { id: 'obs',       name: 'OBS Studio',      icon: '\uD83D\uDCF9', color: '#302E31', rules: ['obs64.exe', 'obs.exe'],                                                         layers: createBlankConfig() },
        { id: 'default',   name: '\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E', icon: '\u2328\uFE0F', color: '#888888', rules: [], layers: createBlankConfig() },
    ];
}

function saveProfilesToStorage() {
    localStorage.setItem('app_profiles', JSON.stringify(appProfiles));
    if (activeProfileId) localStorage.setItem('active_profile_id', activeProfileId);
}

// ── Packet serialization helper (mirrors uploadToDevice but returns packets array)
function buildPacketsForLayer(layerIdx, targetLayers = null) {
    const layout = getLayoutConfig(currentLayout);
    const savedLayer = currentLayer;
    // Temporarily switch layer context for serialization
    currentLayer = layerIdx;

    const packets = [];
    const sourceConfig = targetLayers || configState;

    function queuePacket(msgBytes) {
        const buf = new Uint8Array(65); // report_id + 64 bytes
        buf[0] = 0x03;
        
        let startIdx = 0;
        if (msgBytes.length > 0 && msgBytes[0] === 0x03) {
            startIdx = 1;
        }
        
        for (let i = startIdx; i < msgBytes.length && (i - startIdx) < 64; i++) {
            buf[(i - startIdx) + 1] = msgBytes[i];
        }
        packets.push(Array.from(buf));
    }

    function serializeBindingForProfile(keyId) {
        const keyNum = getKeyNum(keyId);
        let binding = sourceConfig[layerIdx]?.[keyId];
        if (!binding || binding.type === 'none') {
            binding = { type: 'keyboard', code: 0, modifiers: 0 };
        }
        const modifiers = binding.modifiers || 0;

        if (activeModel === 'Ch57x_2') {
            queuePacket([0x03, 0xfe, layerIdx + 1, 0x01, 0x01, 0, 0, 0, 0]);
            if (binding.type === 'keyboard') {
                queuePacket([0x03, keyNum, ((layerIdx + 1) << 4) | 0x01, 1, 0, 0, 0, 0, 0]);
                queuePacket([0x03, keyNum, ((layerIdx + 1) << 4) | 0x01, 1, 1, modifiers, binding.code, 0, 0]);
            } else if (binding.type === 'media') {
                queuePacket([0x03, keyNum, ((layerIdx + 1) << 4) | 0x02, binding.code & 0xff, (binding.code >> 8) & 0xff, 0, 0, 0, 0]);
            } else if (binding.type === 'mouse') {
                const dx = binding.dx < 0 ? 256 + binding.dx : binding.dx;
                const dy = binding.dy < 0 ? 256 + binding.dy : binding.dy;
                const wh = binding.wheel < 0 ? 256 + binding.wheel : binding.wheel;
                queuePacket([0x03, keyNum, ((layerIdx + 1) << 4) | 0x03, binding.button, dx, dy, wh, modifiers, 0]);
            }
            queuePacket([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);

        } else if (activeModel === 'Ch57x_1') {
            if (binding.type === 'keyboard') {
                queuePacket([0x03, 0xfe, keyNum, layerIdx + 1, 0x01, 0, 0, 0, 0, 0, 1, modifiers, binding.code]);
            } else if (binding.type === 'media') {
                queuePacket([0x03, 0xfe, keyNum, layerIdx + 1, 0x02, 0, 0, 0, 0, 0, 0, binding.code & 0xff, (binding.code >> 8) & 0xff]);
            } else if (binding.type === 'mouse') {
                const dx = binding.dx < 0 ? 256 + binding.dx : binding.dx;
                const dy = binding.dy < 0 ? 256 + binding.dy : binding.dy;
                const wh = binding.wheel < 0 ? 256 + binding.wheel : binding.wheel;
                let mm = 0;
                if ((modifiers & 0x01) === 0x01) mm = 1;
                else if ((modifiers & 0x02) === 0x02) mm = 2;
                else if ((modifiers & 0x04) === 0x04) mm = 4;
                if (binding.button) queuePacket([0x03, 0xfe, keyNum, layerIdx + 1, 0x03, 0, 0, 0, 0, 0, 1, mm, binding.button]);
                else if (binding.wheel) queuePacket([0x03, 0xfe, keyNum, layerIdx + 1, 0x03, 0, 0, 0, 0, 0, 3, mm, 0, 0, 0, wh]);
                else queuePacket([0x03, 0xfe, keyNum, layerIdx + 1, 0x03, 0, 0, 0, 0, 0, 5, mm, 0, dx, dy]);
            }
            queuePacket([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);
            queuePacket([0x03, 0xfd, 0xfe, 0xff]);
            queuePacket([0x03, 0xaa, 0xaa, 0, 0, 0, 0, 0, 0]);

        } else if (activeModel === 'Ch57x_3') {
            if (binding.type === 'keyboard') {
                if (modifiers === 0 && binding.code) {
                    queuePacket([0x03, 0xfd, keyNum, layerIdx + 1, 0x01, 0, 1, 0, 0, binding.code, 0]);
                } else {
                    const seq = [];
                    const mods = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80];
                    const mVals= [0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8];
                    mods.forEach((m, i) => { if ((modifiers & m) === m) seq.push(mVals[i], 0, 0x32); });
                    if (binding.code) seq.push(binding.code, 0, 0x32);
                    queuePacket([0x03, 0xfd, keyNum, layerIdx + 1, 0x01, 0, seq.length / 3, 0, 0, ...seq]);
                }
            } else if (binding.type === 'media') {
                queuePacket([0x03, 0xfd, keyNum, layerIdx + 1, 0x02, 0, 4, 0, 0, binding.code & 0xff, 0, 0, (binding.code >> 8) & 0xff, 0, 0, 0, 0, 0, 0, 0, 0]);
            } else if (binding.type === 'mouse') {
                const dx = binding.dx < 0 ? 256 + binding.dx : binding.dx;
                const dy = binding.dy < 0 ? 256 + binding.dy : binding.dy;
                const wh = binding.wheel < 0 ? 256 + binding.wheel : binding.wheel;
                const md = new Uint8Array(17);
                md[0] = 1; md[1] = 4;
                let mm = 0;
                if ((modifiers & 0x01) === 0x01) mm = 0xf1;
                else if ((modifiers & 0x02) === 0x02) mm = 0xf2;
                else if ((modifiers & 0x04) === 0x04) mm = 0xf3;
                md[4] = mm;
                if (binding.button) md[7] = binding.button;
                else if (binding.wheel) md[16] = wh;
                else { md[10] = dx; md[13] = dy; }
                queuePacket([0x03, 0xfd, keyNum, layerIdx + 1, 0x03, ...md]);
            }
            queuePacket([0x03, 0xfd, 0xfe, 0xff]);
        }
    }

    for (let b = 1; b <= layout.keys; b++) serializeBindingForProfile(`button-${b}`);
    for (let k = 0; k < layout.knobs; k++) {
        serializeBindingForProfile(`knob-${k}-ccw`);
        serializeBindingForProfile(`knob-${k}-press`);
        serializeBindingForProfile(`knob-${k}-cw`);
    }

    currentLayer = savedLayer;
    return packets;
}

function buildPacketsForAllLayers(targetLayers = null) {
    const result = {};
    for (let layer = 0; layer < 4; layer++) {
        result[layer] = buildPacketsForLayer(layer, targetLayers);
    }
    return result;
}

// ── Profile: save current config as (or into) a profile
function saveCurrentConfigToProfile(profileId) {
    const T = TRANSLATIONS[currentLang];
    const profile = appProfiles.find(p => p.id === profileId);
    if (!profile) return;
    log(T.prof_logBuilding + ` '${profile.name}'...`);
    profile.layers = JSON.parse(JSON.stringify(configState));
    profile.packets = buildPacketsForAllLayers(profile.layers);
    saveProfilesToStorage();
    log(`${T.prof_logSaved} '${profile.name}' (${Object.values(profile.packets).flat().length} pkts).`, 'success');
    renderProfilesPanel();
}

// ── Profile: load bindings from profile into configState
function loadProfileToEditor(profileId) {
    const T = TRANSLATIONS[currentLang];
    const profile = appProfiles.find(p => p.id === profileId);
    if (!profile) return;

    if (!profile.layers) {
        // Create a blank/empty layers config for editing
        const blankConfig = {};
        for (let layer = 0; layer < 4; layer++) {
            blankConfig[layer] = {};
            for (let b = 1; b <= 12; b++) {
                blankConfig[layer][`button-${b}`] = { type: 'none' };
            }
            for (let k = 0; k < 3; k++) {
                blankConfig[layer][`knob-${k}-ccw`] = { type: 'none' };
                blankConfig[layer][`knob-${k}-press`] = { type: 'none' };
                blankConfig[layer][`knob-${k}-cw`] = { type: 'none' };
            }
        }
        profile.layers = blankConfig;
        log(`Created new config layout for profile '${profile.name}'.`, 'info');
    }

    configState = JSON.parse(JSON.stringify(profile.layers));
    activeProfileId = profileId;
    saveProfilesToStorage();
    renderKeypad();
    log(`'${profile.name}': ${T.prof_logLoaded}`, 'success');
    renderProfilesPanel();
}

// ── Daemon: check status
async function checkDaemonStatus() {
    try {
        const resp = await fetch(`${DAEMON_URL}/status`, { signal: AbortSignal.timeout(1000) });
        if (resp.ok) {
            daemonStatus = await resp.json();
            daemonStatus.connected = true;
        } else {
            daemonStatus = { connected: false };
        }
    } catch {
        daemonStatus = { connected: false };
    }
    updateDaemonStatusBadge();
}

// ── Daemon: sync all profiles (send packets)
async function syncProfilesToDaemon() {
    // Build packets for profiles that have layers but may not have fresh packets
    appProfiles.forEach(p => {
        if (p.layers) {
            p.packets = buildPacketsForAllLayers(p.layers);
        }
    });
    saveProfilesToStorage();

    const toSend = appProfiles.map(p => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        color: p.color,
        rules: p.rules,
        disabled: !!p.disabled,
        packets: p.packets || {}
    }));

    const T = TRANSLATIONS[currentLang];
    try {
        const resp = await fetch(`${DAEMON_URL}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(toSend),
            signal: AbortSignal.timeout(3000)
        });
        if (resp.ok) {
            log(T.prof_syncOk, 'success');
            await checkDaemonStatus();
        } else {
            log(T.prof_syncErr, 'error');
        }
    } catch {
        log(T.prof_syncOffline, 'error');
    }
}

// ── Daemon status badge in profiles panel
function updateDaemonStatusBadge() {
    const badge = document.getElementById('daemon-status-badge');
    if (!badge) return;
    const T = TRANSLATIONS[currentLang];
    if (daemonStatus.connected) {
        const devOk = daemonStatus.device_connected;
        badge.className = 'daemon-badge ' + (devOk ? 'daemon-ok' : 'daemon-warn');
        
        let statusHtml = devOk ? T.prof_daemonOk : T.prof_daemonWarn;
        if (daemonStatus.active_profile_id) {
            const activeProf = appProfiles.find(p => p.id === daemonStatus.active_profile_id);
            const profName = activeProf ? `${activeProf.icon || ''} ${activeProf.name}` : daemonStatus.active_profile_id;
            const prefix = currentLang === 'ru' ? 'Активен профиль' : 'Active profile';
            statusHtml += ` <span style="margin-left: 0.5rem; padding: 0.1rem 0.4rem; background: rgba(255,255,255,0.1); border-radius: 4px; font-weight: bold; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.15); color: var(--accent-cyan);">${prefix}: ${profName}</span>`;
        }
        badge.innerHTML = statusHtml;
    } else {
        badge.className = 'daemon-badge daemon-off';
        badge.innerHTML = T.prof_daemonOff;
    }
    document.querySelectorAll('.profile-card').forEach(card => {
        const pid = card.dataset.profileId;
        card.classList.toggle('daemon-active', pid === daemonStatus.active_profile_id);
    });
}

// ── Profile CRUD
function createNewProfile() {
    const T = TRANSLATIONS[currentLang];
    const name = prompt(T.prof_promptName, T.prof_promptNameDefault);
    if (!name) return;
    const icon = prompt(T.prof_promptIcon, '\u2328\uFE0F') || '\u2328\uFE0F';
    const color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    const id = 'profile_' + Date.now();
    appProfiles.push({ id, name, icon, color, rules: [], layers: createBlankConfig(), packets: {} });
    saveProfilesToStorage();
    renderProfilesPanel();
}

function deleteProfile(profileId) {
    const T = TRANSLATIONS[currentLang];
    if (!confirm(T.prof_confirmDelete)) return;
    appProfiles = appProfiles.filter(p => p.id !== profileId);
    if (activeProfileId === profileId) activeProfileId = null;
    saveProfilesToStorage();
    renderProfilesPanel();
}

let editingProfileId = null;

function editProfileMeta(profileId) {
    const profile = appProfiles.find(p => p.id === profileId);
    if (!profile) return;
    
    editingProfileId = profileId;
    
    // Fill fields
    document.getElementById('profile-modal-name').value = profile.name || '';
    document.getElementById('profile-modal-icon').value = profile.icon || '';
    document.getElementById('profile-modal-rules').value = Array.isArray(profile.rules) ? profile.rules.join(', ') : '';
    document.getElementById('profile-modal-disabled').checked = !!profile.disabled;
    
    // Show Modal
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('active');
}

// Close/Save Handlers for the Modal
document.getElementById('profile-modal-close').addEventListener('click', closeModal);
document.getElementById('profile-modal-cancel').addEventListener('click', closeModal);
document.getElementById('profile-modal-save').addEventListener('click', () => {
    if (!editingProfileId) return;
    const profile = appProfiles.find(p => p.id === editingProfileId);
    if (profile) {
        profile.name = document.getElementById('profile-modal-name').value.trim() || profile.name;
        profile.icon = document.getElementById('profile-modal-icon').value.trim() || '⌨️';
        const rulesVal = document.getElementById('profile-modal-rules').value;
        profile.rules = rulesVal.split(',').map(r => r.trim()).filter(Boolean);
        profile.disabled = document.getElementById('profile-modal-disabled').checked;
        
        saveProfilesToStorage();
        renderProfilesPanel();
    }
    closeModal();
});

function closeModal() {
    editingProfileId = null;
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
}

// ── Render profiles panel
function renderProfilesPanel() {
    const container = document.getElementById('profiles-cards');
    if (!container) return;
    const T = TRANSLATIONS[currentLang];

    container.innerHTML = '';
    appProfiles.forEach(profile => {
        let hasActiveBindings = false;
        if (profile.layers) {
            for (let layer in profile.layers) {
                for (let key in profile.layers[layer]) {
                    const binding = profile.layers[layer][key];
                    if (binding && binding.type !== 'none') {
                        hasActiveBindings = true;
                        break;
                    }
                }
                if (hasActiveBindings) break;
            }
        }
        const hasConfig = hasActiveBindings || !!(profile.packets && Object.keys(profile.packets).length > 0);
        const isActive  = profile.id === activeProfileId;
        const isDaemonActive = profile.id === daemonStatus.active_profile_id;
        const noRulesText = profile.rules.length ? profile.rules.slice(0,2).join(', ') : T.prof_noRules;

        const card = document.createElement('div');
        let cardClass = 'profile-card' + (isActive ? ' selected' : '') + (isDaemonActive ? ' daemon-active' : '');
        if (profile.disabled) {
            cardClass += ' profile-disabled';
        }
        card.className = cardClass;
        card.dataset.profileId = profile.id;
        card.style.setProperty('--profile-color', profile.color || '#888');

        // Add disabled label if applicable
        const disabledLabel = profile.disabled ? ` <span style="font-size:0.75rem; background:var(--accent-red); padding:0.1rem 0.3rem; border-radius:4px; font-weight:bold; margin-left:0.4rem; vertical-align:middle; text-shadow:none; color:#fff;">${currentLang === 'ru' ? 'Выкл' : 'Off'}</span>` : '';

        card.innerHTML = `
            <div class="profile-card-icon">${profile.icon}</div>
            <div class="profile-card-name">${profile.name}${disabledLabel}</div>
            <div class="profile-card-rules">${noRulesText}</div>
            <div class="profile-card-status">
                ${hasConfig ? `<span class="profile-has-config">${T.prof_configured}</span>` : `<span class="profile-no-config">${T.prof_noConfig}</span>`}
                ${isDaemonActive ? `<span class="profile-daemon-dot">${T.prof_active}</span>` : ''}
            </div>
            <div class="profile-card-actions">
                <button class="btn-profile-action" title="${T.prof_ttLoad}" onclick="loadProfileToEditor('${profile.id}')">📂</button>
                <button class="btn-profile-action" title="${T.prof_ttSave}" onclick="saveCurrentConfigToProfile('${profile.id}')">💾</button>
                <button class="btn-profile-action" title="${T.prof_ttEdit}" onclick="editProfileMeta('${profile.id}')">✏️</button>
                ${profile.id !== 'default' ? `<button class="btn-profile-action btn-profile-del" title="${T.prof_ttDelete}" onclick="deleteProfile('${profile.id}')">🗑</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });

    // Update hint text and header from translations
    const hint = document.getElementById('profiles-hint-text');
    if (hint) hint.innerHTML = T.prof_hint;
    const title = document.getElementById('profiles-panel-title');
    if (title) {
        const svg = title.querySelector('svg');
        title.textContent = T.prof_panelTitle;
        if (svg) title.prepend(svg);
    }
    const syncBtn = document.getElementById('btn-sync-daemon');
    if (syncBtn) {
        const btnSvg = syncBtn.querySelector('svg');
        const span = document.getElementById('btn-sync-daemon-text');
        if (span) span.textContent = T.prof_syncBtn;
    }
    const newBtn = document.getElementById('btn-new-profile');
    if (newBtn) newBtn.textContent = '+ ' + T.prof_newBtn.replace(/^\+\s*/, '');
    updateDaemonStatusBadge();
}

// Poll daemon status every 3 seconds when page is open
setInterval(checkDaemonStatus, 3000);
checkDaemonStatus();


// RGB LED Mode Control
async function sendLedCommand(modeCode, colorCode) {
    if (!activeDevice) return;
    
    try {
        log(`Sending LED mode code: ${modeCode.toString(16)}...`);
        if (activeModel === 'Ch57x_3') {
            const packets = [
                [254, 176, 0, modeCode, 255, 0, 0, 255, 128, 48, 255, 255, 48, 0, 255, 0, 0, 255, 255, 0, 0, 255, 230, 230, 250, 139, 0, 0, 255, 165, 0, 255, 255, 150, 125, 255, 0, 0, 139, 139, 0, 0, 139, 255, 0, 255, 255, 102, 102, 255, 200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [254, 176, 1, 0, 255, 0, 0, 255, 128, 48, 255, 255, 48, 0, 255, 0, 0, 255, 255, 0, 0, 255, 128, 0, 128, 139, 0, 0, 255, 165, 0, 255, 255, 150, 125, 255, 0, 0, 139, 139, 0, 0, 139, 255, 0, 255, 255, 102, 102, 255, 200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [254, 176, 2, 0, 255, 0, 0, 255, 128, 48, 255, 255, 48, 0, 255, 0, 0, 255, 255, 0, 0, 255, 128, 0, 128, 139, 0, 0, 255, 165, 0, 255, 255, 150, 125, 255, 0, 0, 139, 139, 0, 0, 139, 255, 0, 255, 255, 102, 102, 255, 200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            for (const p of packets) {
                const buf = new Uint8Array(64);
                buf.set(p);
                // For Ch57x_3 we always write to output report 0x03
                await activeDevice.sendReport(0x03, buf);
                await new Promise(r => setTimeout(r, 15));
            }
        } else {
            const packets = [
                [0x03, 0xa1, 0x01, 0, 0, 0, 0, 0, 0],
                [0x03, 0xb0, 0x18, modeCode, 0, 0, 0, 0, 0],
                [0x03, 0xaa, 0xa1, 0, 0, 0, 0, 0, 0]
            ];
            for (const p of packets) {
                const buf = new Uint8Array(64);
                buf.set(p);
                if (deviceSupportsReportId3()) {
                    await activeDevice.sendReport(buf[0], buf.subarray(1));
                } else {
                    await activeDevice.sendReport(0x00, buf);
                }
                await new Promise(r => setTimeout(r, 15));
            }
        }
        log("LED configurations applied successfully!", "success");
    } catch (err) {
        log(`Failed to update LED: ${err.message}`, "error");
    }
}

elements.selectLedMode.addEventListener('change', () => {
    // Ignore phantom change events triggered during label refreshes
    if (_ledUpdating) return;
    
    const val = parseInt(elements.selectLedMode.value);
    
    // Find active color
    const activeColorBtn = elements.ledColorsContainer.querySelector('.color-dot.active');
    const colorCode = activeColorBtn ? parseInt(activeColorBtn.dataset.color) : 1;
    
    let modeCode = 0;
    if (activeModel === 'Ch57x_3') {
        modeCode = val; // Direct 0-5 mode code for Ch57x_3
    } else {
        if (val === 0) modeCode = 0x00; // Off
        else if (val === 5) modeCode = 0x05; // White backlight
        else {
            // (color << 4) | mode
            // Mode mapping: Static=1, Shock=2, Shock2=3, PressFade=4
            const modeNum = val; 
            modeCode = (colorCode << 4) | modeNum;
        }
    }
    
    sendLedCommand(modeCode, colorCode);
});

// Color dots selectors
const colorDots = elements.ledColorsContainer.querySelectorAll('.color-dot');
colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        
        // Trigger selectLedMode update
        elements.selectLedMode.dispatchEvent(new Event('change'));
    });
});

// Set first color dot as default active
if (colorDots.length > 0) {
    colorDots[0].classList.add('active');
}

// Query and read config from hardware
async function readConfigFromDevice() {
    if (!activeDevice) {
        log("Cannot read: device not connected.", "error");
        return;
    }
    
    log(`Reading configuration from device for Layer ${currentLayer + 1}...`);
    elements.btnConnect.disabled = true;
    elements.btnRead.disabled = true;
    elements.btnUpload.disabled = true;
    
    const layout = getLayoutConfig(currentLayout);
    let successCount = 0;
    
    // Helper to send query and wait for response
    async function queryKey(keyNum, type, index = 1) {
        const typeCode = ((currentLayer + 1) << 4) | type;
        const queryKeyName = `${keyNum}-${typeCode}`;
        
        const packet = new Uint8Array(64);
        packet[0] = 0x03; // Report ID
        if (activeModel === 'Ch57x_3') {
            packet[1] = 0xfa;
            packet[2] = keyNum;
            packet[3] = 0;
            packet[4] = currentLayer + 1;
            packet[5] = 0;
        } else {
            packet[1] = keyNum;
            packet[2] = typeCode;
            packet[3] = type === 0x01 ? 1 : 0; // len (1 for keyboard)
            packet[4] = type === 0x01 ? index : 0; // index
        }
        
        return new Promise((resolve) => {
            // Setup timeout
            const timeoutId = setTimeout(() => {
                delete activeQueries[queryKeyName];
                resolve(null);
            }, 60); // 60ms timeout is plenty for USB HID
            
            activeQueries[queryKeyName] = (bytes) => {
                clearTimeout(timeoutId);
                resolve(bytes);
            };
            
            let payload;
            if (deviceSupportsReportId3()) {
                payload = new Uint8Array(64);
                payload.set(packet.subarray(1));
            } else {
                payload = packet;
            }
            
            const sendPromise = deviceSupportsReportId3() 
                ? activeDevice.sendReport(0x03, payload)
                : activeDevice.sendReport(0x00, payload);
            
            sendPromise.catch(() => {
                clearTimeout(timeoutId);
                delete activeQueries[queryKeyName];
                resolve(null);
            });
        });
    }
    
    // Build list of keys to query based on active layout
    const keysToQuery = [];
    
    // Add buttons
    for (let b = 1; b <= layout.keys; b++) {
        keysToQuery.push({ id: `button-${b}`, num: b });
    }
    
    // Add knobs
    for (let k = 0; k < layout.knobs; k++) {
        keysToQuery.push({ id: `knob-${k}-ccw`, num: getKeyNum(`knob-${k}-ccw`) });
        keysToQuery.push({ id: `knob-${k}-press`, num: getKeyNum(`knob-${k}-press`) });
        keysToQuery.push({ id: `knob-${k}-cw`, num: getKeyNum(`knob-${k}-cw`) });
    }
    
    for (const key of keysToQuery) {
        if (key.num === 0) continue; // Skip unmapped keys to avoid timeouts
        
        // Query keyboard first (type 0x01) at index 1
        let response = await queryKey(key.num, 0x01, 1);
        
        if (response) {
            let modifiers = response[4];
            let code = response[5];
            
            if (activeModel === 'Ch57x_3') {
                modifiers = response[9];
                code = response[8];
            }
            
            if (code > 0 || modifiers > 0) {
                configState[currentLayer][key.id] = {
                    type: 'keyboard',
                    modifiers: modifiers,
                    code: code
                };
                successCount++;
                continue;
            }
        }
        
        // Query media next (type 0x02)
        response = await queryKey(key.num, 0x02);
        if (response) {
            let low = response[2];
            let high = response[3];
            if (activeModel === 'Ch57x_3') {
                low = response[8];
                high = response[11];
            }
            const mediaCode = (high << 8) | low;
            
            if (mediaCode > 0) {
                configState[currentLayer][key.id] = {
                    type: 'media',
                    code: mediaCode
                };
                successCount++;
                continue;
            }
        }
        
        // Query mouse last (type 0x03)
        response = await queryKey(key.num, 0x03);
        if (response) {
            let button = response[2];
            let dxRaw = response[3];
            let dyRaw = response[4];
            let wheelRaw = response[5];
            let modifiers = 0;
            
            if (activeModel === 'Ch57x_3') {
                button = response[11];
                dxRaw = response[14];
                dyRaw = response[17];
                wheelRaw = response[20];
                
                const mouseMod = response[8];
                if (mouseMod === 0xf1) modifiers = 0x01;
                else if (mouseMod === 0xf2) modifiers = 0x02;
                else if (mouseMod === 0xf3) modifiers = 0x04;
            } else if (activeModel === 'Ch57x_1') {
                if (response[0] === 0xfe || response[0] === 0xfd) {
                    const subAction = response[9];
                    const mouseMod = response[10];
                    if (mouseMod === 1) modifiers = 0x01;
                    else if (mouseMod === 2) modifiers = 0x02;
                    else if (mouseMod === 4) modifiers = 0x04;
                    
                    if (subAction === 1) {
                        button = response[11];
                        dxRaw = 0;
                        dyRaw = 0;
                        wheelRaw = 0;
                    } else if (subAction === 3) {
                        button = 0;
                        dxRaw = 0;
                        dyRaw = 0;
                        wheelRaw = response[14];
                    } else if (subAction === 5) {
                        button = 0;
                        dxRaw = response[12];
                        dyRaw = response[13];
                        wheelRaw = 0;
                    }
                }
            } else {
                // Ch57x_2 (K8890)
                modifiers = response[6] || 0;
            }
            
            // Convert signed 8-bit values back to JS signed numbers
            const dx = dxRaw > 127 ? (dxRaw - 256) : dxRaw;
            const dy = dyRaw > 127 ? (dyRaw - 256) : dyRaw;
            const wheel = wheelRaw > 127 ? (wheelRaw - 256) : wheelRaw;
            
            if (button > 0 || wheel !== 0 || dx !== 0 || dy !== 0 || modifiers > 0) {
                configState[currentLayer][key.id] = {
                    type: 'mouse',
                    button: button,
                    wheel: wheel,
                    dx: dx,
                    dy: dy,
                    modifiers: modifiers
                };
                successCount++;
                continue;
            }
        }
        
        // Default to unbound if no active mapping is returned
        configState[currentLayer][key.id] = { type: 'none' };
    }
    
    log(`Finished reading Layer ${currentLayer + 1}. Loaded ${successCount} active bindings.`, "success");
    renderKeypad();
    
    // Refresh configuration panel if a key is active by retrieving the newly rendered DOM element
    if (activeKeyElement && activeKeyData && activeKeyData.id) {
        let newEl = document.getElementById(activeKeyData.id);
        if (!newEl) {
            newEl = elements.keypadChassis.querySelector(`[data-key-id="${activeKeyData.id}"]`);
        }
        if (newEl) {
            selectKey(newEl);
        } else {
            activeKeyElement = null;
            activeKeyData = null;
            elements.activeKeyTitle.textContent = TRANSLATIONS[currentLang].defaultActiveKey;
            elements.configPanel.style.pointerEvents = 'none';
            elements.configPanel.style.opacity = '0.5';
            if (elements.btnClear) elements.btnClear.disabled = true;
        }
    } else {
        activeKeyElement = null;
        activeKeyData = null;
        elements.activeKeyTitle.textContent = TRANSLATIONS[currentLang].defaultActiveKey;
        elements.configPanel.style.pointerEvents = 'none';
        elements.configPanel.style.opacity = '0.5';
        if (elements.btnClear) elements.btnClear.disabled = true;
    }
    
    elements.btnConnect.disabled = false;
    elements.btnRead.disabled = false;
    elements.btnUpload.disabled = false;
}

elements.btnRead.addEventListener('click', readConfigFromDevice);

// Helper to check if the connected device supports Report ID 3 configuration
function deviceSupportsReportId3() {
    return activeDevice && activeDevice.collections && 
           activeDevice.collections.some(c => 
               c.outputReports && c.outputReports.some(r => r.reportId === 3)
           );
}

// Click listener for copying debug logs
document.getElementById('btn-copy-logs').addEventListener('click', () => {
    const lines = Array.from(elements.consoleLog.querySelectorAll('.console-line'))
        .map(el => el.textContent)
        .join('\n');
    navigator.clipboard.writeText(lines)
        .then(() => log("Logs copied to clipboard!", "success"))
        .catch(err => log("Failed to copy logs: " + err.message, "error"));
});

// Apply translations to all UI elements
function applyLanguage() {
    const lang = currentLang;
    const t = TRANSLATIONS[lang];
    
    // Title & Header
    document.title = t.appTitle;
    const h1 = document.querySelector('header h1');
    if (h1) {
        const svg = h1.querySelector('svg');
        const badge = h1.querySelector('.app-version');
        h1.innerHTML = '';
        if (svg) h1.appendChild(svg);
        h1.appendChild(document.createTextNode(' ' + t.appTitle + ' '));
        if (badge) h1.appendChild(badge);
    }
    
    // Status text
    if (!activeDevice) {
        elements.statusText.textContent = t.statusDisconnected;
        elements.btnConnect.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            ${t.btnConnect}
        `;
    } else {
        elements.statusText.textContent = t.statusConnected + (activeDevice.productName || 'Macro Keyboard');
        elements.btnConnect.textContent = t.btnDisconnect;
    }
    
    // Labels in layout toolbar
    document.querySelector('label[for="select-layout"]').textContent = t.lblLayout;
    document.querySelector('label[for="select-model"]').textContent = t.lblModel;
    document.querySelector('label[for="select-layer"]').textContent = t.lblLayer;
    
    // Translate layout options
    const selectLayout = document.getElementById('select-layout');
    if (selectLayout) {
        selectLayout.options[0].textContent = lang === 'ru' ? '3 клавиши + 1 крутилка' : '3 Keys + 1 Knob';
        selectLayout.options[1].textContent = lang === 'ru' ? '3 клавиши + 2 крутилки (сдвоенный)' : '3 Keys + 2 Knobs (Concentric/Double)';
        selectLayout.options[2].textContent = lang === 'ru' ? '6 клавиш + 1 крутилка' : '6 Keys + 1 Knob';
        selectLayout.options[3].textContent = lang === 'ru' ? '6 клавиш + 2 крутилки' : '6 Keys + 2 Knobs';
        selectLayout.options[4].textContent = lang === 'ru' ? '12 клавиш + 2 крутилки' : '12 Keys + 2 Knobs';
        selectLayout.options[5].textContent = lang === 'ru' ? 'Круговая медиа-крутилка' : 'Concentric Media Dial';
    }
    
    // Translate layer options
    const selectLayer = document.getElementById('select-layer');
    if (selectLayer) {
        selectLayer.options[0].textContent = lang === 'ru' ? 'Слой 1 (Основной)' : 'Layer 1 (Default)';
        selectLayer.options[1].textContent = lang === 'ru' ? 'Слой 2' : 'Layer 2';
        selectLayer.options[2].textContent = lang === 'ru' ? 'Слой 3' : 'Layer 3';
        selectLayer.options[3].textContent = lang === 'ru' ? 'Слой 4' : 'Layer 4';
    }
    
    // Reset/Upload/Read toolbar
    elements.btnClear.textContent = t.btnClear;
    elements.btnClearAll.textContent = t.btnClearAll;
    
    elements.btnRead.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        ${t.btnRead}
    `;
    elements.btnUpload.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        ${t.btnUpload}
    `;
    
    // Sidebar Key Configuration Card
    document.querySelector('.card-title span').textContent = t.cardTitleConfig;
    if (!activeKeyElement) {
        elements.activeKeyTitle.textContent = t.defaultActiveKey;
    }
    
    // Tabs
    document.querySelector('.tab[data-tab="keyboard"]').textContent = t.tabKeyboard;
    document.querySelector('.tab[data-tab="media"]').textContent = t.tabMedia;
    document.querySelector('.tab[data-tab="mouse"]').textContent = t.tabMouse;
    
    // Keyboard tab content
    const lblShortcut = document.querySelector('#tab-keyboard label');
    if (lblShortcut) lblShortcut.textContent = t.lblShortcut;
    // Update placeholder value if no shortcut is captured yet (compare against both language variants)
    const currentVal = elements.keyCaptureValue.textContent;
    const isPlaceholder = currentVal === TRANSLATIONS.ru.lblShortcutValue || currentVal === TRANSLATIONS.en.lblShortcutValue;
    if (isPlaceholder) {
        elements.keyCaptureValue.textContent = t.lblShortcutValue;
    }
    // Only reset status text if not currently recording
    if (!isListeningToKeys) {
        const statusEl = document.getElementById('key-capture-status');
        const statusText = statusEl.textContent;
        const isStatusPlaceholder =
            statusText === TRANSLATIONS.ru.lblShortcutStatus ||
            statusText === TRANSLATIONS.en.lblShortcutStatus ||
            statusText === TRANSLATIONS.ru.lblShortcutCaptured ||
            statusText === TRANSLATIONS.en.lblShortcutCaptured ||
            statusText === TRANSLATIONS.ru.lblShortcutNotSupported ||
            statusText === TRANSLATIONS.en.lblShortcutNotSupported ||
            statusText === TRANSLATIONS.ru.lblShortcutConfiguredManually ||
            statusText === TRANSLATIONS.en.lblShortcutConfiguredManually;
        if (isStatusPlaceholder) statusEl.textContent = t.lblShortcutStatus;
    }
    const dividerSpan = document.querySelector('.form-divider span');
    if (dividerSpan) dividerSpan.textContent = t.lblManualKeyboard;
    
    const lblModifiers = document.querySelector('.modifiers-checkbox-grid')?.closest('.form-group')?.querySelector('label');
    if (lblModifiers) lblModifiers.textContent = t.lblModifiers;
    
    const lblKeyboardKey = document.querySelector('label[for="select-keyboard-key"]');
    if (lblKeyboardKey) lblKeyboardKey.textContent = t.lblKeyboardKey;
    document.getElementById('btn-clear-shortcut').textContent = t.btnResetShortcut;
    
    // Media tab content
    const lblMedia = document.querySelector('#tab-media label');
    if (lblMedia) lblMedia.textContent = t.lblMediaAction;
    
    // Mouse tab content
    const lblMouseAction = document.querySelector('#tab-mouse label[for="select-mouse-action"]');
    if (lblMouseAction) lblMouseAction.textContent = t.lblMouseAction;
    
    const lblMouseBtn = document.querySelector('label[for="select-mouse-btn"]');
    if (lblMouseBtn) lblMouseBtn.textContent = t.lblMouseBtn;
    
    const lblMouseWheel = document.querySelector('label[for="select-mouse-wheel"]');
    if (lblMouseWheel) lblMouseWheel.textContent = t.lblMouseWheel;
    
    const lblMouseMods = document.querySelector('#chk-mouse-ctrl')?.closest('.form-group')?.querySelector('label');
    if (lblMouseMods) lblMouseMods.textContent = t.lblMouseModifiers;
    
    const lblMouseMoveX = document.querySelector('label[for="input-mouse-dx"]');
    if (lblMouseMoveX) lblMouseMoveX.textContent = t.lblMouseMoveX;
    
    const lblMouseMoveY = document.querySelector('label[for="input-mouse-dy"]');
    if (lblMouseMoveY) lblMouseMoveY.textContent = t.lblMouseMoveY;
    
    // Mouse preset actions options text
    const selectMouseAction = document.getElementById('select-mouse-action');
    if (selectMouseAction) {
        Array.from(selectMouseAction.options).forEach(opt => {
            opt.textContent = t[`preset_${opt.value}`] || opt.textContent;
        });
    }
    
    // Mouse custom selectors
    const selectMouseBtn = document.getElementById('select-mouse-btn');
    if (selectMouseBtn) {
        selectMouseBtn.options[0].textContent = t.opt_none;
        selectMouseBtn.options[1].textContent = t.opt_left_click;
        selectMouseBtn.options[2].textContent = t.opt_right_click;
        selectMouseBtn.options[3].textContent = t.opt_middle_click;
    }
    
    const selectMouseWheel = document.getElementById('select-mouse-wheel');
    if (selectMouseWheel) {
        selectMouseWheel.options[0].textContent = t.opt_none;
        selectMouseWheel.options[1].textContent = t.opt_scroll_up;
        selectMouseWheel.options[2].textContent = t.opt_scroll_down;
    }
    
    // RGB Backlight card
    const ledCard = document.querySelector('.rgb-controls')?.closest('.card');
    if (ledCard) {
        const ledH3 = ledCard.querySelector('h3');
        if (ledH3) ledH3.textContent = t.cardTitleLed;
        const ledP = ledCard.querySelector('p');
        if (ledP) ledP.textContent = t.lblLedDesc;
        const ledModeLbl = ledCard.querySelector('label[for="select-led-mode"]');
        if (ledModeLbl) ledModeLbl.textContent = t.lblLedMode;
        const ledColorLbl = ledCard.querySelector('#led-colors-container')?.closest('.form-group')?.querySelector('label');
        if (ledColorLbl) ledColorLbl.textContent = t.lblLedColor;
    }
    
    // Console card
    const consoleCard = document.querySelector('.console-card');
    if (consoleCard) {
        consoleCard.querySelector('.card-title span').textContent = t.cardTitleConsole;
        document.getElementById('btn-copy-logs').textContent = t.btnCopyLogs;
        document.getElementById('btn-export').textContent = t.btnExport;
        document.getElementById('btn-import').textContent = t.btnImport;
    }
    
    // Repopulate dynamic lists to use translated text
    populateDropdowns();
    
    // Refresh keypad visualizer to update labels
    renderKeypad();
    
    // Refresh LED mode option labels
    updateLedControls();
    
    // Refresh profiles panel labels
    renderProfilesPanel();
    
    // Refresh active key label
    if (activeKeyElement && activeKeyData) {
        // Find newly rendered element
        let newEl = document.getElementById(activeKeyData.id);
        if (!newEl) {
            newEl = elements.keypadChassis.querySelector(`[data-key-id="${activeKeyData.id}"]`);
        }
        if (newEl) {
            // Apply visual active class
            if (activeKeyElement) activeKeyElement.classList.remove('active');
            activeKeyElement = newEl;
            activeKeyElement.classList.add('active');
        }
    }
    
    // Update language switcher button text
    const btnLangSpan = document.querySelector('#btn-lang span');
    if (btnLangSpan) {
        btnLangSpan.textContent = lang === 'ru' ? 'EN' : 'RU';
    }

    // Modal elements translation
    const mTitle = document.getElementById('profile-modal-title');
    if (mTitle) mTitle.textContent = lang === 'ru' ? 'Редактировать профиль' : 'Edit Profile';
    const mLblName = document.getElementById('lbl-modal-name');
    if (mLblName) mLblName.textContent = lang === 'ru' ? 'Название профиля' : 'Profile Name';
    const mLblIcon = document.getElementById('lbl-modal-icon');
    if (mLblIcon) mLblIcon.textContent = lang === 'ru' ? 'Иконка (эмодзи)' : 'Icon (emoji)';
    const mLblRules = document.getElementById('lbl-modal-rules');
    if (mLblRules) mLblRules.textContent = lang === 'ru' ? 'Правила совпадения (exe или название, через запятую)' : 'Match rules (exe or title, comma-separated)';
    const mBtnCancel = document.getElementById('profile-modal-cancel');
    if (mBtnCancel) mBtnCancel.textContent = lang === 'ru' ? 'Отмена' : 'Cancel';
    const mBtnSave = document.getElementById('profile-modal-save');
    if (mBtnSave) mBtnSave.textContent = lang === 'ru' ? 'Сохранить' : 'Save';
    const mLblDisabled = document.getElementById('lbl-modal-disabled');
    if (mLblDisabled) mLblDisabled.textContent = lang === 'ru' ? 'Отключить этот профиль' : 'Disable this profile';

    // Companion Modal translation
    const cTitle = document.getElementById('companion-modal-title');
    if (cTitle) cTitle.textContent = lang === 'ru' ? 'Работа с компаньоном Keypad Companion' : 'Working with Keypad Companion';

    const cBtnText = document.querySelector('#btn-companion span');
    if (cBtnText) cBtnText.textContent = lang === 'ru' ? 'Работа с компаньоном' : 'Keypad Companion';

    const cDesc1 = document.getElementById('comp-desc-1');
    if (cDesc1) {
        cDesc1.innerHTML = lang === 'ru' 
            ? '<b>Keypad Companion</b> — это фоновое приложение Windows, которое позволяет вашему макропаду автоматически менять раскладки (профили) при переключении между различными приложениями.'
            : '<b>Keypad Companion</b> is a background Windows application that enables your macro pad to automatically switch layouts (profiles) when switching between active desktop applications.';
    }

    const cHdr1 = document.getElementById('comp-hdr-1');
    if (cHdr1) cHdr1.textContent = lang === 'ru' ? 'Как использовать:' : 'How to use:';

    const cStep1 = document.getElementById('comp-step-1');
    if (cStep1) cStep1.textContent = lang === 'ru' ? 'Настройте привязки клавиш и крутилок для нужного приложения.' : 'Configure key and knob bindings for the target application.';

    const cStep2 = document.getElementById('comp-step-2');
    if (cStep2) cStep2.textContent = lang === 'ru' ? 'Нажмите кнопку 💾 у соответствующего профиля в списке, чтобы применить текущую конфигурацию.' : 'Click the 💾 button on the corresponding profile card to apply the current configuration.';

    const cStep3 = document.getElementById('comp-step-3');
    if (cStep3) {
        cStep3.innerHTML = lang === 'ru'
            ? 'Настройте правила (например, введите имя процесса <code>Spotify.exe</code> для профиля музыки).'
            : 'Configure matching rules (e.g. enter process name <code>Spotify.exe</code> for music profile).';
    }

    const cStep4 = document.getElementById('comp-step-4');
    if (cStep4) {
        cStep4.innerHTML = lang === 'ru'
            ? 'Нажмите кнопку <b>«Сохранить в компаньон»</b> для отправки данных.'
            : 'Click the <b>"Sync to Companion"</b> button to sync configurations.';
    }

    const cStep5 = document.getElementById('comp-step-5');
    if (cStep5) {
        cStep5.innerHTML = lang === 'ru'
            ? 'Запустите приложение <code>Keypad_Companion.exe</code> на вашем компьютере.'
            : 'Run <code>Keypad_Companion.exe</code> on your computer.';
    }

    const cHdr2 = document.getElementById('comp-hdr-2');
    if (cHdr2) cHdr2.textContent = lang === 'ru' ? 'Преимущества компаньона:' : 'Companion Benefits:';

    const cFeat1 = document.getElementById('comp-feat-1');
    if (cFeat1) cFeat1.textContent = lang === 'ru' ? 'Работает полностью автономно в фоновом режиме.' : 'Runs completely autonomously in the background.';

    const cFeat2 = document.getElementById('comp-feat-2');
    if (cFeat2) cFeat2.textContent = lang === 'ru' ? 'Не требует держать открытой вкладку браузера.' : 'Does not require keeping the browser tab open.';

    const cFeat3 = document.getElementById('comp-feat-3');
    if (cFeat3) cFeat3.textContent = lang === 'ru' ? 'Почти не расходует системные ресурсы (написан на Python).' : 'Extremely low system resources footprint.';

    const cFeat4 = document.getElementById('comp-feat-4');
    if (cFeat4) cFeat4.textContent = lang === 'ru' ? 'Сам опрашивает активные окна Windows 1 раз в секунду.' : 'Polls active Windows windows every 1.0 second for instant switches.';

    const cBtnOk = document.getElementById('companion-modal-ok');
    if (cBtnOk) cBtnOk.textContent = lang === 'ru' ? 'Понятно' : 'Understood';
}

// Hook companion modal event handlers
const compModal = document.getElementById('companion-modal');
const btnCompanion = document.getElementById('btn-companion');
if (btnCompanion && compModal) {
    btnCompanion.addEventListener('click', () => {
        compModal.classList.add('active');
    });
}
const compModalClose = document.getElementById('companion-modal-close');
if (compModalClose && compModal) {
    compModalClose.addEventListener('click', () => {
        compModal.classList.remove('active');
    });
}
const compModalOk = document.getElementById('companion-modal-ok');
if (compModalOk && compModal) {
    compModalOk.addEventListener('click', () => {
        compModal.classList.remove('active');
    });
}

// Hook language switch listener
elements.btnLang.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('lang', currentLang);
    applyLanguage();
    log(`Language switched to: ${currentLang.toUpperCase()}`, 'info');
});

// Initialize on load
initializeConfig();
if (localStorage.getItem('current_layout')) {
    elements.selectLayout.value = localStorage.getItem('current_layout');
}
if (localStorage.getItem('active_model')) {
    if (elements.selectModel) elements.selectModel.value = localStorage.getItem('active_model');
}
applyLanguage();
renderProfilesPanel();
log("WebHID Configurator ready. Version: 0.43.");
