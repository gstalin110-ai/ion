@echo off
REM sogyTweb - Script de Configuración Automática
REM Este script configura todo para que puedas ingresar sin problemas

echo 🔧 Configurando sogyTweb...

REM Crear archivo .env en app
echo Creando archivo .env...
(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=sogytweb
echo DB_USER=postgres
echo DB_PASSWORD=postgres
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo FRONTEND_URL=http://localhost:3000
echo.
echo # JWT Secret
echo JWT_SECRET=sogytweb-secret-key-2024-elite
echo.
echo # File Upload
echo MAX_FILE_SIZE=10485760
echo UPLOAD_PATH=./uploads
) > app\.env

echo ✅ Archivo .env creado

REM Configurar axios en frontend
echo Configurando axios en frontend...
(
echo const axios = require('axios');
echo.
echo const api = axios.create({
echo   baseURL: 'http://localhost:5000',
echo   headers: {
echo     'Content-Type': 'application/json'
echo   }
echo });
echo.
echo // Add token to requests
echo api.interceptors.request.use((config) => {
echo   const token = localStorage.getItem('token');
echo   if (token) {
echo     config.headers.Authorization = `Bearer ${token}`;
echo   }
echo   return config;
echo });
echo.
echo module.exports = api;
) > frontend\src\api\index.js

echo ✅ Configuración de axios creada

REM Actualizar AuthContext para usar la API configurada
echo Actualizando AuthContext...
(
echo import { createContext, useContext, useState, useEffect } from 'react'
echo import api from '../api'
echo.
echo const AuthContext = createContext()
echo.
echo export const useAuth = () =^> {
echo   const context = useContext(AuthContext)
echo   if (!context) {
echo     throw new Error('useAuth must be used within an AuthProvider')
echo   }
echo   return context
echo }
echo.
echo export const AuthProvider = ({ children }) =^> {
echo   const [user, setUser] = useState(null)
echo   const [loading, setLoading] = useState(true)
echo   const [token, setToken] = useState(localStorage.getItem('token'))
echo.
echo   useEffect(() =^> {
echo     const checkAuth = async () =^> {
echo       if (token) {
echo         try {
echo           const response = await api.get('/auth/me')
echo           setUser(response.data)
echo         } catch (error) {
echo           localStorage.removeItem('token')
echo           setToken(null)
echo         }
echo       }
echo       setLoading(false)
echo     }
echo.
echo     checkAuth()
echo   }, [token])
echo.
echo   const login = async (email, password) =^> {
echo     try {
echo       const response = await api.post('/auth/login', { email, password })
echo       const { user: userData, token: newToken } = response.data
echo       
echo       localStorage.setItem('token', newToken)
echo       setToken(newToken)
echo       setUser(userData)
echo       
echo       return { success: true }
echo     } catch (error) {
echo       return { 
echo         success: false, 
echo         error: error.response?.data?.error || 'Error al iniciar sesión' 
echo       }
echo     }
echo   }
echo.
echo   const register = async (userData) =^> {
echo     try {
echo       const response = await api.post('/auth/register', userData)
echo       const { user: newUser, token: newToken } = response.data
echo       
echo       localStorage.setItem('token', newToken)
echo       setToken(newToken)
echo       setUser(newUser)
echo       
echo       return { success: true }
echo     } catch (error) {
echo       return { 
echo         success: false, 
echo         error: error.response?.data?.error || 'Error al registrar' 
echo       }
echo     }
echo   }
echo.
echo   const logout = () =^> {
echo     localStorage.removeItem('token')
echo     setToken(null)
echo     setUser(null)
echo   }
echo.
echo   const value = {
echo     user,
echo     loading,
echo     login,
echo     register,
echo     logout,
echo     isAuthenticated: !!user,
echo     isSeller: user?.is_seller
echo   }
echo.
echo   return (
echo     ^<AuthContext.Provider value={value}^>
echo       {children}
echo     ^</AuthContext.Provider^>
echo   )
echo }
echo.
echo export default AuthContext
) > frontend\src\contexts\AuthContext.jsx

echo ✅ AuthContext actualizado

echo.
echo 🎉 Configuración completada!
echo.
echo 📋 Pasos siguientes:
echo 1. Asegúrate de tener PostgreSQL instalado y corriendo
echo 2. Ejecuta: npm install (en app y frontend)
echo 3. Ejecuta los scripts SQL en la base de datos
echo 4. Ejecuta: node create_admin_user.js (en app)
echo 5. Ejecuta: start.bat para iniciar todo
echo.
echo 🔑 Credenciales Admin:
echo    Email: admin@sogytweb.com
echo    Password: admin123
echo.

pause
