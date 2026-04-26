# Docker Deployment Guide - Faculty Clearance System

## 📋 Overview

This guide covers complete Docker-based deployment of the Faculty Clearance System, including local development and production deployment.

**What you'll get:**
- ✅ Fully containerized application stack
- ✅ One-command local deployment with Docker Compose
- ✅ Production-ready orchestration
- ✅ Automated CI/CD pipelines
- ✅ Complete dependency isolation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                   │
│              (Port 80, Optional SSL 443)                 │
└──────────────┬──────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    ┌───▼──────┐  ┌──▼───────────┐
    │ Frontend  │  │  Backend API  │
    │ (React)   │  │  (Node.js)    │
    │ Port 3000 │  │  Port 5001    │
    └───┬──────┘  └──┬───────────┘
        │            │
        │       ┌────▼────┐
        │       │ MongoDB  │
        │       │ Database │
        └───────┘          │
                └──────────┘
```

## 🚀 Quick Start

### Local Development (3 commands)

```bash
# Windows PowerShell
.\docker-local-deploy.ps1

# Windows CMD
docker-local-deploy.bat

# Mac/Linux
bash docker-local-deploy.sh
```

**Result:** Full stack running at `http://localhost:3000`

### Production Deployment (2 steps)

```bash
# 1. Configure environment
cp .env.docker .env
# Edit .env with your production values

# 2. Deploy
.\docker-prod-deploy.ps1          # Windows
bash docker-prod-deploy.sh         # Mac/Linux
```

## 📁 Docker Files Structure

```
faculty-clearance-system/
├── backend/
│   ├── Dockerfile              # Multi-stage Node.js build
│   ├── .dockerignore          # Excludes for build optimization
│   └── (source code)
├── frontend/
│   ├── Dockerfile              # Multi-stage React build with Nginx
│   ├── .dockerignore          # Excludes for build optimization
│   ├── nginx.conf             # Nginx configuration
│   ├── default.conf           # Site configuration
│   └── (source code)
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production orchestration
├── nginx-prod.conf            # Production reverse proxy
├── .env.docker                # Environment template
├── docker-local-deploy.ps1/sh/bat    # Local deployment scripts
├── docker-prod-deploy.ps1/sh   # Production deployment scripts
└── docker-build-and-push.ps1/sh/bat # Registry push scripts
```

## 🔧 Docker Images

### Backend Image
- **Base:** `node:18-alpine` (~160MB)
- **Multi-stage:** Builder stage + Production stage
- **Features:**
  - Non-root user (nodejs:1001)
  - Health checks
  - Graceful shutdown with dumb-init
  - Production dependencies only
- **Port:** 5001

### Frontend Image
- **Base:** `nginx:alpine` (~40MB)
- **Multi-stage:** Builder stage (node) + Production stage (nginx)
- **Features:**
  - React app built in builder stage
  - Nginx serves static files
  - SPA routing support
  - Gzip compression
  - Non-root user (nginx:101)
- **Port:** 3000

### MongoDB Image
- **Image:** `mongo:6.0-alpine`
- **Port:** 27017
- **Volume:** /data/db (persistent storage)

## 🐳 Docker Compose Files

### docker-compose.yml (Development)

Used for local development with hot-reload and debugging:

```bash
docker compose up -d          # Start all services
docker compose logs -f         # View logs
docker compose down           # Stop all services
docker compose down -v        # Stop and remove volumes
```

**Services:**
- MongoDB with local admin credentials
- Backend API with volume mounts for development
- Frontend React with volume mounts for development

### docker-compose.prod.yml (Production)

Used for production deployment with security hardening:

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

**Services:**
- MongoDB with authentication
- Backend API with restart policies
- Frontend React with restart policies
- Nginx reverse proxy with rate limiting

## ⚙️ Environment Configuration

### .env.docker Template

Copy and customize for your environment:

```bash
# Development/Testing
NODE_ENV=development

# Database
MONGO_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=min_32_character_random_secret_key_here

# CORS & Frontend
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=System <noreply@company.com>
```

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| NODE_ENV | Node.js environment | development, production |
| MONGO_PASSWORD | MongoDB root password | securePassword123 |
| JWT_SECRET | JWT signing key (32+ chars) | your_random_key... |
| CORS_ORIGIN | Frontend URL for CORS | http://localhost:3000 |
| FRONTEND_URL | Frontend base URL | http://example.com |
| EMAIL_* | Email service credentials | Gmail SMTP settings |

## 🏗️ Building Images Locally

### Build All Images

```bash
# Windows
.\docker-build-and-push.ps1 -Username yourusername -Action build

# Mac/Linux
bash docker-build-and-push.sh yourusername build
```

### Build Specific Image

