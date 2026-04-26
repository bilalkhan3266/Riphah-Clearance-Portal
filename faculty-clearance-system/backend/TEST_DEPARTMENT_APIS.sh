#!/bin/bash
# Quick test script to verify all department APIs are working

echo "🧪 DEPARTMENT APIs TEST SCRIPT"
echo "======================================"
echo ""
echo "Before running this, make sure:"
echo "1. Backend is running: npm run dev"
echo "2. Get a token from login"
echo ""
echo "Step 1: Get Login Token"
echo "────────────────────────"
echo ""
echo "curl -X POST http://localhost:5001/api/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"lab@test.edu\",\"password\":\"Test@123\"}'"
echo ""
echo "Copy the 'token' value from the response"
echo ""
echo "Step 2: Test Each Department API"
echo "──────────────────────────────────"
echo ""
echo "Replace TOKEN below with the actual token from Step 1"
echo ""

DEPARTMENTS=("Lab" "Library" "Pharmacy" "Finance" "HR" "Records" "IT" "ORIC" "Admin" "Warden" "HOD" "Dean")
TOKEN="YOUR_TOKEN_HERE"

echo "Commands to test each department:"
echo ""

for dept in "${DEPARTMENTS[@]}"; do
  echo "# Test $dept Department"
  echo "curl -X GET http://localhost:5001/api/departments/$dept/issues \\"
  echo "  -H 'Authorization: Bearer $TOKEN' \\"
  echo "  -H 'Content-Type: application/json'"
  echo ""
done

echo "Step 3: Expected Response Format"
echo "────────────────────────────────"
echo ""
echo "{"
echo '  "success": true,'
echo '  "count": 86,'  # For ORIC
echo '  "data": ['
echo "    {"
echo '      "_id": "...'
echo '      "facultyId": "3331",'
echo '      "departmentName": "ORIC",'
echo '      "itemType": "Research Data",'
echo '      "description": "...",'
echo '      "quantity": 10,'
echo '      "status": "Issued",'
echo '      "issueDate": "2026-04-23T...",'
echo '      "dueDate": "2026-05-23T..."'
echo "    },"
echo "    ..."
echo "  ]"
echo "}"
echo ""
echo "Step 4: If You See '1 pending' Instead"
echo "──────────────────────────────────────"
echo ""
echo "The frontend might be:"
echo "1. Showing only YOUR department's issues"
echo "2. Filtering by a specific status"
echo "3. Showing only pending returns"
echo ""
echo "Check the browser console (F12) for:"
echo "- Network requests to /api/departments/..."
echo "- Response data"
echo "- Any error messages"
