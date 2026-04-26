#!/bin/bash
# Faculty Clearance System - Docker Production Deployment (Mac/Linux)

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Faculty Clearance System - Docker Production Deployment       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check .env file
echo "[1/4] Checking production environment..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Copy .env.docker to .env and configure it"
    exit 1
fi
echo "✅ .env file found"

# Validate environment variables
echo "   Validating required variables..."
REQUIRED=("MONGO_PASSWORD" "JWT_SECRET" "CORS_ORIGIN" "EMAIL_USER" "EMAIL_PASSWORD")
MISSING=()

for var in "${REQUIRED[@]}"; do
    if ! grep -q "^${var}=" .env; then
        MISSING+=("$var")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "⚠️  Missing variables: ${MISSING[*]}"
fi

# Check Docker
echo ""
echo "[2/4] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found"
    exit 1
fi
echo "✅ Docker is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found"
    exit 1
fi
echo "✅ Docker Compose is installed"

# Pull latest images
echo ""
echo "[3/4] Pulling latest images..."
docker compose -f docker-compose.prod.yml pull
if [ $? -ne 0 ]; then
    echo "⚠️  Some images failed to pull (this is OK if using local builds)"
fi

# Start production services
echo ""
echo "[4/4] Starting production services..."
echo "   This will start:"
echo "   • MongoDB database"
echo "   • Backend API server"
echo "   • Frontend React app"
echo "   • Nginx reverse proxy (port 80/443)"
echo ""

docker compose -f docker-compose.prod.yml up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production deployment started!"
    echo ""
    echo "📊 Service Status:"
    docker compose -f docker-compose.prod.yml ps
    
    echo ""
    echo "🌐 Access Your Application:"
    echo "   Frontend/Backend: http://localhost (http://your-domain.com)"
    echo "   API Direct:       http://localhost:5001"
    echo ""
    
    echo "📝 Useful Commands:"
    echo "   View logs:       docker compose -f docker-compose.prod.yml logs -f"
    echo "   Stop services:   docker compose -f docker-compose.prod.yml stop"
    echo "   Restart:         docker compose -f docker-compose.prod.yml restart"
    echo "   Remove all:      docker compose -f docker-compose.prod.yml down"
    echo ""
    
    echo "⏱️  Waiting for services to be healthy..."
    sleep 10
    
    echo ""
    echo "🎉 Production deployment complete!"
    echo ""
    
else
    echo "❌ Deployment failed!"
    echo "   Check Docker daemon is running"
    echo "   View logs: docker compose -f docker-compose.prod.yml logs"
    exit 1
fi

echo ""
echo "💡 Next steps:"
echo "   1. Configure SSL certificates in ./ssl directory"
echo "   2. Update DNS to point to this server"
echo "   3. Monitor logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   4. Set up automated backups for MongoDB"
echo ""
