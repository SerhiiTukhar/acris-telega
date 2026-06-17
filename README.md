# Узел смешивания

Проект для учета склада ТМЦ узла смешивания и подготовки Telegram Mini App.

## Что внутри

- `telegram-app/` - приложение для Telegram: склад, поиск, категории, расчет массы по плотности.
- `telegram-app/data/inventory.js` - данные склада для приложения.
- `telegram-app/data/inventory.json` - те же данные в JSON-формате.
- `tools/build_inventory.mjs` - пересобирает Excel с плотностями и обновляет данные приложения.
- `Глиняни_ззр.xlsx` - исходная выгрузка склада.
- `Глиняни_ззр_с_плотностью.xlsx` - обработанная таблица с плотностью и расчетом массы.

## Как открыть в VS Code

1. Открой VS Code.
2. Выбери `File -> Open Folder`.
3. Открой папку:

```text
C:\Users\Admin\OneDrive\Документы\Узел_Смешивания
```

## Как запустить приложение

Самый простой вариант из корневой папки проекта:

```powershell
.\start-app.cmd
```

Или через npm:

```powershell
npm start
```

Если ты уже внутри папки `telegram-app`, можно так:

```powershell
cd telegram-app
npm start
```

После запуска открой в браузере:

```text
http://localhost:8787
```

Также можно запустить через меню VS Code:

```text
Terminal -> Run Task -> Start Telegram App
```

## Как обновить данные из Excel

После изменения исходного файла `Глиняни_ззр.xlsx` выполни из корневой папки проекта:

```powershell
node tools/build_inventory.mjs
```

Это обновит:

- `Глиняни_ззр_с_плотностью.xlsx`
- `telegram-app/data/inventory.js`
- `telegram-app/data/inventory.json`

## Как открыть в Telegram

Telegram не открывает Mini App из `file:///...`. Для Telegram нужна публичная HTTPS-ссылка.

Обычный порядок:

1. Создать бота через `@BotFather`.
2. Опубликовать папку `telegram-app` на HTTPS-хостинге.
3. В `@BotFather` настроить кнопку меню бота и указать ссылку на приложение.
