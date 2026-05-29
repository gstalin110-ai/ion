#!/bin/bash

# sogyTweb - Script de Inicio Rápido
# Este script inicia el proyecto en modo desarrollo

set -e

echo "🚀 Iniciando sogyTweb en modo desarrollo..."

# Iniciar backend
echo "📦 Iniciando backend..."
cd app
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 5

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ sogyTweb iniciado exitosamente!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"
echo ""

# Esperar a que los procesos terminen
wait $BACKEND_PID $FRONTEND_PID
