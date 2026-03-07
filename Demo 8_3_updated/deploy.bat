@echo off
echo 🌸 Script Deploy Nhanh Len Netlify 🌸
echo.

echo 📂 Nen thu muc hien thanh file ZIP...
powershell -command "Compress-Archive -Path * -DestinationPath qua-8-3-cho-me.zip -Force"

echo ✅ Da nen xong file: qua-8-3-cho-me.zip
echo.

echo 🌐 Mo trang Netlify de deploy...
start https://app.netlify.com/drop

echo.
echo 📋 Huong dan:
echo 1. Keo tha file qua-8-3-cho-me.zip vao trang Netlify
echo 2. Cho 30 giay de xu ly
echo 3. Copy URL duoc cung cap
echo 4. Quet ma QR de thu!
echo.

echo 🎾 Nhan Enter de mo thu muc hien tai...
explorer .

pause
