@echo off
setlocal

cd /d "%~dp0"

echo Preparing Telegram app publication...
echo.

git remote set-url origin https://github.com/SerhiiTukhar/acris-telega.git
git rm --cached -- telegram-app/tokenTelegram.txt 2>nul
git add .gitignore README.md TELEGRAM_SETUP.md .github/workflows/deploy-telegram-app.yml telegram-app/.nojekyll
git add publish-telegram-app.cmd
git commit -m "Deploy Telegram app with GitHub Pages"
git push origin main

echo.
echo If push completed successfully, open:
echo https://github.com/SerhiiTukhar/acris-telega/actions
echo.
echo Wait for "Deploy Telegram App" to become green.
echo Then use this URL in BotFather:
echo https://serhiitukhar.github.io/acris-telega/
echo.
pause
