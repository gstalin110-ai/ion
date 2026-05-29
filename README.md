# sogyTweb - Ecosistema Digital Todo en Uno

sogyTweb es una plataforma digital integral que combina Marketplace Inteligente, Red Social, IA ion y Sistema Financiero en un solo ecosistema.

## 🌟 Características

### Parte 1: Marketplace Inteligente ✅
- Sistema de productos y categorías
- Buscador inteligente
- Sistema de reseñas y calificaciones
- Panel de vendedor
- Integración con productos en publicaciones sociales

### Parte 2: Red Social ✅
- Feed social (Para ti, Amigos, Local)
- Publicaciones multimedia (foto, video, texto)
- Sistema de likes, comentarios y shares
- Chat privado en tiempo real
- Sistema de amigos y seguidores
- Integración con marketplace

### Parte 3: IA ion ✅
- Chat interactivo con asistente inteligente
- Múltiples conversaciones por contexto
- Herramientas IA: generador de descripciones, posts sociales, copy de marketing
- Preferencias personalizables (voz, personalidad, idioma)
- Integración con OpenAI (configurable)

### Parte 4: Sistema Financiero ✅
- Billetera digital con saldos (total, disponible, congelado)
- Sistema de transacciones completo
- Depósitos y transferencias
- Solicitudes de retiro
- Historial de transacciones
- Sistema de afiliados y comisiones

### Parte 5: Infraestructura y Despliegue ✅
- Configuración PWA (Progressive Web App)
- Docker y Docker Compose
- Nginx para producción
- Documentación de despliegue completa

## 🛠 Stack Tecnológico

### Backend
- Node.js 18+
- Express.js
- PostgreSQL 15+
- JWT Authentication
- bcryptjs

### Frontend
- React 18
- Vite
- TailwindCSS (con Dark Mode)
- React Router
- Axios
- Lucide Icons
- Context API (Auth, Theme, Toast)
- Componentes UI Premium

### Infraestructura
- Docker
- Docker Compose
- Nginx
- PWA (Service Worker)

## 📋 Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 15 o superior
- Docker y Docker Compose (opcional)
- Git

## 🚀 Instalación Local

### Backend

1. Navegar a la carpeta `app`:
```bash
cd app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sogytweb
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto_jwt
```

4. Crear la base de datos:
```bash
createdb sogytweb
```

5. Ejecutar scripts SQL en orden:
```bash
psql -d sogytweb -f init_db.sql
psql -d sogytweb -f init_social_db.sql
psql -d sogytweb -f init_ai_db.sql
psql -d sogytweb -f init_finance_db.sql
```

6. Iniciar el servidor:
```bash
npm run dev
```

El backend estará corriendo en `http://localhost:5000`

### Frontend

1. Navegar a la carpeta `frontend`:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

## 🐳 Despliegue con Docker

### 1. Configurar variables de entorno

Crear archivo `.env` en la raíz:
```env
DB_PASSWORD=tu_password_seguro
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=5000
NODE_ENV=production
```

### 2. Iniciar con Docker Compose

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Backend (puerto 5000)
- Frontend (puerto 80)

### 3. Inicializar base de datos

```bash
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_social_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_ai_db.sql
docker exec -it sogytweb-db psql -U postgres -d sogytweb -f /docker-entrypoint-initdb.d/init_finance_db.sql
```

### 4. Verificar el despliegue

- Frontend: http://localhost
- Backend API: http://localhost:5000/api/health
- Base de Datos: localhost:5432

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA. Para instalar:

1. Abre la aplicación en Chrome/Edge
2. Haz clic en el icono de instalación en la barra de direcciones
3. Sigue las instrucciones

## 📁 Estructura del Proyecto

