#!/bin/bash

# sogyTweb - Script de Despliegue Automatizado
# Este script automatiza el proceso de despliegue en producción

set -e

echo "🚀 Iniciando despliegue de sogyTweb..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar variables de entorno
check_env() {
    log_info "Verificando variables de entorno..."
    
    if [ -z "$DB_PASSWORD" ]; then
        log_error "DB_PASSWORD no está definida"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET no está definida"
        exit 1
    fi
    
    log_success "Variables de entorno verificadas"
}

# Instalar dependencias del backend
install_backend_deps() {
    log_info "Instalando dependencias del backend..."
    cd app
    npm install --production
    cd ..
    log_success "Dependencias del backend instaladas"
}

# Instalar dependencias del frontend
install_frontend_deps() {
    log_info "Instalando dependencias del frontend..."
    cd frontend
    npm install
    cd ..
    log_success "Dependencias del frontend instaladas"
}

# Construir frontend
build_frontend() {
    log_info "Construyendo frontend..."
    cd frontend
    npm run build
    cd ..
    log_success "Frontend construido"
}

# Iniciar servicios con Docker
start_docker() {
    log_info "Iniciando servicios con Docker..."
    docker-compose down
    docker-compose up -d
    log_success "Servicios iniciados"
}

# Esperar a que la base de datos esté lista
wait_for_db() {
    log_info "Esperando a que la base de datos esté lista..."
    sleep 10
    log_success "Base de datos lista"
}

# Ejecutar migraciones
run_migrations() {
    log_info "Ejecutando migraciones..."
    
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_social_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_ai_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_finance_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_admin_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_lives_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_stories_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_groups_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_qr_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_notifications_db.sql || true
    docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_support_db.sql || true
    
    log_success "Migraciones ejecutadas"
}

# Verificar despliegue
verify_deployment() {
    log_info "Verificando despliegue..."
    
    # Verificar backend
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_success "Backend funcionando correctamente"
    else
        log_error "Backend no responde"
        exit 1
    fi
    
    # Verificar frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        log_success "Frontend funcionando correctamente"
    else
        log_error "Frontend no responde"
        exit 1
    fi
    
    log_success "Despliegue verificado exitosamente"
}

# Main
main() {
    check_env
    install_backend_deps
    install_frontend_deps
    build_frontend
    start_docker
    wait_for_db
    run_migrations
    verify_deployment
    
    echo ""
    log_success "🎉 Despliegue completado exitosamente!"
    echo ""
    echo "📱 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:5000/api/health"
    echo "🗄️  Base de Datos: localhost:5432"
    echo ""
}

# Ejecutar
main "$@"
