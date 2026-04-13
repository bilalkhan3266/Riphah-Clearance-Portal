# 🧪 QUICK TEST GUIDE - See Your Automatic System In Action

## Current Status
✅ **Backend Server Running on Port 5001**  
✅ **MongoDB Connected**  
✅ **All APIs Ready**

---

## Test Scenario: Watch the System Automatically Approve/Reject Clearance

### Setup: 3 Simple Steps

#### Step 1: Get a Valid Faculty ID
You need a faculty member in the system. Use one of these:
```
EMP001
EMP002
EMP003
```

Or create one via signup (if you have auth set up).

#### Step 2: Get a Valid JWT Token
You need to authenticate first:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty@example.com",
    "password": "password123"
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "employeeId": "EMP001",
    "email": "faculty@example.com"
  }
}

# Save this token - you'll use it for all requests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Step 3: Use This Token in All API Calls
Add header to every request:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Test 1: Faculty With NO Pending Items → AUTOMATIC APPROVAL ✅

### Scenario
Faculty has cleared all items in all departments. System should approve automatically.

### Step 1: Check If Faculty Has Any Pending Issues
```bash
# Check Library department
curl -X GET "http://localhost:5001/api/departments/Library/faculty/EMP001/issues" \
  -H "Authorization: Bearer YOUR_TOKEN"

# If response is empty array [] → Faculty has no pending items
# Great! This faculty should be approved
```

### Step 2: Faculty Submits Clearance Request

```bash
curl -X POST http://localhost:5001/api/clearance/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "EMP001"
  }'
```

### Step 3: Watch the AUTOMATIC System Response

**Expected Response** (Within 100ms):
```json
{
  "success": true,
  "message": "Clearance approved and processed",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "facultyId": "EMP001",
    "facultyName": "Ahmed Khan",
    "facultyEmail": "ahmed@uni.edu",
    "overallStatus": "Completed",
    "phases": [
      {
        "name": "Lab",
        "status": "Approved",
        "remarks": "No pending items",
        "approvedDate": "2026-03-20T10:30:00Z"
      },
      {
        "name": "Library",
        "status": "Approved",
        "remarks": "No pending items"
      },
      ... (10 more departments, all "Approved")
    ],
    "rejectedDepartments": [],
    "qrCode": {
      "data": "data:image/png;base64,iVBORw0KGgoAAAA...",
      "publicId": "qr-550e8400-e29b-41d4-a716-446655440000"
    },
    "certificatePath": "/path/to/certificate.pdf",
    "completionDate": "2026-03-20T10:30:00Z"
  }
}
```

### What the System Did AUTOMATICALLY:
✅ Checked all 12 departments (Lab, Library, Pharmacy, Finance, HR, Record, Admin, IT, ORIC, Warden, HOD, Dean)  
✅ Queried Issue collection for each department  
✅ Found NO uncleared items  
✅ Approved all 12 departments  
✅ Overall status: "Completed"  
✅ Generated QR code (Base64)  
✅ Generated PDF certificate  
✅ Sent approval email to faculty  
✅ **Time: < 100ms** ⏱️

---

## Test 2: Faculty With Pending Items → AUTOMATIC REJECTION ❌

### Scenario
You create a pending issue in Library, then faculty submits clearance. System should automatically reject.

### Step 1: Create a Pending Issue (Department Staff Action)

```bash
curl -X POST http://localhost:5001/api/departments/Library/issue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "EMP001",
    "itemType": "book",
    "description": "Advanced Physics Textbook",
    "quantity": 1,
    "dueDate": "2026-04-15"
  }'

# Response:
{
  "success": true,
  "message": "Issue created",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "facultyId": "EMP001",
    "departmentName": "Library",
    "itemType": "book",
    "description": "Advanced Physics Textbook",
    "status": "Issued",
    "issueDate": "2026-03-20"
  }
}

# Note the _id - you'll need it for clearing later
ISSUE_ID="507f1f77bcf86cd799439012"
```

### Step 2: Faculty Submits Clearance Request

```bash
curl -X POST http://localhost:5001/api/clearance/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "EMP001"
  }'
```

