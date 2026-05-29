@echo off
REM sogyTweb - Script de Inicio Rápido (Windows)
REM Este script inicia el proyecto en modo desarrollo

echo 🚀 Iniciando sogyTweb en modo desarrollo...

REM Verificar si existe .env
if not exist app\.env (
    echo ⚠️  No se encontró archivo .env
    echo Ejecuta setup.bat primero para configurar
    pause
    exit /b 1
)

REM Verificar si PostgreSQL está corriendo
echo 🔍 Verificando PostgreSQL...
timeout /t 2 /nobreak > nul

REM Iniciar backend
echo 📦 Iniciando backend...
start "Backend" cmd /k "cd app && npm run dev"

REM Esperar a que el backend esté listo
echo ⏳ Esperando a que el backend esté listo...
timeout /t 8 /nobreak > nul

REM Iniciar frontend
echo 🎨 Iniciando frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ sogyTweb iniciado exitosamente!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo.
echo 🔑 Credenciales Admin:
echo    Email: admin@sogytweb.com
echo    Password: admin123
echo.
echo ⚠️  Si no has creado el usuario admin, ejecuta:
echo    cd app
echo    node create_admin_user.js
echo.
echo Presiona cualquier tecla para cerrar esta ventana (los servicios seguirán corriendo)
pause
