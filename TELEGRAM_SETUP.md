# Подключение приложения к Telegram

Сейчас приложение лежит в папке `telegram-app`, но телефон не может открыть локальный путь вида `file:///C:/...`.

Для Telegram нужна публичная HTTPS-ссылка. В этом проекте самый простой вариант - GitHub Pages.

## 1. Опубликовать приложение через GitHub Pages

В проект уже добавлен файл:

```text
.github/workflows/deploy-telegram-app.yml
```

Он публикует папку `telegram-app` на GitHub Pages после отправки изменений в ветку `main`.

Из корневой папки проекта можно запустить готовую команду:

```powershell
.\publish-telegram-app.cmd
```

После публикации ссылка должна быть такой:

```text
https://serhiitukhar.github.io/AcrisTelegram/
```

## 2. Проверить GitHub Pages

На GitHub открой репозиторий:

```text
https://github.com/SerhiiTukhar/AcrisTelegram
```

Дальше:

1. Открой вкладку `Actions`.
2. Найди запуск `Deploy Telegram App`.
3. Дождись зеленой галочки.
4. Открой вкладку `Settings`.
5. Открой раздел `Pages`.
6. Убедись, что сайт опубликован.

Если GitHub попросит выбрать источник Pages, выбери:

```text
Source: GitHub Actions
```

## 3. Подключить ссылку в BotFather

В Telegram открой `@BotFather`.

Дальше:

```text
/mybots
```

Выбери своего бота.

Потом:

```text
Bot Settings -> Menu Button -> Configure menu button
```

Вставь ссылку:

```text
https://serhiitukhar.github.io/AcrisTelegram/
```

Название кнопки, например:

```text
Склад
```

## 4. Открыть на телефоне

1. Открой чат со своим ботом в Telegram на телефоне.
2. Нажми кнопку меню рядом со строкой сообщения.
3. Должно открыться приложение склада.

## Важно про токен

Если файл `telegram-app/tokenTelegram.txt` содержит настоящий токен бота, его нельзя хранить в публичном GitHub-репозитории.

Лучше:

1. Удалить токен из репозитория.
2. Перевыпустить токен у `@BotFather`.
3. Хранить токен только на сервере или в GitHub Secrets, если будет backend.