### Step 3: Watch the AUTOMATIC System Response

**Expected Response** (Within 100ms):
```json
{
  "success": true,
  "message": "Clearance request rejected",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "facultyId": "EMP001",
    "facultyName": "Ahmed Khan",
    "facultyEmail": "ahmed@uni.edu",
    "overallStatus": "Rejected",
    "phases": [
      {
        "name": "Lab",
        "status": "Approved",
        "remarks": "No pending items"
      },
      {
        "name": "Library",
        "status": "Rejected",
        "remarks": "1 uncleared item(s)"
      },
      ... (10 more departments)
    ],
    "rejectedDepartments": [
      {
        "name": "Library",
        "reason": "1 pending item(s): Advanced Physics Textbook"
      }
    ]
  },
  "email": "Rejection email sent to ahmed@uni.edu"
}
```

### What the System Did AUTOMATICALLY:
✅ Checked all 12 departments  
✅ Found 1 uncleared item in Library  
✅ Marked Library as "Rejected"  
✅ Overall status: "Rejected"  
✅ Did NOT generate certificate  
✅ Did NOT generate QR code  
✅ Sent rejection email with specific reason  
✅ **Time: < 100ms** ⏱️

---

## Test 3: Faculty Re-evaluates After Clearing Items ✅

### Scenario
Faculty returns the book to Library. Library staff marks it cleared. Faculty re-evaluates and gets automatic approval.

### Step 1: Department Staff Processes the Return

```bash
curl -X POST http://localhost:5001/api/departments/Library/return \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "EMP001",
    "referenceIssueId": "507f1f77bcf86cd799439012",
    "quantityReturned": 1
  }'

# Response:
{
  "success": true,
  "message": "Return processed",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "Cleared"
  }
}

# The system automatically updated Issue status to "Cleared"
```

### Step 2: Faculty Submits Re-evaluation

```bash
curl -X POST http://localhost:5001/api/clearance/EMP001/re-evaluate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Watch the System Re-check Automatically

**Expected Response** (Within 100ms):
```json
{
  "success": true,
  "message": "Clearance re-evaluated and approved",
  "data": {
    "overallStatus": "Completed",
    "phases": [
      {
        "name": "Lab",
        "status": "Approved"
      },
      {
        "name": "Library",
        "status": "Approved"
      },
      ... (all departments approved now)
    ],
    "certificatePath": "/path/to/certificate.pdf",
    "qrCode": {...}
  }
}
```

### What Happened:
✅ Previous rejection deleted  
✅ System re-checked Library  
✅ Found issue is now "Cleared"  
✅ All 12 departments now approved  
✅ New certificate generated  
✅ New approval email sent  
✅ **Fully automatic** ✅

---

## Test 4: Check Clearance Status

### Get Faculty's Latest Clearance Record

```bash
curl -X GET http://localhost:5001/api/clearance/EMP001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "overallStatus": "Completed",
    "phases": [...],
    "certificatePath": "/path/to/certificate.pdf",
    ...
  }
}
```

---

## Test 5: Download Certificate

### Get the PDF File

```bash
curl -X GET http://localhost:5001/api/clearance/EMP001/certificate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output certificate.pdf

# File downloaded to current directory
# Open with any PDF viewer
```

---

## Test 6: Verify Certificate via QR Code (Public - No Login Needed)

### Scan the QR Code or Use Verification Link

```bash
# Get the clearance record first to find the verificationToken
curl -X GET http://localhost:5001/api/clearance/EMP001 \
  -H "Authorization: Bearer YOUR_TOKEN" | grep verificationToken

# Then use the public endpoint (no token needed)
curl -X GET "http://localhost:5001/api/clearance/verify/550e8400-e29b-41d4-a716-446655440000"

