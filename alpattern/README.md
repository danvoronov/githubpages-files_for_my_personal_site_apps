# Alphabet Pattern Game - English Client Version

The "Alphabet Pattern" game has been converted from server architecture (PHP) to fully client-side (HTML + JavaScript) and translated to English.

## What Changed

### ✅ Removed
- **daislovo.php** - server API for word generation
- **PHP dependencies** in index.php
- **AJAX requests** to server
- **Referer checking** and security system
- **Russian language** interface and alphabet

### ✅ Added
- **words.js** - client-side English word dictionary (3 and 4 letters)
- **index.html** - pure HTML without PHP
- **Local getRandomWord() function** for random word generation
- **English alphabet** (A-Z instead of А-Я)
- **English interface** translation

## Файловая структура

```
├── index.html          # Главная страница (вместо index.php)
├── words.js           # Словари слов (новый файл)
├── consts.js          # Константы игры
├── alpcore.js         # Основная логика (обновлен)
├── alpattern-func.js  # Вспомогательные функции
├── alpattern.js       # UI и события
├── alpattern.css      # Стили (если есть)
└── README.md          # Этот файл
```

## Advantages of New Version

1. **Faster** - no network request delays
2. **Offline capable** - works without internet
3. **Simple deployment** - static files only
4. **Less load** - no server needed
5. **More secure** - no server vulnerabilities
6. **International** - English language support

## How to Run

Simply open `index.html` in your browser. No server required!

## Technical Details

### Changes in alpcore.js

Replaced AJAX calls:
```javascript
// Before:
$.get('daislovo.php', { b: ficltPlanka}, function(data) {  
    slovo34 = $.trim(data); 
    // ...
});

// After:
slovo34 = getRandomWord(ficltPlanka);
```

### New function in words.js

```javascript
function getRandomWord(length) {
    const wordArray = length === 3 ? words3 : words4;
    const randomIndex = Math.floor(Math.random() * wordArray.length);
    return wordArray[randomIndex];
}
```

### Alphabet Changes

- **Russian alphabet** (А-Я, 33 letters) → **English alphabet** (A-Z, 26 letters)
- **Hand indicators**: Л/П/О → L/R/B (Left/Right/Both)
- **Vowels**: А,Е,И,О,У,Э,Ю,Я → A,E,I,O,U

## Game Modes

All 10 game modes work as before:
- 0: Classic
- 1: Electronic  
- 2: Flowing
- 3: Rotating
- 4: Positional
- 5: Colored
- 6: Sequences
- 7: Anagrams (now serverless!)
- 8: Spaced
- 9: Pattern

## Compatibility

The game maintains full functionality. All settings, progress, and features are preserved.