#!/usr/bin/env pwsh
# Faculty Clearance System - Deployment Verification Suite
# Validates complete deployment and system readiness

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Faculty Clearance System - Deployment Verification Suite    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$testsWarning = 0

function Write-Test {
    param(
        [string]$Name,
        [string]$Status,
        [string]$Message = ""
    )
    
    switch ($Status) {
        "PASS" {
            Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
            $script:testsPassed++
        }
        "FAIL" {
            Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
            $script:testsFailed++
        }
        "WARN" {
            Write-Host "⚠️  WARN" -ForegroundColor Yellow -NoNewline
            $script:testsWarning++
        }
    }
    
    Write-Host " : $Name"
    if ($Message) {
        Write-Host "       $Message" -ForegroundColor Gray
    }
}

# Test 1: Check Docker Installation
Write-Host "[Phase 1/5] Checking Docker Installation..." -ForegroundColor Yellow
Write-Host ""

try {
    $dockerVersion = docker --version 2>$null
    Write-Test "Docker Installed" "PASS" $dockerVersion
} catch {
    Write-Test "Docker Installed" "FAIL" "Docker not found. Install from https://www.docker.com/products/docker-desktop"
}

try {
    $composeVersion = docker compose version 2>$null
    Write-Test "Docker Compose Installed" "PASS" $composeVersion
} catch {
    Write-Test "Docker Compose Installed" "FAIL" "Docker Compose not found. Included with Docker Desktop"
}

# Test 2: Check Configuration Files
Write-Host ""
Write-Host "[Phase 2/5] Checking Configuration Files..." -ForegroundColor Yellow
Write-Host ""

$requiredFiles = @(
    "docker-compose.yml",
    "docker-compose.prod.yml",
    "backend/Dockerfile",
    "frontend/Dockerfile",
    "nginx-prod.conf",
    ".env.docker"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Test "File: $file" "PASS"
    } else {
        Write-Test "File: $file" "FAIL" "Missing file"
    }
}

# Test 3: Check Deployment Scripts
Write-Host ""
Write-Host "[Phase 3/5] Checking Deployment Scripts..." -ForegroundColor Yellow
Write-Host ""

$scripts = @(
    "docker-local-deploy.ps1",
    "docker-prod-deploy.ps1",
    "docker-build-and-push.ps1"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Test "Script: $script" "PASS"
    } else {
        Write-Test "Script: $script" "FAIL" "Missing script"
    }
}

# Test 4: Check Documentation
Write-Host ""
Write-Host "[Phase 4/5] Checking Documentation..." -ForegroundColor Yellow
Write-Host ""

$docs = @(
    "DOCKER_README.md",
    "DOCKER_QUICK_REFERENCE.md",
    "DOCKER_DEPLOYMENT_GUIDE.md",
    "DOCKER_IMPLEMENTATION_SUMMARY.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        $size = (Get-Item $doc).Length / 1KB
        Write-Test "Doc: $doc" "PASS" "($([Math]::Round($size))KB)"
    } else {
        Write-Test "Doc: $doc" "FAIL" "Missing documentation"
    }
}

# Test 5: Try Starting Services (if Docker running)
Write-Host ""
Write-Host "[Phase 5/5] Testing Docker Compose Configuration..." -ForegroundColor Yellow
Write-Host ""

try {
    $config = docker compose config 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Test "Docker Compose Config Valid" "PASS" "Configuration validated"
    } else {
        Write-Test "Docker Compose Config Valid" "FAIL" "Invalid docker-compose.yml"
    }
} catch {
    Write-Test "Docker Compose Config Valid" "WARN" "Could not validate (Docker may not be running)"
}

# Test Environment File
if (Test-Path ".env") {
    Write-Test "Production .env File" "PASS" "Found"
} elseif (Test-Path ".env.docker") {
    Write-Test "Production .env File" "WARN" ".env not found, using template at .env.docker"
} else {
    Write-Test "Production .env File" "FAIL" "Neither .env nor .env.docker found"
}

# Test Git Repository
Write-Host ""
Write-Host "[Additional] Checking Git Repository..." -ForegroundColor Yellow
Write-Host ""

try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Test "Git Repository" "PASS" "Tracked"
    } else {
        Write-Test "Git Repository" "FAIL" "Not a git repository"
    }
} catch {
    Write-Test "Git Repository" "FAIL" "Git not found"
}

try {
    $remoteUrl = git config --get remote.origin.url 2>$null
    if ($remoteUrl) {
        Write-Test "Git Remote" "PASS" $remoteUrl
    } else {
        Write-Test "Git Remote" "WARN" "No remote configured"
    }
} catch {
    Write-Test "Git Remote" "FAIL" "Could not read git config"
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Passed : $testsPassed" -ForegroundColor Green
Write-Host "⚠️  Warnings: $testsWarning" -ForegroundColor Yellow
Write-Host "❌ Failed : $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 All critical tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run deployment: .\docker-local-deploy.ps1" -ForegroundColor White
    Write-Host "  2. Access application: http://localhost:3000" -ForegroundColor White
    Write-Host "  3. Check logs: docker compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "For production:" -ForegroundColor Cyan
    Write-Host "  1. Create .env file with production values" -ForegroundColor White
    Write-Host "  2. Run: .\docker-prod-deploy.ps1" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please address issues above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
