// app.js — ожидает, что dist/generator.js уже подгружен и Module готов
// Функции из C++: generate_password -> возвращает pointer (number), free_str(pointer)

let generate_c = null;
let free_c = null;

function initWasm() {
    // cwrap/ccall доступны после загрузки Module
    if (typeof Module === 'undefined') {
        console.error('Module не найден. Убедитесь, что dist/generator.js подключён.');
        return;
    }
    // cwrap возвращает JS-обёртку
    generate_c = Module.cwrap('generate_password', 'number', ['number', 'number', 'number', 'number', 'number']);
    free_c = Module.cwrap('free_str', 'void', ['number']);
}

function getEl(id) { return document.getElementById(id); }

function strengthLabel(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return 'Слабый';
    if (score <= 4) return 'Средний';
    return 'Сильный';
}

function generate() {
    if (!generate_c) {
        alert('WASM ещё не инициализирован. Подождите загрузки скрипта.');
        return;
    }
    const len = parseInt(getEl('len').value, 10) || 12;
    const upper = getEl('upper').checked ? 1 : 0;
    const lower = getEl('lower').checked ? 1 : 0;
    const digits = getEl('digits').checked ? 1 : 0;
    const symbols = getEl('symbols').checked ? 1 : 0;

    // вызов C++: возвращает указатель на C-строку (char*)
    const ptr = generate_c(len, upper, lower, digits, symbols);
    const jsstr = Module.UTF8ToString(ptr);
    free_c(ptr);

    if (jsstr === "ERROR_TOO_SHORT") {
        alert("Ошибка: длина пароля должна быть не меньше количества выбранных типов символов!");
        return;
    }


    getEl('output').value = jsstr;
    getEl('strength').textContent = strengthLabel(jsstr);
}

function copyOutput() {
    const out = getEl('output').value;
    if (!out) return;
    navigator.clipboard.writeText(out).then(() => {
        const btn = getEl('copy');
        btn.textContent = 'Скопировано!';
        setTimeout(() => btn.textContent = 'Копировать', 1200);
    }).catch(() => alert('Не удалось скопировать'));
}

// Инициализация: Module может ещё загружаться асинхронно.
// Emscripten генерирует загружаемый скрипт, который вызывает onRuntimeInitialized.
if (typeof Module !== 'undefined') {
    const oldInit = Module.onRuntimeInitialized;
    Module.onRuntimeInitialized = function () {
        if (oldInit) oldInit();
        initWasm();
    };
} else {
    // в редких случаях Module может быть undefined пока скрипт подключается
    window.addEventListener('load', initWasm);
}

document.addEventListener('DOMContentLoaded', () => {
    getEl('gen').addEventListener('click', generate);
    getEl('copy').addEventListener('click', copyOutput);
});
