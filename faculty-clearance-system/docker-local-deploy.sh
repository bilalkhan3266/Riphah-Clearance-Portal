#!/bin/bash
# Faculty Clearance System - Docker Local Deployment (Mac/Linux)

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Faculty Clearance System - Docker Local Deployment            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
echo "[1/5] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "   Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

docker_version=$(docker --version)
echo "✅ Docker found: $docker_version"

# Check if Docker Compose is installed
echo ""
echo "[2/5] Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "   It's included with Docker Desktop"
    exit 1
fi

echo "✅ Docker Compose found"

# Check if .env file exists
echo ""
echo "[3/5] Checking environment configuration..."
if [ -f ".env.docker" ]; then
    echo "✅ .env.docker file found"
    read -p "Use existing .env.docker? (yes/no): " useEnv
    if [ "$useEnv" != "yes" ]; then
        cp .env.docker .env
        echo "✅ Created .env from .env.docker"
    else
        cp .env.docker .env
    fi
else
    echo "⚠️  .env.docker not found, using defaults"
fi

# Pull latest images
echo ""
echo "[4/5] Pulling Docker images..."
docker pull mongo:6.0-alpine > /dev/null
docker pull node:18-alpine > /dev/null
docker pull nginx:alpine > /dev/null
echo "✅ Images pulled"

# Start services
echo ""
echo "[5/5] Starting services with Docker Compose..."
echo "   This will start:"
echo "   • MongoDB database (port 27017)"
echo "   • Backend API server (port 5001)"
echo "   • Frontend React app (port 3000)"
echo ""

docker compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All services started successfully!"
    echo ""
    echo "📊 Service Status:"
    docker compose ps
    
    echo ""
    echo "🌐 Access Your Application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5001"
    echo "   MongoDB:   mongodb://localhost:27017"
    echo ""
    
    echo "📝 Useful Commands:"
    echo "   View logs:       docker compose logs -f"
    echo "   Stop services:   docker compose stop"
    echo "   Restart:         docker compose restart"
    echo "   Remove all:      docker compose down"
    echo "   Remove volumes:  docker compose down -v"
    echo ""
    
    echo "⏱️  Waiting for services to be healthy..."
    sleep 5
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "   Your application is running at http://localhost:3000"
    echo ""
    
else
    echo "❌ Deployment failed!"
    echo "   Check Docker daemon is running"
    echo "   Check available disk space"
    echo "   View logs: docker compose logs"
    exit 1
fi

echo ""
echo "💡 Tip: To view live logs, run: docker compose logs -f"
