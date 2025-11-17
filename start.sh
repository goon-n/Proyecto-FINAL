#!/bin/bash
# start.sh - Levanta todo el stack con un clic
# Ubicación: Proyecto-FINAL/start.sh

set -e  # Si hay error, se detiene

echo "=========================================="
echo "🚀  INICIANDO STACK GIMNASIO (Docker)"
echo "=========================================="

# 1. Crear Dockerfiles si no existen
echo "📦 Verificando Dockerfiles..."

if [ ! -f backend/Dockerfile ]; then
  echo "  Creando backend/Dockerfile"
  mkdir -p backend
  cat > backend/Dockerfile <<'EOF'
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc default-libmysqlclient-dev pkg-config && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
EOF
fi

if [ ! -f frontend/Dockerfile ]; then
  echo "  Creando frontend/Dockerfile"
  mkdir -p frontend
  cat > frontend/Dockerfile <<'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF
fi

# 2. Levantar con Docker Compose
echo "🔨 Construyendo y levantando contenedores..."
docker-compose down 2>/dev/null || true
docker-compose up --build -d

# 3. Esperar a que backend esté listo
echo "⏳ Esperando a backend (max 30 s)..."
for i in {1..30}; do
  if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend respondiendo"
    break
  fi
  sleep 1
done

# 4. Abrir navegador (Windows / Linux / Mac)
echo "🌐 Abriendo aplicación..."
if command -v start > /dev/null; then
  start http://localhost:5173
elif command -v xdg-open > /dev/null; then
  xdg-open http://localhost:5173
elif command -v open > /dev/null; then
  open http://localhost:5173
fi

echo "=========================================="
echo "✅ ¡Todo listo!"
echo "   Frontend → http://localhost:5173"
echo "   Backend  → http://localhost:8000"
echo "   MySQL    → localhost:3306"
echo "=========================================="
echo "Para detener: docker-compose down"
