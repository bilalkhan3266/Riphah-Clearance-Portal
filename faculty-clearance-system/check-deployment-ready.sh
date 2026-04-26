#!/bin/bash
# Faculty Clearance System - Deployment Helper Script for Mac/Linux

echo ""
echo "============================================"
echo " Faculty Clearance System - Deployment Check"
echo "============================================"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed:"
    node --version
else
    echo "❌ Node.js is NOT installed"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check npm
echo ""
echo "[2/5] Checking npm installation..."
if command -v npm &> /dev/null; then
    echo "✅ npm is installed:"
    npm --version
else
    echo "❌ npm is NOT installed"
    exit 1
fi

# Check Git
echo ""
echo "[3/5] Checking Git installation..."
if command -v git &> /dev/null; then
    echo "✅ Git is installed:"
    git --version
else
    echo "❌ Git is NOT installed"
    echo "   Download from: https://git-scm.com/"
    exit 1
fi

# Check Backend structure
echo ""
echo "[4/5] Checking Backend structure..."
if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json found"
else
    echo "❌ Backend package.json NOT found"
fi

if [ -f "backend/.env" ]; then
    echo "✅ Backend .env file found"
else
    echo "❌ Backend .env file NOT found"
fi

if [ -f "backend/server.js" ]; then
    echo "✅ Backend server.js found"
else
    echo "❌ Backend server.js NOT found"
fi

# Check Frontend structure
echo ""
echo "[5/5] Checking Frontend structure..."
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json found"
else
    echo "❌ Frontend package.json NOT found"
fi

if [ -d "frontend/public" ]; then
    echo "✅ Frontend public folder found"
else
    echo "❌ Frontend public folder NOT found"
fi

echo ""
echo "============================================"
echo " Deployment Check Complete"
echo "============================================"
echo ""
echo "Next Steps:"
echo "1. Ensure all checks passed ✅"
echo "2. Read DEPLOYMENT_QUICK_START.md"
echo "3. Follow the deployment guide"
echo "4. Set up MongoDB Atlas"
echo "5. Connect GitHub repository"
echo "6. Deploy to Railway (Backend)"
echo "7. Deploy to Vercel (Frontend)"
echo ""
