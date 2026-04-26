#!/bin/bash
# Faculty Clearance System - Automated Vercel Deployment for Mac/Linux

PROJECT_NAME="faculty-clearance-frontend"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Faculty Clearance System - Vercel Frontend Deployment         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
echo "[1/4] Checking Vercel CLI installation..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "   Install with: npm install -g vercel"
    exit 1
fi

vercel_version=$(vercel --version)
echo "✅ Vercel CLI found: $vercel_version"

# Login to Vercel
echo ""
echo "[2/4] Authenticating with Vercel..."
echo "   📝 Your browser will open for authentication"
vercel login
if [ $? -ne 0 ]; then
    echo "❌ Vercel authentication failed"
    exit 1
fi
echo "✅ Authenticated with Vercel"

# Navigate to frontend
echo ""
echo "[3/4] Preparing frontend for deployment..."
cd frontend

# Build frontend
echo "   Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Frontend built successfully"

# Deploy to Vercel
echo ""
echo "[4/4] Deploying frontend to Vercel..."
echo "   This may take 3-5 minutes..."
echo ""
echo "   ⚠️  When prompted, provide:"
echo "      - Project name: $PROJECT_NAME"
echo "      - Framework: React"
echo "      - Root directory: ./"
echo ""

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend deployed successfully!"
    echo ""
    echo "🔗 Your frontend URL:"
    echo "   Check Vercel dashboard for your deployment URL"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Copy your Vercel frontend URL"
    echo "   2. Go to Railway dashboard"
    echo "   3. Update CORS_ORIGIN and FRONTEND_URL with Vercel URL"
    echo "   4. Redeploy backend on Railway"
    echo "   5. Test your application at your Vercel URL"
    echo ""
else
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "🎉 Frontend deployment complete!"