```bash
# Backend
docker build -t myusername/faculty-clearance-backend:latest -f backend/Dockerfile ./backend

# Frontend
docker build -t myusername/faculty-clearance-frontend:latest -f frontend/Dockerfile ./frontend
```

### View Built Images

```bash
docker images | grep faculty-clearance
```

## 🚢 Pushing to Docker Registry

### Push to Docker Hub

```bash
# 1. Build images
.\docker-build-and-push.ps1 -Username yourusername -Action build

# 2. Login to Docker Hub
docker login

# 3. Push images
docker push yourusername/faculty-clearance-backend:latest
docker push yourusername/faculty-clearance-frontend:latest
```

### Using Script

```bash
.\docker-build-and-push.ps1 -Username yourusername -Action both
```

## 🧪 Testing Deployment

### Local Testing

```bash
# Start services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Test backend
curl http://localhost:5001/api/health

# Test frontend
curl http://localhost:3000

# Stop services
docker compose down
```

### Health Checks

Each service has built-in health checks:

```bash
# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🔒 Security Considerations

### What's Included

- ✅ Non-root users in all containers
- ✅ Read-only filesystems where applicable
- ✅ Health checks for container orchestration
- ✅ Environment variable isolation
- ✅ Network segmentation with Docker networks

### Additional Recommendations

1. **SSL/TLS Certificate**
   ```bash
   mkdir ssl
   # Add cert.pem and key.pem to ssl/ directory
   ```

2. **MongoDB Authentication**
   - Already configured in compose files
   - Change default password in .env

3. **Nginx Reverse Proxy**
   - Rate limiting configured
   - Security headers added
   - HTTPS ready for production

4. **Environment Variables**
   - Never commit .env file
   - Use secrets management for production
   - Rotate JWT_SECRET regularly

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Last 100 lines
docker compose logs --tail=100 backend

# Follow and tail
docker compose logs -f --tail=50
```

### Container Resource Usage

```bash
docker stats
```

### Network Inspection

```bash
docker network ls
docker network inspect faculty-network
```

## 🔧 Common Tasks

### Restart a Service

```bash
docker compose restart backend
docker compose restart frontend
docker compose restart mongodb
```

### View Service Logs

```bash
docker compose logs -f mongodb
docker compose logs -f backend
docker compose logs -f frontend
```

### Execute Commands in Container

```bash
# Backend shell
docker compose exec backend sh

# MongoDB console
docker compose exec mongodb mongosh

# Frontend shell
docker compose exec frontend sh
```

### Clean Up

```bash
# Stop all containers
docker compose stop

# Remove stopped containers
docker compose rm

# Remove volumes
docker compose down -v

# Remove all: containers, images, volumes
docker system prune -a --volumes
```

## 📈 Production Deployment Checklist

- [ ] Create production `.env` file
- [ ] Set strong `MONGO_PASSWORD` and `JWT_SECRET`
- [ ] Configure email credentials
- [ ] Add SSL certificates to `./ssl` directory
- [ ] Configure domain DNS
- [ ] Run `docker-prod-deploy.ps1/sh`
- [ ] Verify all services running
- [ ] Test user registration and login
- [ ] Set up monitoring and alerting
- [ ] Configure automated backups
- [ ] Document deployment procedures

## 🐛 Troubleshooting

### Containers Won't Start

```bash
# Check error logs
docker compose logs

# Rebuild images
docker compose build --no-cache

# Check Docker daemon
docker info
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000              # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Change ports in docker-compose.yml
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker compose ps

# Connect to MongoDB directly
docker compose exec mongodb mongosh -u admin -p

# Check logs
docker compose logs mongodb
```

### High Memory/CPU Usage

```bash
# Monitor resources
docker stats

# Check container logs for errors
docker compose logs backend

# Restart problematic service
docker compose restart backend
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

## ✅ Verification Commands

```bash
# Verify all services running
docker compose ps

# Check network connectivity
docker compose exec backend curl http://frontend:3000
docker compose exec backend curl http://mongodb:27017

# Verify database connection
docker compose exec backend npm test

# Check frontend build
docker compose exec frontend npm run build

# Health check endpoints
curl http://localhost:5001/api/health
curl http://localhost:3000/health
```

## 🎯 Next Steps

1. **Local Development:** Run `docker-local-deploy.ps1/sh`
2. **Testing:** Execute verification commands
3. **Production:** Configure `.env` and run `docker-prod-deploy.ps1/sh`
4. **Monitoring:** Set up Docker monitoring dashboard
5. **CI/CD:** Enable GitHub Actions workflows
6. **Backup:** Configure MongoDB backup strategy

---

**For additional help:**
- Check Docker Compose logs: `docker compose logs`
- Review deployment scripts for detailed commands
- Consult troubleshooting section above
