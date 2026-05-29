@echo off
REM sogyTweb - Script para subir a GitHub automáticamente
REM Este script prepara y sube el código a GitHub

echo 🚀 Preparando para subir a GitHub...

REM Verificar si hay un repositorio git
if not exist .git (
    echo Inicializando repositorio git...
    git init
    git branch -M main
)

REM Agregar archivos
echo Agregando archivos...
git add .

REM Commit
echo Creando commit...
git commit -m "sogyTweb v2.0 Elite - Ecosistema Digital Completo"

REM Preguntar por la URL de GitHub
echo.
echo 🔗 Necesito la URL de tu repositorio de GitHub
echo Ejemplo: https://github.com/tu-usuario/sogytweb.git
echo.
set /p GITHUB_URL="Ingresa la URL de GitHub: "

REM Agregar remote
if "%GITHUB_URL%" neq "" (
    git remote add origin %GITHUB_URL%
    echo Subiendo a GitHub...
    git push -u origin main
    echo.
    echo ✅ Código subido exitosamente a GitHub!
    echo.
    echo 📋 Pasos siguientes:
    echo 1. Ve a vercel.com e importa tu repositorio
    echo 2. Ve a render.com e importa tu repositorio
    echo 3. Configura las variables de entorno en Render
    echo 4. Ejecuta las migraciones de base de datos
) else (
    echo ❌ No se proporcionó URL de GitHub
)

pause
