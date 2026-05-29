# sogyTweb - Parte 1: Marketplace Inteligente

## 📋 Descripción

Esta es la **Parte 1** de sogyTweb, un marketplace inteligente moderno con las siguientes características:

- ✅ Registro y autenticación de usuarios
- ✅ Creación y gestión de productos
- ✅ Sistema de categorías
- ✅ Buscador inteligente de productos
- ✅ Sistema de reseñas y calificaciones
- ✅ Panel de vendedor
- ✅ Interfaz moderna y responsiva

## 🚀 Instalación

### Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

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

Editar `.env` con tus credenciales de PostgreSQL:
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

5. Ejecutar el script de inicialización:
```bash
psql -d sogytweb -f init_db.sql
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

## 📁 Estructura del Proyecto

```
trading-tool/
├── app/                      # Backend (Node.js/Express)
│   ├── config/
│   │   └── database.js       # Configuración de PostgreSQL
│   ├── middleware/
│   │   └── auth.js           # Middleware de autenticación
│   ├── models/
│   │   ├── Product.js        # Modelo de productos
│   │   ├── User.js           # Modelo de usuarios
│   │   ├── Category.js       # Modelo de categorías
│   │   └── Review.js         # Modelo de reseñas
│   ├── routes/
│   │   ├── auth.js           # Rutas de autenticación
│   │   ├── products.js       # Rutas de productos
│   │   ├── categories.js     # Rutas de categorías
│   │   ├── users.js          # Rutas de usuarios
│   │   └── reviews.js        # Rutas de reseñas
│   ├── server.js             # Servidor principal
│   ├── init_db.sql            # Script de inicialización de BD
│   ├── package.json
│   └── .env.example
│
└── frontend/                 # Frontend (React/Vite)
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Navbar.jsx
    │   │   ├── products/
    │   │   │   ├── ProductCard.jsx
    │   │   │   └── ProductGrid.jsx
    │   │   └── categories/
    │   │       └── CategoryFilter.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── SellerDashboard.jsx
    │   │   └── CreateProduct.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Productos
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/recommended` - Productos recomendados
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (vendedor)
- `PUT /api/products/:id` - Actualizar producto (vendedor)
- `DELETE /api/products/:id` - Eliminar producto (vendedor)
- `GET /api/products/seller/:sellerId` - Productos de un vendedor

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría por ID
- `GET /api/categories/:id/subcategories` - Subcategorías

### Usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/password` - Cambiar contraseña
- `PUT /api/users/seller-mode` - Activar modo vendedor
- `GET /api/users/:id/stats` - Estadísticas de vendedor

### Reseñas
- `GET /api/reviews/product/:productId` - Reseñas de un producto
- `GET /api/reviews/user/:userId` - Reseñas de un usuario
- `GET /api/reviews/stats/:productId` - Estadísticas de reseñas
- `POST /api/reviews` - Crear reseña
- `PUT /api/reviews/:id` - Actualizar reseña
- `DELETE /api/reviews/:id` - Eliminar reseña

## 🎨 Características del Frontend

- **Diseño moderno** con TailwindCSS
- **Animaciones suaves** con Framer Motion
- **Responsive** para móviles y escritorio
- **Sistema de autenticación** con JWT
- **Panel de vendedor** intuitivo
- **Buscador** con filtros
- **Sistema de categorías** dinámico

## 📝 Próximas Partes

- **Parte 2**: Red Social (Feed, Lives, Chat, Grupos)
- **Parte 3**: IA ion (Chat, Generación de contenido, Automatización)
- **Parte 4**: Sistema Financiero (Billetera, Pagos, Retiros)
- **Parte 5**: Infraestructura (PWA, Escalabilidad, Despliegue)

## 🛠️ Tecnologías

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcryptjs
- CORS
- Helmet

### Frontend
- React 18
- Vite
- React Router
- TailwindCSS
- Framer Motion
- Axios
- Lucide Icons

## 📄 Licencia

Este proyecto es parte de sogyTweb - Documento Maestro Oficial

---

**Nota**: Esta es la Parte 1 del proyecto. Las siguientes partes se construirán sobre esta base.
