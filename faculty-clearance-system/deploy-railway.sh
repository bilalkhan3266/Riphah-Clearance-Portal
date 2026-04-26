#!/bin/bash
# Faculty Clearance System - Automated Railway Deployment for Mac/Linux

PROJECT_NAME="faculty-clearance-backend"
ENVIRONMENT="production"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Faculty Clearance System - Railway Backend Deployment         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Railway CLI is installed
echo "[1/5] Checking Railway CLI installation..."
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "   Install with: npm install -g @railway/cli"
    exit 1
fi

railway_version=$(railway --version)
echo "✅ Railway CLI found: $railway_version"

# Login to Railway
echo ""
echo "[2/5] Authenticating with Railway..."
echo "   📝 Your browser will open for authentication"
railway login
if [ $? -ne 0 ]; then
    echo "❌ Railway authentication failed"
    exit 1
fi
echo "✅ Authenticated with Railway"

# Link to project
echo ""
echo "[3/5] Linking to Railway project..."
railway link
if [ $? -ne 0 ]; then
    echo "❌ Project link failed"
    echo "   You may need to create a project first in Railway dashboard"
    exit 1
fi
echo "✅ Project linked"

# Set environment variables
echo ""
echo "[4/5] Configuring environment variables..."
echo "   Setting PORT..."
railway variables set PORT=5001

echo "   Setting NODE_ENV..."
railway variables set NODE_ENV=production

echo ""
echo "   ⚠️  IMPORTANT: Set these additional variables in Railway dashboard:"
echo "      - MONGO_URI (MongoDB Atlas connection string)"
echo "      - JWT_SECRET (random 32+ character string)"
echo "      - CORS_ORIGIN (your Vercel frontend URL)"
echo "      - FRONTEND_URL (your Vercel frontend URL)"
echo "      - EMAIL_USER (Gmail address)"
echo "      - EMAIL_PASSWORD (Gmail app password)"
echo ""
echo "   Do this now, then press Enter to continue..."
read

# Deploy backend
echo ""
echo "[5/5] Deploying backend to Railway..."
echo "   This may take 5-10 minutes..."
cd backend
railway up --detach

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend deployed successfully!"
    echo ""
    echo "📊 Deployment Details:"
    railway status
    echo ""
    echo "🔗 Get your backend URL:"
    railway domain
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Copy your Railway domain URL"
    echo "   2. Update CORS_ORIGIN in Railway variables"
    echo "   3. Deploy frontend to Vercel"
    echo "   4. Update REACT_APP_API_URL in Vercel"
    echo ""
else
    echo "❌ Deployment failed"
    echo "   Check logs: railway logs"
    exit 1
fi

echo ""
echo "🎉 Backend deployment complete!"