# Response:
{
  "success": true,
  "message": "Clearance verified",
  "data": {
    "facultyId": "EMP001",
    "facultyName": "Ahmed Khan",
    "overallStatus": "Completed",
    "completionDate": "2026-03-20"
  }
}
```

---

## Complete Testing Workflow (Copy & Paste)

### Setup Variables
```bash
TOKEN="your_jwt_token_here"
FACULTY_ID="EMP001"
DEPT="Library"
```

### Run All Tests in Sequence

```bash
# Test 1: Create an issue
echo "Creating issue..."
ISSUE=$(curl -s -X POST http://localhost:5001/api/departments/$DEPT/issue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"facultyId\":\"$FACULTY_ID\",\"itemType\":\"book\",\"description\":\"Test Book\",\"quantity\":1}")

echo "Issue created:"
echo $ISSUE

# Extract issue ID
ISSUE_ID=$(echo $ISSUE | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Issue ID: $ISSUE_ID"

# Test 2: Submit clearance (should be rejected due to issue)
echo -e "\nSubmitting clearance (should be rejected)..."
curl -s -X POST http://localhost:5001/api/clearance/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"facultyId\":\"$FACULTY_ID\"}" | jq '.data.overallStatus'

# Test 3: Process return (clear the item)
echo -e "\nProcessing return..."
curl -s -X POST http://localhost:5001/api/departments/$DEPT/return \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"facultyId\":\"$FACULTY_ID\",\"referenceIssueId\":\"$ISSUE_ID\",\"quantityReturned\":1}" | jq '.data.status'

# Test 4: Re-evaluate (should be approved now)
echo -e "\nRe-evaluating clearance (should be approved)..."
curl -s -X POST http://localhost:5001/api/clearance/$FACULTY_ID/re-evaluate \
  -H "Authorization: Bearer $TOKEN" | jq '.data.overallStatus'

# Test 5: Download certificate
echo -e "\nDownloading certificate..."
curl -s -X GET http://localhost:5001/api/clearance/$FACULTY_ID/certificate \
  -H "Authorization: Bearer $TOKEN" --output certificate.pdf
echo "Certificate saved to certificate.pdf"
```

---

## Expected Results Summary

| Test | Scenario | System Response | Time |
|------|----------|-----------------|------|
| Test 1 | No pending items | APPROVED ✅ | < 100ms |
| Test 2 | Create issue | N/A (creation) | 10-50ms |
| Test 3 | Has pending | REJECTED ❌ | < 100ms |
| Test 4 | Clear item | N/A (clearing) | 10-50ms |
| Test 5 | Re-evaluate | APPROVED ✅ | < 100ms |
| Test 6 | Download cert | PDF file | 50-200ms |
| Test 7 | Verify QR | Valid ✅ | < 50ms |

---

## Debugging Tips

### Issue Not Found
```
Error: Cannot find module 'Issue'
Solution: npm install in backend directory
```

### Token Invalid
```
Error: Invalid token
Solution: Get a fresh token from login endpoint
```

### Email Not Sending
```
Error: Email service error
Solution: Check EMAIL_USER and EMAIL_PASSWORD in .env file
```

### Cannot Connect to MongoDB
```
Error: Connection refused
Solution: Ensure MongoDB is running (mongod)
```

### Port Already In Use
```
Error: EADDRINUSE
Solution: The server is already running, or kill process on port 5001
```

---

## Monitor Logs

Watch the server output:
```
✅ Server running on port 5001
✅ MongoDB connected
📧 Email configured
Processing clearance for EMP001...
Checking Lab... Approved
Checking Library... Rejected (1 uncleared items)
...
Overall status: Rejected
Sending rejection email...
✅ Email sent
```

---

## Success Indicators

Your system is working automatically when you see:
✅ Clearance response in < 100ms  
✅ All 12 departments evaluated  
✅ QR code generated (on approval)  
✅ Email sent automatically  
✅ Status updated instantly  
✅ No manual approval forms  
✅ No waiting required  

---

## Next: Frontend Testing

Once you've confirmed the API works, start the frontend:
```bash
cd frontend
npm start
```

Then:
1. Login as faculty
2. Go to Faculty Clearance Dashboard
3. Click "Submit Clearance"
4. Watch it auto-approve/reject
5. See department status cards
6. Download certificate (if approved)

---

**Everything Is Automatic - The System Decides, Not Humans** ✅

