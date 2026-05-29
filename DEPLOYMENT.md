# Guía de Despliegue - sogyTweb

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git
- Dominio (opcional para producción)

## 🚀 Despliegue con Docker

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd trading-tool
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Base de Datos
DB_PASSWORD=tu_password_seguro

# Backend
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=5000
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:5000
```

### 3. Iniciar con Docker Compose

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Backend (puerto 5000)
- Frontend (puerto 80)

### 4. Inicializar Base de Datos

```bash
# Ejecutar scripts SQL en orden
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_social_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_ai_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_finance_db.sql
```

### 5. Verificar el Despliegue

- Frontend: http://localhost
- Backend API: http://localhost:5000/api/health
- Base de Datos: localhost:5432

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA. Para instalar:

1. Abre la aplicación en Chrome/Edge
2. Haz clic en el icono de instalación en la barra de direcciones
3. Sigue las instrucciones

## 🔧 Despliegue en Producción

### Usando VPS (DigitalOcean, AWS, etc.)

1. **Configurar VPS**
   - Ubuntu 20.04 o superior
   - Mínimo 2GB RAM, 2 CPU
   - 20GB SSD

2. **Instalar Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Instalar Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Configurar SSL con Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```

5. **Configurar Nginx para Dominio**
   ```nginx
   server {
       server_name tu-dominio.com;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Usando Plataformas Cloud

#### Vercel (Frontend)
```bash
cd frontend
npm install -g vercel
vercel
```

#### Railway (Backend + DB)
```bash
railway login
railway init
railway up
```

#### Supabase (Backend + DB)
Usa el MCP server de Supabase para crear proyecto y desplegar.

## 📊 Monitoreo

### Logs
```bash
# Ver todos los logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Estado de Contenedores
```bash
docker-compose ps
```

### Reiniciar Servicios
```bash
docker-compose restart
```

## 🔒 Seguridad

1. **Cambiar contraseñas por defecto**
2. **Usar HTTPS en producción**
3. **Configurar firewall**
4. **Habilitar autenticación de dos factores**
5. **Usar variables de entorno para secrets**

## 📈 Escalabilidad

### Escalado Horizontal
```bash
# Escalar backend
docker-compose up -d --scale backend=3

# Usar load balancer (nginx, traefik)
```

### Escalado Vertical
- Aumentar RAM/CPU del VPS
- Usar base de datos gestionada (AWS RDS, Google Cloud SQL)

## 🔄 Actualizaciones

```bash
# Pull cambios
git pull

# Reconstruir contenedores
docker-compose build

# Reiniciar
docker-compose up -d
```

## 🐛 Troubleshooting

### Contenedor no inicia
```bash
docker-compose logs backend
docker-compose down
docker-compose up -d --build
```

### Problemas de base de datos
```bash
docker-compose exec postgres psql -U postgres -d sogytweb
```

### Limpiar todo y reiniciar
```bash
docker-compose down -v
docker-compose up -d
```

## 📞 Soporte

Para problemas técnicos, revisa:
- Logs de Docker
- Documentación de cada parte
- Issues en GitHub
