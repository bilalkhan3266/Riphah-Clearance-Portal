#!/bin/bash
# Faculty Clearance System - Git Initialization Script for Mac/Linux

echo ""
echo "============================================"
echo " Initializing Git Repository"
echo "============================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "   Install with: brew install git (Mac) or apt install git (Linux)"
    exit 1
fi

# Initialize git
echo "[1/4] Initializing git repository..."
git init
if [ $? -eq 0 ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ Failed to initialize git"
    exit 1
fi

# Add all files
echo ""
echo "[2/4] Adding all files..."
git add .
if [ $? -eq 0 ]; then
    echo "✅ All files added"
else
    echo "❌ Failed to add files"
    exit 1
fi

# Create initial commit
echo ""
echo "[3/4] Creating initial commit..."
git commit -m "Initial commit: Faculty Clearance System - Production Ready"
if [ $? -eq 0 ]; then
    echo "✅ Initial commit created"
else
    echo "❌ Failed to create commit"
    exit 1
fi

# Branch to main
echo ""
echo "[4/4] Setting main branch..."
git branch -M main
if [ $? -eq 0 ]; then
    echo "✅ Main branch set"
else
    echo "❌ Failed to set main branch"
    exit 1
fi

echo ""
echo "============================================"
echo " Git Initialization Complete!"
echo "============================================"
echo ""
echo "Next Steps:"
echo "1. Create a new repository on GitHub:"
echo "   → Go to https://github.com/new"
echo "   → Name: Riphah-Clearance-Portal"
echo "   → Make it PUBLIC"
echo "   → Don't initialize with anything"
echo "   → Click \"Create repository\""
echo ""
echo "2. Add remote origin (copy from GitHub):"
echo "   → git remote add origin https://github.com/YOUR_USERNAME/Riphah-Clearance-Portal.git"
echo ""
echo "3. Push to GitHub:"
echo "   → git push -u origin main"
echo ""
echo "4. Then follow the deployment guide:"
echo "   → Open: DEPLOYMENT_QUICK_START.md"
echo ""
