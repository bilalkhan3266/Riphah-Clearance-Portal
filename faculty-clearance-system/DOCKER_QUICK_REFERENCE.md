# Docker Quick Reference - Faculty Clearance System

## ⚡ Quick Commands

### Start Local Development
```bash
# Windows PowerShell
.\docker-local-deploy.ps1

# Windows CMD
docker-local-deploy.bat

# Mac/Linux
bash docker-local-deploy.sh
```

### Stop All Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f              # All services
docker compose logs -f backend      # Specific service
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Restart Services
```bash
docker compose restart              # All
docker compose restart backend      # Specific
```

### View Running Containers
```bash
docker compose ps
```

### Build Images Locally
```bash
# Windows
.\docker-build-and-push.ps1 -Username yourname -Action build

# Mac/Linux
bash docker-build-and-push.sh yourname build
```

### Push to Docker Registry
```bash
# Windows
.\docker-build-and-push.ps1 -Username yourname -Action both

# Mac/Linux
bash docker-build-and-push.sh yourname both
```

### Production Deployment
```bash
# Windows PowerShell
.\docker-prod-deploy.ps1

# Mac/Linux
bash docker-prod-deploy.sh
```

## 📊 Useful Docker Commands

### Container Management
```bash
docker ps                           # List running containers
docker ps -a                        # All containers
docker stop <container>             # Stop container
docker start <container>            # Start container
docker rm <container>               # Remove container
docker logs <container>             # View logs
docker exec -it <container> sh      # Shell into container
```

### Image Management
```bash
docker images                       # List images
docker build -t name:tag .          # Build image
docker push name:tag                # Push to registry
docker pull name:tag                # Pull from registry
docker rmi image:tag                # Remove image
docker tag old:tag new:tag          # Tag image
```

### Docker Compose Commands
```bash
docker compose up -d                # Start services (detached)
docker compose up                   # Start services (foreground)
docker compose down                 # Stop and remove services
docker compose stop                 # Stop without removing
docker compose restart              # Restart services
docker compose ps                   # List services
docker compose logs                 # View logs
docker compose exec service cmd     # Execute command in service
docker compose build                # Build images
```

### Network Management
```bash
docker network ls                   # List networks
docker network inspect faculty-network   # Network details
docker network create name          # Create network
```

### Volume Management
```bash
docker volume ls                    # List volumes
docker volume inspect volume        # Volume details
docker volume rm volume             # Remove volume
docker volume prune                 # Remove unused volumes
```

## 🔍 Diagnostics

### Check Service Health
```bash
# Test backend API
curl http://localhost:5001/api/health

# Test frontend
curl http://localhost:3000

# Test MongoDB
mongosh localhost:27017 -u admin -p
```

### Monitor Resources
```bash
docker stats                        # Real-time stats
docker stats --no-stream           # One-time snapshot
```

### Debug Container
```bash
# Enter container shell
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec mongodb bash

# View environment variables
docker compose exec backend env
```

### Check Logs for Errors
```bash
# Last 50 lines
docker compose logs --tail=50

# Specific time range
docker compose logs --since 2024-01-01T00:00:00

# Follow output
docker compose logs -f

# Specific service
docker compose logs -f backend | grep ERROR
```

## 🛠️ Troubleshooting

### Clean Up Everything
```bash
docker compose down -v              # Stop and remove volumes
docker system prune -a --volumes    # Deep clean
```

### Rebuild Images
```bash
docker compose build --no-cache
```

### Fix "Port Already in Use"
```bash
# Find what's using the port
lsof -i :3000                       # Mac/Linux
netstat -ano | findstr :3000        # Windows

# Kill process (Mac/Linux)
kill -9 <PID>
```

### Restart Docker Daemon
```bash
# Windows: Use Docker Desktop
# Mac: brew services restart docker
# Linux: sudo systemctl restart docker
```

### Check Disk Space
```bash
docker system df
docker system df --verbose
```

### Remove Unused Resources
```bash
docker system prune              # Containers, networks, dangling images
docker system prune -a           # Include unused images
docker system prune -a --volumes # Include unused volumes
```

## 📝 Environment Setup

### Create .env File
```bash
cp .env.docker .env
# Edit .env with your values
```

### Required Variables
```
NODE_ENV=development
MONGO_PASSWORD=secure_password
JWT_SECRET=min_32_character_secret
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
EMAIL_FROM=System <noreply@company.com>
```

## 🚀 Deployment Scenarios

### Local Development
```bash
./docker-local-deploy.ps1/sh/bat
```

### Staging Deployment
```bash
cp .env.staging .env
docker compose -f docker-compose.yml up -d
```

### Production Deployment
```bash
cp .env.production .env
./docker-prod-deploy.ps1/sh
```

## 📚 File Reference

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Backend image definition |
| `frontend/Dockerfile` | Frontend image definition |
| `docker-compose.yml` | Local development config |
| `docker-compose.prod.yml` | Production config |
| `nginx-prod.conf` | Nginx reverse proxy config |
| `frontend/nginx.conf` | Frontend Nginx config |
| `frontend/default.conf` | Frontend site config |
| `.env.docker` | Environment template |
| `docker-local-deploy.ps1/sh/bat` | Local deployment script |
| `docker-prod-deploy.ps1/sh` | Production deployment script |
| `docker-build-and-push.ps1/sh/bat` | Build and push script |

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Start services
docker compose up -d

# 2. Make code changes
# (Files auto-reload if volumes mounted)

# 3. View logs
docker compose logs -f

# 4. Stop when done
docker compose down
```

### Build for Production
```bash
# 1. Update code
git commit -m "Update code"

# 2. Build images
.\docker-build-and-push.ps1 -Username myname -Action build

# 3. Test locally
docker compose up -d && sleep 10 && curl http://localhost:3000

# 4. Push to registry
docker push myname/faculty-clearance-backend:latest
docker push myname/faculty-clearance-frontend:latest

# 5. Deploy
.\docker-prod-deploy.ps1
```

### Debug Issue
```bash
# 1. Check logs
docker compose logs -f backend

# 2. Enter container
docker compose exec backend sh

# 3. Check environment
env | grep MONGO

# 4. Test connectivity
curl http://mongodb:27017

# 5. Exit and restart
exit
docker compose restart backend
```

## ⚠️ Important Notes

- **Always use `.env`** - Never hardcode secrets
- **Health checks** - Services have built-in health checks
- **Volumes** - Development uses volume mounts; production doesn't
- **Networks** - Services communicate via service names (e.g., `mongodb`)
- **Ports** - Internal ports (5001, 3000) vs external ports (mapped in compose)

## 🆘 Getting Help

1. **Check logs:** `docker compose logs -f`
2. **Check status:** `docker compose ps`
3. **Check resources:** `docker stats`
4. **Review scripts:** Look in deployment script for detailed commands
5. **Read guide:** See `DOCKER_DEPLOYMENT_GUIDE.md` for comprehensive documentation