```
trading-tool/
├── app/                      # Backend (Node.js/Express)
│   ├── config/              # Configuración de base de datos
│   ├── middleware/          # Middleware (auth, etc.)
│   ├── models/              # Modelos de base de datos
│   ├── routes/              # Rutas API
│   ├── services/            # Servicios (IA, etc.)
│   ├── server.js            # Servidor principal
│   ├── init_db.sql          # Script inicial DB
│   ├── init_social_db.sql   # Script DB social
│   ├── init_ai_db.sql       # Script DB IA
│   ├── init_finance_db.sql  # Script DB financiero
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # Frontend (React/Vite)
│   ├── public/              # Archivos estáticos
│   │   ├── manifest.json    # Manifest PWA
│   │   └── sw.js            # Service Worker
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── layout/     # Layout (Navbar, etc.)
│   │   │   ├── products/    # Componentes productos
│   │   │   ├── social/      # Componentes red social
│   │   │   ├── ai/         # Componentes IA
│   │   │   └── finance/    # Componentes financieros
│   │   ├── contexts/        # Contextos (Auth, etc.)
│   │   ├── pages/           # Páginas
│   │   ├── App.jsx          # App principal
│   │   ├── main.jsx         # Punto de entrada
│   │   └── index.css        # Estilos globales
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── nginx.conf
│
├── Dockerfile               # Docker backend
├── docker-compose.yml       # Docker Compose
├── .dockerignore
├── DEPLOYMENT.md            # Guía de despliegue
└── README.md                # Este archivo
```

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Marketplace
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (vendedor)
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/categories` - Listar categorías
- `GET /api/reviews/product/:id` - Reseñas de producto

### Red Social
- `GET /api/posts` - Feed de publicaciones
- `POST /api/posts` - Crear publicación
- `POST /api/posts/:id/like` - Dar like
- `GET /api/posts/:id/comments` - Comentarios
- `GET /api/social/friends` - Amigos
- `POST /api/social/friends/request` - Enviar solicitud
- `GET /api/messages/conversations` - Conversaciones
- `POST /api/messages` - Enviar mensaje

### IA ion
- `GET /api/ai/conversations` - Conversaciones IA
- `POST /api/ai/conversations` - Crear conversación
- `POST /api/ai/conversations/:id/message` - Enviar mensaje a IA
- `POST /api/ai/tools/product-description` - Generar descripción
- `POST /api/ai/tools/social-post` - Generar post social
- `POST /api/ai/tools/marketing-copy` - Generar copy marketing

### Sistema Financiero
- `GET /api/wallet` - Obtener billetera
- `GET /api/wallet/transactions` - Transacciones
- `POST /api/wallet/deposit` - Depositar fondos
- `POST /api/wallet/transfer` - Transferir fondos
- `POST /api/wallet/withdraw` - Solicitar retiro

### Lives
- `GET /api/lives/active` - Lives activos
- `POST /api/lives` - Crear live
- `POST /api/lives/:id/join` - Unirse a live
- `POST /api/lives/:id/leave` - Salir de live
- `POST /api/lives/:id/end` - Finalizar live

### Stories
- `GET /api/stories/active` - Stories activas
- `POST /api/stories` - Crear story
- `DELETE /api/stories/:id` - Eliminar story
- `POST /api/stories/:id/view` - Marcar vista

### Grupos
- `GET /api/groups/public` - Grupos públicos
- `POST /api/groups` - Crear grupo
- `POST /api/groups/:id/join` - Unirse a grupo
- `POST /api/groups/:id/leave` - Salir de grupo

### Sistema QR
- `POST /api/qr/generate` - Generar QR
- `GET /api/qr/:order_id` - Obtener QR
- `POST /api/qr/:code/scan` - Escanear QR

### Afiliados
- `GET /api/affiliate/stats` - Estadísticas afiliado
- `POST /api/affiliate/click` - Registrar click
- `POST /api/affiliate/conversion` - Registrar conversión

### Disputas
- `GET /api/disputes/my` - Mis disputas
- `POST /api/disputes` - Crear disputa
- `GET /api/disputes/:id` - Detalle disputa
- `POST /api/disputes/:id/messages` - Enviar mensaje

### Notificaciones
- `GET /api/notifications` - Mis notificaciones
- `GET /api/notifications/unread-count` - Contador no leídas
- `PUT /api/notifications/:id/read` - Marcar leída
- `PUT /api/notifications/read-all` - Marcar todas leídas

### Analítica
- `GET /api/analytics/dashboard` - Estadísticas dashboard
- `GET /api/analytics/engagement` - Tasa de engagement
- `GET /api/analytics/top-posts` - Posts populares
- `GET /api/analytics/demographics` - Demografía audiencia
- `GET /api/analytics/follower-growth` - Crecimiento seguidores

### Soporte
- `GET /api/support/my` - Mis tickets
- `POST /api/support` - Crear ticket
- `GET /api/support/:id` - Detalle ticket
- `POST /api/support/:id/messages` - Enviar mensaje

## 🔒 Seguridad

- Autenticación JWT
- Hashing de contraseñas con bcryptjs
- Middleware de seguridad (Helmet, CORS)
- Rate limiting
- Validación de datos con express-validator

## 📊 Despliegue en Producción

Para despliegue en producción, consulta `DEPLOYMENT.md` que incluye:
- Configuración VPS
- SSL con Let's Encrypt
- Escalabilidad horizontal y vertical
- Monitoreo y logs
- Troubleshooting

## 🎨 Características Premium de UI/UX

### Sistema de Temas
- Dark/Light mode con persistencia
- Transiciones suaves
- Colores personalizables
- Accesibilidad WCAG 2.1

### Componentes UI Premium
- **Modal** - Ventanas modales con backdrop blur
- **Button** - Botones con loading states y variantes
- **Card** - Tarjetas con hover effects
- **Badge** - Badges con múltiples variantes
- **Input/Textarea** - Inputs con validación
- **Select** - Selects personalizados
- **Avatar** - Avatares con fallback
- **Rating** - Sistema de estrellas
- **ProgressBar** - Barras de progreso animadas
- **Tabs** - Pestañas con animaciones
- **Tooltip** - Tooltips posicionables
- **Dropdown** - Menús desplegables
- **Switch** - Interruptores animados
- **Chip** - Tags removibles

### Animaciones Premium
- fade-in, fade-out
- slide-in, slide-out, slide-up, slide-down
- scale-in, scale-out
- bounce-in
- float
- shimmer
- pulse-slow, spin-slow

### IA Configuration
Para habilitar la IA real con OpenAI, configura en `.env`:
```
OPENAI_API_KEY=tu_api_key
OPENAI_MODEL=gpt-3.5-turbo
```

## 📞 Soporte

Para más información:
- Documentación de despliegue: `DEPLOYMENT.md`
- Issues en GitHub

## 📄 Licencia

Este proyecto es parte de sogyTweb - Documento Maestro Oficial

## 🎁 Dedicado

Este ecosistema digital está dedicado como regalo especial por el cumpleaños 18. Un año de investigación y desarrollo para crear algo verdaderamente especial.

---

**Nota**: Este es el proyecto completo de sogyTweb v2.0 Elite con todas las características premium implementadas.

<div align="center">

**Hecho con ❤️ y dedicación**

[⬆ Volver al inicio](#sogytweb---ecosistema-digital-todo-en-uno-)

</div>
