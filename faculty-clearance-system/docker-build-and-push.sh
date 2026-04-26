#!/bin/bash
# Faculty Clearance System - Docker Production Build & Push (Mac/Linux)

REGISTRY="${1:-docker.io}"
USERNAME="$2"
ACTION="${3:-both}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Faculty Clearance System - Docker Production Build & Push      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
echo "[1/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found"
    exit 1
fi
echo "✅ Docker is installed"

# Get registry info
echo ""
echo "[2/5] Configuring Docker registry..."
if [ -z "$USERNAME" ]; then
    read -p "Docker Hub username: " USERNAME
fi
IMAGE_NAME_BACKEND="$USERNAME/faculty-clearance-backend"
IMAGE_NAME_FRONTEND="$USERNAME/faculty-clearance-frontend"
IMAGE_TAG="latest"

echo "✅ Backend image: $IMAGE_NAME_BACKEND:$IMAGE_TAG"
echo "✅ Frontend image: $IMAGE_NAME_FRONTEND:$IMAGE_TAG"

# Build images
if [ "$ACTION" = "build" ] || [ "$ACTION" = "both" ]; then
    echo ""
    echo "[3/5] Building Docker images..."
    
    echo "   Building backend image..."
    docker build -t "$IMAGE_NAME_BACKEND:$IMAGE_TAG" -f backend/Dockerfile ./backend
    if [ $? -ne 0 ]; then
        echo "❌ Backend build failed"
        exit 1
    fi
    echo "✅ Backend image built"
    
    echo "   Building frontend image..."
    docker build -t "$IMAGE_NAME_FRONTEND:$IMAGE_TAG" -f frontend/Dockerfile ./frontend
    if [ $? -ne 0 ]; then
        echo "❌ Frontend build failed"
        exit 1
    fi
    echo "✅ Frontend image built"
fi

# Push images
if [ "$ACTION" = "push" ] || [ "$ACTION" = "both" ]; then
    echo ""
    echo "[4/5] Logging in to Docker Hub..."
    docker login -u $USERNAME
    if [ $? -ne 0 ]; then
        echo "❌ Docker login failed"
        exit 1
    fi
    echo "✅ Logged in to Docker Hub"
    
    echo ""
    echo "[5/5] Pushing images to registry..."
    
    echo "   Pushing backend image..."
    docker push "$IMAGE_NAME_BACKEND:$IMAGE_TAG"
    if [ $? -ne 0 ]; then
        echo "❌ Backend push failed"
        exit 1
    fi
    echo "✅ Backend image pushed"
    
    echo "   Pushing frontend image..."
    docker push "$IMAGE_NAME_FRONTEND:$IMAGE_TAG"
    if [ $? -ne 0 ]; then
        echo "❌ Frontend push failed"
        exit 1
    fi
    echo "✅ Frontend image pushed"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Docker build and push complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "🎯 Images ready to deploy:"
echo "   Backend:  docker run $IMAGE_NAME_BACKEND:$IMAGE_TAG"
echo "   Frontend: docker run $IMAGE_NAME_FRONTEND:$IMAGE_TAG"
echo ""

echo "📋 Next steps:"
echo "   1. Deploy to Docker Swarm, Kubernetes, or cloud platform"
echo "   2. Configure environment variables"
echo "   3. Set up persistent volumes for MongoDB"
echo "   4. Configure networking and reverse proxy"
echo ""
