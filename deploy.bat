@echo off
REM sogyTweb - Script de Despliegue Automatizado (Windows)
REM Este script automatiza el proceso de despliegue en producción

echo 🚀 Iniciando despliegue de sogyTweb...

REM Verificar variables de entorno
if "%DB_PASSWORD%"=="" (
    echo ❌ DB_PASSWORD no está definida
    exit /b 1
)

if "%JWT_SECRET%"=="" (
    echo ❌ JWT_SECRET no está definida
    exit /b 1
)

echo ✅ Variables de entorno verificadas

REM Instalar dependencias del backend
echo ℹ️  Instalando dependencias del backend...
cd app
call npm install --production
cd ..
echo ✅ Dependencias del backend instaladas

REM Instalar dependencias del frontend
echo ℹ️  Instalando dependencias del frontend...
cd frontend
call npm install
cd ..
echo ✅ Dependencias del frontend instaladas

REM Construir frontend
echo ℹ️  Construyendo frontend...
cd frontend
call npm run build
cd ..
echo ✅ Frontend construido

REM Iniciar servicios con Docker
echo ℹ️  Iniciando servicios con Docker...
docker-compose down
docker-compose up -d
echo ✅ Servicios iniciados

REM Esperar a que la base de datos esté lista
echo ℹ️  Esperando a que la base de datos esté lista...
timeout /t 10 /nobreak > nul
echo ✅ Base de datos lista

REM Ejecutar migraciones
echo ℹ️  Ejecutando migraciones...
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_social_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_ai_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_finance_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_admin_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_lives_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_stories_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_groups_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_qr_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_notifications_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_support_db.sql
echo ✅ Migraciones ejecutadas

REM Verificar despliegue
echo ℹ️  Verificando despliegue...
timeout /t 5 /nobreak > nul

echo.
echo 🎉 Despliegue completado exitosamente!
echo.
echo 📱 Frontend: http://localhost
echo 🔧 Backend API: http://localhost:5000/api/health
echo 🗄️  Base de Datos: localhost:5432
echo.

pause
