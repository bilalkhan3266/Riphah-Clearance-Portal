#!/bin/bash
# Faculty Clearance System - Deployment Verification Suite (Mac/Linux)

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Faculty Clearance System - Deployment Verification Suite    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

testsPassed=0
testsFailed=0
testsWarning=0

write_test() {
    local name="$1"
    local status="$2"
    local message="$3"
    
    case $status in
        "PASS")
            echo -n "✅ PASS"
            ((testsPassed++))
            ;;
        "FAIL")
            echo -n "❌ FAIL"
            ((testsFailed++))
            ;;
        "WARN")
            echo -n "⚠️  WARN"
            ((testsWarning++))
            ;;
    esac
    
    echo " : $name"
    if [ -n "$message" ]; then
        echo "       $message"
    fi
}

# Test 1: Check Docker Installation
echo "[Phase 1/5] Checking Docker Installation..."
echo ""

if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    write_test "Docker Installed" "PASS" "$docker_version"
else
    write_test "Docker Installed" "FAIL" "Docker not found. Install from https://www.docker.com/products/docker-desktop"
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    compose_version=$(docker compose version 2>/dev/null || docker-compose --version)
    write_test "Docker Compose Installed" "PASS" "$compose_version"
else
    write_test "Docker Compose Installed" "FAIL" "Docker Compose not found. Included with Docker Desktop"
fi

# Test 2: Check Configuration Files
echo ""
echo "[Phase 2/5] Checking Configuration Files..."
echo ""

for file in "docker-compose.yml" "docker-compose.prod.yml" "backend/Dockerfile" "frontend/Dockerfile" "nginx-prod.conf" ".env.docker"; do
    if [ -f "$file" ]; then
        write_test "File: $file" "PASS"
    else
        write_test "File: $file" "FAIL" "Missing file"
    fi
done

# Test 3: Check Deployment Scripts
echo ""
echo "[Phase 3/5] Checking Deployment Scripts..."
echo ""

for script in "docker-local-deploy.sh" "docker-prod-deploy.sh" "docker-build-and-push.sh"; do
    if [ -f "$script" ]; then
        write_test "Script: $script" "PASS"
    else
        write_test "Script: $script" "FAIL" "Missing script"
    fi
done

# Test 4: Check Documentation
echo ""
echo "[Phase 4/5] Checking Documentation..."
echo ""

for doc in "DOCKER_README.md" "DOCKER_QUICK_REFERENCE.md" "DOCKER_DEPLOYMENT_GUIDE.md" "DOCKER_IMPLEMENTATION_SUMMARY.md"; do
    if [ -f "$doc" ]; then
        size=$(du -k "$doc" | cut -f1)
        write_test "Doc: $doc" "PASS" "(${size}KB)"
    else
        write_test "Doc: $doc" "FAIL" "Missing documentation"
    fi
done

# Test 5: Try Validating Services
echo ""
echo "[Phase 5/5] Testing Docker Compose Configuration..."
echo ""

if docker compose config > /dev/null 2>&1; then
    write_test "Docker Compose Config Valid" "PASS" "Configuration validated"
else
    write_test "Docker Compose Config Valid" "WARN" "Could not validate (Docker may not be running)"
fi

# Test Environment File
if [ -f ".env" ]; then
    write_test "Production .env File" "PASS" "Found"
elif [ -f ".env.docker" ]; then
    write_test "Production .env File" "WARN" ".env not found, using template at .env.docker"
else
    write_test "Production .env File" "FAIL" "Neither .env nor .env.docker found"
fi

# Test Git Repository
echo ""
echo "[Additional] Checking Git Repository..."
echo ""

if git status > /dev/null 2>&1; then
    write_test "Git Repository" "PASS" "Tracked"
else
    write_test "Git Repository" "FAIL" "Not a git repository"
fi

if [ -n "$(git config --get remote.origin.url 2>/dev/null)" ]; then
    remote_url=$(git config --get remote.origin.url)
    write_test "Git Remote" "PASS" "$remote_url"
else
    write_test "Git Remote" "WARN" "No remote configured"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Verification Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "✅ Passed : $testsPassed"
echo "⚠️  Warnings: $testsWarning"
echo "❌ Failed : $testsFailed"
echo ""

if [ $testsFailed -eq 0 ]; then
    echo "🎉 All critical tests passed!"
    echo ""
    echo "Next steps:"
    echo "  1. Run deployment: bash docker-local-deploy.sh"
    echo "  2. Access application: http://localhost:3000"
    echo "  3. Check logs: docker compose logs -f"
    echo ""
    echo "For production:"
    echo "  1. Create .env file with production values"
    echo "  2. Run: bash docker-prod-deploy.sh"
    echo ""
    exit 0
else
    echo "⚠️  Some tests failed. Please address issues above."
    echo ""
    exit 1
fi
