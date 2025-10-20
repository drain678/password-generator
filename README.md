# Генератор паролей на C++ и WebAssembly

Простой генератор паролей с веб-интерфейсом. Логика генерации реализована на C++, компилируется в WebAssembly через Emscripten.


## Требования

- Python 3 (для локального сервера)
- Emscripten (для сборки C++ в WASM)

## Сборка

1. Собрать WASM из корня проекта:
```
emcc src/generator.cpp \
  -o dist/generator.js \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_generate_password","_free_str"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString"]' \
  -O3
```
2. Запустить локальный сервер:
```
python3 -m http.server 8080
```
3. Открыть в браузере:
```
http://localhost:8080/web/index.html
```