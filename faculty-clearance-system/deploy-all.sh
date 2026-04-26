#!/bin/bash
# Faculty Clearance System - Complete Automated Deployment (Mac/Linux)

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║  🚀 FACULTY CLEARANCE SYSTEM - COMPLETE DEPLOYMENT 🚀          ║"
echo "║                                                                ║"
echo "║  Vercel (Frontend) + Railway (Backend) + MongoDB Atlas (DB)    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Show deployment options
echo "Select what to deploy:"
echo ""
echo "  1️⃣  Deploy Backend Only (Railway)"
echo "  2️⃣  Deploy Frontend Only (Vercel)"
echo "  3️⃣  Deploy Both (Backend + Frontend)"
echo "  4️⃣  Full Setup (MongoDB + Railway + Vercel)"
echo ""

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Deploying Backend to Railway..."
        echo ""
        bash deploy-railway.sh
        ;;
    2)
        echo ""
        echo "Deploying Frontend to Vercel..."
        echo ""
        bash deploy-vercel.sh
        ;;
    3)
        echo ""
        echo "Deploying Backend and Frontend..."
        echo ""
        
        echo "Step 1/2: Deploying Backend to Railway..."
        bash deploy-railway.sh
        
        echo ""
        echo "Step 2/2: Deploying Frontend to Vercel..."
        bash deploy-vercel.sh
        
        echo ""
        echo "✅ Both deployments complete!"
        ;;
    4)
        echo ""
        echo "Full Production Setup"
        echo ""
        
        echo "This script will guide you through:"
        echo "  ✅ Validating prerequisites"
        echo "  ✅ Setting up MongoDB Atlas"
        echo "  ✅ Deploying to Railway (Backend)"
        echo "  ✅ Deploying to Vercel (Frontend)"
        echo "  ✅ Connecting all services"
        echo ""
        
        echo "Prerequisites:"
        echo "  • Railway CLI installed: npm install -g @railway/cli"
        echo "  • Vercel CLI installed: npm install -g vercel"
        echo "  • MongoDB Atlas account created"
        echo "  • Railway account created"
        echo "  • Vercel account created"
        echo ""
        
        read -p "Continue with full setup? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "Step 1/2: Deploying Backend to Railway..."
            bash deploy-railway.sh
            
            echo ""
            echo "Step 2/2: Deploying Frontend to Vercel..."
            bash deploy-vercel.sh
            
            echo ""
            echo "════════════════════════════════════════════════════════════════"
            echo "✅ DEPLOYMENT COMPLETE!"
            echo "════════════════════════════════════════════════════════════════"
            echo ""
            echo "📋 FINAL STEPS:"
            echo ""
            echo "1️⃣  Update Railway CORS Variables:"
            echo "   • Go to Railway Dashboard"
            echo "   • Select your backend project"
            echo "   • Update variables:"
            echo "     - CORS_ORIGIN = <your-vercel-url>"
            echo "     - FRONTEND_URL = <your-vercel-url>"
            echo "   • Redeploy backend"
            echo ""
            echo "2️⃣  Set Frontend Environment Variables:"
            echo "   • Go to Vercel Dashboard"
            echo "   • Select your frontend project"
            echo "   • Add environment variable:"
            echo "     - REACT_APP_API_URL = <your-railway-url>"
            echo "   • Redeploy frontend"
            echo ""
            echo "3️⃣  Test Your Application:"
            echo "   • Open your Vercel frontend URL in browser"
            echo "   • Test login with faculty credentials"
            echo "   • Test clearance submission"
            echo "   • Test clearance status"
            echo ""
            echo "✨ Your system is now in production!"
            echo ""
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 Deployment Script Completed"
echo "════════════════════════════════════════════════════════════════"
echo ""
