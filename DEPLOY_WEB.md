haslo tu mismo si dime que quieres y yo te doy# 🌐 Cómo Subir sogyTweb a la Web

## Opciones de Despliegue

### 1. **Vercel (Recomendado - Gratis)**

**Frontend en Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend en Render/Railway:**
- Sube el código a GitHub
- Conecta tu repositorio en [Render](https://render.com) o [Railway](https://railway.app)
- Configura las variables de entorno
- Render automáticamente despliega tu backend

### 2. **Heroku (Gratis con limitaciones)**

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create sogytweb

# Configurar variables de entorno
heroku config:set DB_HOST=your-db-host
heroku config:set DB_NAME=your-db-name
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set JWT_SECRET=your-jwt-secret

# Desplegar
git push heroku main
```

### 3. **DigitalOcean (Pago - Más control)**

```bash
# Crear Droplet con Ubuntu
# Instalar Node.js, PostgreSQL, Nginx

# Clonar repositorio
git clone your-repo
cd trading-tool

# Instalar dependencias
npm install
cd frontend
npm install
cd ..

# Configurar Nginx
sudo nano /etc/nginx/sites-available/sogytweb
```

### 4. **Netlify + Render (Combo Gratis)**

**Frontend en Netlify:**
```bash
cd frontend
npm run build
# Arrastra la carpeta dist a Netlify
```

**Backend en Render:**
- Sube a GitHub
- Conecta en Render
- Configura base de datos PostgreSQL en Render

## Configuración de Base de Datos en la Nube

### PostgreSQL en Render (Gratis):
1. Crea una cuenta en [Render](https://render.com)
2. Crea un nuevo "PostgreSQL Database"
3. Copia las credenciales (Internal Database URL)
4. Configura en tu backend

### PostgreSQL en Railway (Gratis):
1. Crea cuenta en [Railway](https://railway.app)
2. Crea nuevo proyecto
3. Añade PostgreSQL
4. Copia connection string

## Variables de Entorno Necesarias

En tu plataforma de despliegue, configura:

```
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app
JWT_SECRET=tu-secreto-muy-seguro
```

## Pasos Completos para Despliegue

### Opción 1: Vercel + Render (Más Fácil)

**1. Subir código a GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/sogytweb.git
git push -u origin main
```

**2. Desplegar Frontend en Vercel:**
- Ve a [vercel.com](https://vercel.com)
- Importa tu repositorio de GitHub
- Configura:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Click en Deploy

**3. Desplegar Backend en Render:**
- Ve a [render.com](https://render.com)
- Cuenta: New → Web Service
- Conecta tu repositorio de GitHub
- Configura:
  - Root Directory: `app`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment: Agrega las variables de entorno
- Click en Create Web Service

**4. Crear base de datos en Render:**
- New → PostgreSQL
- Espera a que se cree
- Copia la URL de conexión
- Actualiza las variables de entorno del backend

**5. Ejecutar migraciones:**
- En Render, abre el Shell de tu backend
- Ejecuta los scripts SQL:
```bash
psql $DATABASE_URL -f init_db.sql
psql $DATABASE_URL -f init_social_db.sql
psql $DATABASE_URL -f init_ai_db.sql
psql $DATABASE_URL -f init_finance_db.sql
psql $DATABASE_URL -f init_admin_db.sql
psql $DATABASE_URL -f init_lives_db.sql
psql $DATABASE_URL -f init_stories_db.sql
psql $DATABASE_URL -f init_groups_db.sql
psql $DATABASE_URL -f init_qr_db.sql
psql $DATABASE_URL -f init_notifications_db.sql
psql $DATABASE_URL -f init_support_db.sql
psql $DATABASE_URL -f init_profile_db.sql
psql $DATABASE_URL -f init_bookmarks_db.sql
```

**6. Crear usuario admin:**
```bash
node create_admin_user.js
```

**7. Actualizar frontend URL:**
- En Vercel, copia tu dominio
- En Render, actualiza `FRONTEND_URL` con tu dominio de Vercel

## Dominio Personalizado

### En Vercel:
1. Settings → Domains
2. Añade tu dominio (ej: sogytweb.com)
3. Configura DNS según instrucciones de Vercel

### En Render:
1. Settings → Custom Domains
2. Añade tu dominio para el backend

## SSL/HTTPS

- Vercel y Render incluyen SSL gratis automáticamente
- No necesitas configuración adicional

## Monitoreo

- **Vercel:** Dashboard de deployments y logs
- **Render:** Logs en tiempo real y métricas
- **PostgreSQL:** Render ofrece dashboard de base de datos

## Costos Estimados

**Opción Gratis:**
- Vercel: $0/mes (frontend)
- Render: $0/mes (backend + PostgreSQL)
- Total: $0/mes

**Opción Paga (si creces):**
- Vercel Pro: $20/mes
- Render: $7/mes (backend) + $7/mes (PostgreSQL)
- Total: ~$34/mes

## Soporte

Si tienes problemas:
1. Revisa los logs en Vercel/Render
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté accesible
4. Verifica que el backend y frontend estén conectados

## Recomendación

Para empezar, usa **Vercel + Render**. Es gratis, fácil de usar, y escala automáticamente cuando necesites más recursos.
