#!/usr/bin/env pwsh
# Faculty Clearance System - Complete Automated Deployment
# Master orchestration script for full production deployment

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                                                ║" -ForegroundColor Magenta
Write-Host "║  🚀 FACULTY CLEARANCE SYSTEM - COMPLETE DEPLOYMENT 🚀          ║" -ForegroundColor Magenta
Write-Host "║                                                                ║" -ForegroundColor Magenta
Write-Host "║  Vercel (Frontend) + Railway (Backend) + MongoDB Atlas (DB)    ║" -ForegroundColor Magenta
Write-Host "║                                                                ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Show deployment options
Write-Host "Select what to deploy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1️⃣  Deploy Backend Only (Railway)" -ForegroundColor Cyan
Write-Host "  2️⃣  Deploy Frontend Only (Vercel)" -ForegroundColor Cyan
Write-Host "  3️⃣  Deploy Both (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "  4️⃣  Full Setup (MongoDB + Railway + Vercel)" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Deploying Backend to Railway..." -ForegroundColor Green
        Write-Host ""
        & .\deploy-railway.ps1
    }
    "2" {
        Write-Host ""
        Write-Host "Deploying Frontend to Vercel..." -ForegroundColor Green
        Write-Host ""
        & .\deploy-vercel.ps1
    }
    "3" {
        Write-Host ""
        Write-Host "Deploying Backend and Frontend..." -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Step 1/2: Deploying Backend to Railway..." -ForegroundColor Yellow
        & .\deploy-railway.ps1
        
        Write-Host ""
        Write-Host "Step 2/2: Deploying Frontend to Vercel..." -ForegroundColor Yellow
        & .\deploy-vercel.ps1
        
        Write-Host ""
        Write-Host "✅ Both deployments complete!" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "Full Production Setup" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "This script will guide you through:" -ForegroundColor Cyan
        Write-Host "  ✅ Validating prerequisites" -ForegroundColor Green
        Write-Host "  ✅ Setting up MongoDB Atlas" -ForegroundColor Green
        Write-Host "  ✅ Deploying to Railway (Backend)" -ForegroundColor Green
        Write-Host "  ✅ Deploying to Vercel (Frontend)" -ForegroundColor Green
        Write-Host "  ✅ Connecting all services" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Prerequisites:" -ForegroundColor Yellow
        Write-Host "  • Railway CLI installed: npm install -g @railway/cli" -ForegroundColor Cyan
        Write-Host "  • Vercel CLI installed: npm install -g vercel" -ForegroundColor Cyan
        Write-Host "  • MongoDB Atlas account created" -ForegroundColor Cyan
        Write-Host "  • Railway account created" -ForegroundColor Cyan
        Write-Host "  • Vercel account created" -ForegroundColor Cyan
        Write-Host ""
        
        $confirm = Read-Host "Continue with full setup? (yes/no)"
        
        if ($confirm.ToLower() -eq "yes") {
            Write-Host ""
            Write-Host "Step 1/2: Deploying Backend to Railway..." -ForegroundColor Yellow
            & .\deploy-railway.ps1
            
            Write-Host ""
            Write-Host "Step 2/2: Deploying Frontend to Vercel..." -ForegroundColor Yellow
            & .\deploy-vercel.ps1
            
            Write-Host ""
            Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
            Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
            Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
            Write-Host ""
            Write-Host "📋 FINAL STEPS:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "1️⃣  Update Railway CORS Variables:" -ForegroundColor Cyan
            Write-Host "   • Go to Railway Dashboard" -ForegroundColor White
            Write-Host "   • Select your backend project" -ForegroundColor White
            Write-Host "   • Update variables:" -ForegroundColor White
            Write-Host "     - CORS_ORIGIN = <your-vercel-url>" -ForegroundColor White
            Write-Host "     - FRONTEND_URL = <your-vercel-url>" -ForegroundColor White
            Write-Host "   • Redeploy backend" -ForegroundColor White
            Write-Host ""
            Write-Host "2️⃣  Set Frontend Environment Variables:" -ForegroundColor Cyan
            Write-Host "   • Go to Vercel Dashboard" -ForegroundColor White
            Write-Host "   • Select your frontend project" -ForegroundColor White
            Write-Host "   • Add environment variable:" -ForegroundColor White
            Write-Host "     - REACT_APP_API_URL = <your-railway-url>" -ForegroundColor White
            Write-Host "   • Redeploy frontend" -ForegroundColor White
            Write-Host ""
            Write-Host "3️⃣  Test Your Application:" -ForegroundColor Cyan
            Write-Host "   • Open your Vercel frontend URL in browser" -ForegroundColor White
            Write-Host "   • Test login with faculty credentials" -ForegroundColor White
            Write-Host "   • Test clearance submission" -ForegroundColor White
            Write-Host "   • Test clearance status" -ForegroundColor White
            Write-Host ""
            Write-Host "✨ Your system is now in production!" -ForegroundColor Green
            Write-Host ""
        }
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "🎉 Deployment Script Completed" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
