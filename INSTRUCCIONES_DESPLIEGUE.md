# 🎯 INSTRUCCIONES COMPLETAS DE DESPLIEGUE

## ✅ LO QUE NECESITO DE TI

1. **Cuenta de GitHub** - Gratis en github.com
2. **Cuenta de Vercel** - Gratis en vercel.com  
3. **Cuenta de Render** - Gratis en render.com

## 🚀 PASO A PASO (3 PASOS SOLAMENTE)

### PASO 1: Subir código a GitHub
```bash
push_to_github.bat
```
- Te pedirá tu URL de GitHub
- Ejemplo: `https://github.com/tu-usuario/sogytweb.git`
- El script hace todo automáticamente

### PASO 2: Desplegar Frontend en Vercel
1. Entra a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click en "Deploy"
6. Espera 2-3 minutos
7. Copia tu URL (ej: `sogytweb.vercel.app`)

### PASO 3: Desplegar Backend en Render
1. Entra a [render.com](https://render.com)
2. Click en "New +"
3. Click en "Web Service"
4. Conecta tu repositorio de GitHub
5. Configura:
   - **Root Directory:** `app`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. En "Environment", agrega estas variables:
   ```
   DB_HOST=tu-db-host-render
   DB_PORT=5432
   DB_NAME=sogytweb
   DB_USER=tu-db-user-render
   DB_PASSWORD=tu-db-password-render
   JWT_SECRET=genera-un-secreto-aleatorio-largo
   FRONTEND_URL=https://tu-dominio-vercel.vercel.app
   NODE_ENV=production
   PORT=5000
   ```
7. Click en "Create Web Service"
8. Espera 3-5 minutos

### PASO 4: Crear Base de Datos en Render
1. En Render, click "New +"
2. Click "PostgreSQL"
3. Click "Create Database"
4. Copia la "Internal Database URL"
5. Actualiza las variables DB_HOST, DB_USER, DB_PASSWORD del backend
6. En el Shell del backend, ejecuta:
   ```bash
   node scripts/migrate.js
   ```

### PASO 5: Crear Usuario Admin
1. En el Shell del backend en Render:
   ```bash
   node create_admin_user.js
   ```

## 🎉 ¡LISTO!

Tu sogyTweb estará en:
- **Frontend:** https://tu-dominio.vercel.app
- **Backend:** https://tu-backend.onrender.com
- **Admin:** admin@sogytweb.com / admin123

## 💰 COSTO: $0/mes

Todo es gratis con Vercel y Render.

## ❓ ¿NECESITAS AYUDA?

Si algo falla, revisa:
1. Los logs en Vercel y Render
2. Las variables de entorno
3. Que la base de datos esté conectada

## 🔧 ARCHIVOS CREADOS AUTOMÁTICAMENTE

- `vercel.json` - Configuración Vercel
- `render.yaml` - Configuración Render  
- `push_to_github.bat` - Script para subir a GitHub
- `.gitignore` - Archivos ignorados en Git
- `scripts/migrate.js` - Ejecutar migraciones BD

Todo está listo para despliegue automático.
