@echo off
setlocal

if /i "%~1"=="--worker" goto :worker

set "PUBLISH_WORKER=%TEMP%\acris-publish-telegram-app.cmd"
copy /y "%~f0" "%PUBLISH_WORKER%" >nul
call "%PUBLISH_WORKER%" --worker "%~dp0"
set "PUBLISH_RESULT=%ERRORLEVEL%"
del /q "%PUBLISH_WORKER%" >nul 2>nul
exit /b %PUBLISH_RESULT%

:worker
cd /d "%~2"

echo Preparing Telegram app publication...
echo.

git remote set-url origin https://github.com/SerhiiTukhar/acris-telega.git
git pull --rebase --autostash origin main
if errorlevel 1 goto :sync_error

git rm --cached -- telegram-app/tokenTelegram.txt 2>nul
git add .gitignore README.md TELEGRAM_SETUP.md .github/workflows/deploy-telegram-app.yml telegram-app/.nojekyll
git add publish-telegram-app.cmd
git diff --cached --quiet || git commit -m "Deploy Telegram app with GitHub Pages"

git push origin main
if errorlevel 1 goto :push_error

echo.
echo Publication files were sent successfully.
echo Open:
echo https://github.com/SerhiiTukhar/acris-telega/actions
echo.
echo Wait for "Deploy Telegram App" to become green.
echo Then use this URL in BotFather:
echo https://serhiitukhar.github.io/acris-telega/
echo.
pause
exit /b 0

:sync_error
echo.
echo Could not synchronize with GitHub.
echo Please send Codex the error shown above.
pause
exit /b 1

:push_error
echo.
echo Could not send files to GitHub.
echo Please send Codex the error shown above.
pause
exit /b 1
