# API Testing Guide - Faculty Clearance System

## 📌 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication
All endpoints (except public verification) require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Clearance Endpoints

### 1️⃣ Submit Clearance Request (Automatic Check)
**Endpoint**: `POST /api/clearance/submit`

**Request**:
```json
{
  "facultyId": "EMP001"
}
```

**Expected Response (If Approved)**:
```json
{
  "success": true,
  "message": "Clearance approved and processed",
  "data": {
    "facultyId": "EMP001",
    "facultyName": "Dr. Ahmed Khan",
    "overallStatus": "Completed",
    "phases": [
      {
        "name": "Lab",
        "status": "Approved",
        "remarks": "No pending items",
        "approvedDate": "2026-03-19T10:30:00Z"
      },
      {
        "name": "Library",
        "status": "Approved",
        "remarks": "No pending items",
        "approvedDate": "2026-03-19T10:30:00Z"
      },
      // ... 10 more departments
    ],
    "completionDate": "2026-03-19T10:30:00Z",
    "qrCode": {
      "data": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    },
    "certificatePath": "/uploads/certificates/clearance_EMP001_1234567890.pdf"
  }
}
```

**Expected Response (If Rejected)**:
```json
{
  "success": true,
  "message": "Clearance request rejected",
  "data": {
    "facultyId": "EMP002",
    "overallStatus": "Rejected",
    "phases": [
      {
        "name": "Lab",
        "status": "Rejected",
        "remarks": "1 uncleared item(s)"
      },
      // ... other departments
    ]
  },
  "rejectedDepartments": [
    {
      "name": "Lab",
      "reason": "1 uncleared item(s): Advanced Equipment Model X"
    }
  ]
}
```

---

### 2️⃣ Get Clearance Status
**Endpoint**: `GET /api/clearance/:facultyId`

**Usage**:
```
GET /api/clearance/EMP001
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "605c6e4a9c1d2e3f4a5b6c7d",
    "facultyId": "EMP001",
    "facultyName": "Dr. Ahmed Khan",
    "department": "Computer Science",
    "overallStatus": "Completed",
    "phases": [...12 departments...],
    "completionDate": "2026-03-19T10:30:00Z",
    "createdAt": "2026-03-19T10:30:00Z"
  }
}
```

---

### 3️⃣ Re-evaluate Clearance (After Clearing Items)
**Endpoint**: `POST /api/clearance/:facultyId/re-evaluate`

**Usage**:
```
POST /api/clearance/EMP002/re-evaluate
```

**Response**: Same as Submit Clearance (checks all departments again)

---

### 4️⃣ Download Certificate
**Endpoint**: `GET /api/clearance/:facultyId/certificate`

**Usage**:
```
GET /api/clearance/EMP001/certificate
```

**Response**: Binary PDF file (downloads as Clearance_Certificate_EMP001.pdf)

---

### 5️⃣ Verify Clearance (Public - No Auth)
**Endpoint**: `GET /api/clearance/verify/:token`

**Usage**:
```
GET /api/clearance/verify/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response**:
```json
{
  "success": true,
  "message": "Clearance verified",
  "data": {
    "facultyId": "EMP001",
    "facultyName": "Dr. Ahmed Khan",
    "completionDate": "2026-03-19T10:30:00Z",
    "allPhasesApproved": true
  }
}
```

---

### 6️⃣ Get Admin Statistics
**Endpoint**: `GET /api/clearance/stats/dashboard`

**Usage**:
```
GET /api/clearance/stats/dashboard
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalClearances": 150,
    "completedCount": 120,
    "rejectedCount": 20,
    "inProgressCount": 10,
    "completionRate": "80.00",
    "departmentWiseRejections": [
      {
        "_id": "Lab",
        "count": 5
      },
      {
        "_id": "Finance",
        "count": 3
      }
    ]
  }
}
```

---

## 🏢 Department Issue Endpoints

### 1️⃣ Create Issue (Add Pending Item for Faculty)
**Endpoint**: `POST /api/departments/:departmentName/issue`

**Request**:
```json
{
  "facultyId": "EMP001",
  "facultyName": "Dr. Ahmed Khan",
  "facultyEmail": "ahmed@university.edu",
  "itemType": "equipment",
  "description": "Advanced spectroscopy equipment not returned",
  "quantity": 1,
  "dueDate": "2026-04-15",
  "notes": "Equipment must be returned in working condition"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Issue created successfully in Lab",
  "data": {
    "_id": "605c6e4a9c1d2e3f4a5b6c7d",
    "facultyId": "EMP001",
    "departmentName": "Lab",
    "itemType": "equipment",
    "description": "Advanced spectroscopy equipment not returned",
    "quantity": 1,
    "status": "Issued",
    "issueDate": "2026-03-19T10:30:00Z"
  }
}
```

---

### 2️⃣ Get All Issues in Department
**Endpoint**: `GET /api/departments/:departmentName/issues`

**Query Parameters**:
- `faculty Id`: Filter by faculty (optional)
- `status`: Filter by status - "Issued", "Pending", "Uncleared", "Cleared" (optional)

**Usage**:
```
GET /api/departments/Lab/issues
GET /api/departments/Lab/issues?facultyId=EMP001
GET /api/departments/Lab/issues?status=Uncleared
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "605c6e4a9c1d2e3f4a5b6c7d",
      "facultyId": "EMP001",
      "itemType": "equipment",
      "description": "...",
      "quantity": 1,
      "status": "Issued",
      "issueDate": "2026-03-19T10:30:00Z"
    }
  ]
}
```

---

### 3️⃣ Get Faculty Issues in Department
**Endpoint**: `GET /api/departments/:departmentName/faculty/:facultyId/issues`

**Usage**:
```
GET /api/departments/Lab/faculty/EMP001/issues
```

**Response**: Array of issues for that faculty in that department

---

### 4️⃣ Update Issue Status
**Endpoint**: `PUT /api/departments/:departmentName/issues/:issueId`

**Request**:
```json
{
  "status": "Pending",
  "notes": "Follow-up email sent to faculty"
}
```

**Response**: Updated issue object

---

### 5️⃣ Delete Issue
**Endpoint**: `DELETE /api/departments/:departmentName/issues/:issueId`

**Response**:
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

### 6️⃣ Get Issue Statistics
**Endpoint**: `GET /api/departments/:departmentName/issue-stats`

**Usage**:
```
GET /api/departments/Lab/issue-stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalIssues": 25,
    "pendingCount": 5,
    "clearedCount": 20,
    "statsByStatus": [
      {
        "_id": "Issued",
        "count": 15
      },
      {
        "_id": "Cleared",
        "count": 20
      }
    ]
  }
}
```

---

## ✅ Department Return Endpoints

### 1️⃣ Process Return (Faculty Returns Item)
**Endpoint**: `POST /api/departments/:departmentName/return`

**Request**:
```json
{
  "facultyId": "EMP001",
  "facultyName": "Dr. Ahmed Khan",
  "facultyEmail": "ahmed@university.edu",
  "referenceIssueId": "605c6e4a9c1d2e3f4a5b6c7d",
  "quantityReturned": 1,
  "condition": "Good",
  "notes": "Equipment returned in good working condition"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Return processed successfully in Lab",
  "data": {
    "_id": "605c6f5b9d1e2e3f4a5b6c8e",
    "facultyId": "EMP001",
    "referenceIssueId": "605c6e4a9c1d2e3f4a5b6c7d",
    "quantityReturned": 1,
    "status": "Cleared",
    "returnDate": "2026-03-19T11:30:00Z",
    "condition": "Good"
  }
}
```

---

### 2️⃣ Get All Returns in Department
**Endpoint**: `GET /api/departments/:departmentName/returns`

**Query Parameters**:
- `facultyId`: Filter by faculty (optional)
- `status`: Filter by status (optional)

**Usage**:
```
GET /api/departments/Lab/returns
GET /api/departments/Lab/returns?status=Cleared
```

**Response**: Array of return records

---

### 3️⃣ Verify Return
**Endpoint**: `PUT /api/departments/:departmentName/returns/:returnId/verify`

**Request**:
```json
{
  "verificationNotes": "Equipment checked and verified in good condition"
}
```

**Response**: Updated return with verification date

---

### 4️⃣ Get Faculty Returns in Department
**Endpoint**: `GET /api/departments/:departmentName/faculty/:facultyId/returns`

**Usage**:
```
GET /api/departments/Lab/faculty/EMP001/returns
```

**Response**: Array of returns by that faculty

---

### 5️⃣ Delete Return Record
**Endpoint**: `DELETE /api/departments/:departmentName/returns/:returnId`

**Response**:
```json
{
  "success": true,
  "message": "Return record deleted successfully"
}
```

---

### 6️⃣ Get Return Statistics
**Endpoint**: `GET /api/departments/:departmentName/return-stats`

**Usage**:
```
GET /api/departments/Lab/return-stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalReturns": 20,
    "clearedCount": 18,
    "pendingCount": 2,
    "statsByStatus": [...]
  }
}
```

---

### 7️⃣ Check Faculty Clearance Status in Department
**Endpoint**: `GET /api/departments/:departmentName/faculty/:facultyId/clearance-status`

**Usage**:
```
GET /api/departments/Lab/faculty/EMP001/clearance-status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "facultyId": "EMP001",
    "departmentName": "Lab",
    "isCleared": false,
    "pendingIssuesCount": 2,
    "clearedItemsCount": 5,
    "pendingIssues": [
      {
        "_id": "...",
        "description": "Equipment not returned",
        "status": "Uncleared"
      }
    ]
  }
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Clearance (All Departments Approved)

```bash
# Step 1: Create some issues in different departments
POST /api/departments/Lab/issue
{
  "facultyId": "TEST001",
  "itemType": "equipment",
  "description": "Test equipment"
}

# Step 2: Immediately process return (clear the issue)
POST /api/departments/Lab/return
{
  "facultyId": "TEST001",
  "referenceIssueId": "THE_ISSUE_ID_FROM_STEP_1",
  "quantityReturned": 1,
  "condition": "Good"
}

# Step 3: Submit clearance - should be APPROVED
POST /api/clearance/submit
{
  "facultyId": "TEST001"
}

# Result: Approved ✅ with QR code + Certificate
```

### Scenario 2: Clearance Rejected (Pending Items)

```bash
# Step 1: Create issue but DON'T process return
POST /api/departments/Finance/issue
{
  "facultyId": "TEST002",
  "itemType": "fee",
  "description": "Outstanding fees pending"
}

# Step 2: Submit clearance - should be REJECTED
POST /api/clearance/submit
{
  "facultyId": "TEST002"
}

# Result: Rejected ❌ with list of pending departments

# Step 3: Clear the item
POST /api/departments/Finance/return
{
  "facultyId": "TEST002",
  "referenceIssueId": "THE_ISSUE_ID",
  "quantityReturned": 1
}

# Step 4: Re-evaluate clearance - should NOW be APPROVED
POST /api/clearance/TEST002/re-evaluate

# Result: Approved ✅ after clearing
```

---

## 🔍 Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created successfully | Issue, Return, or Clearance created |
| 200 | OK | Data fetched successfully |
| 400 | Bad request | Missing required fields |
| 403 | Forbidden | Faculty trying to view other's data |
| 404 | Not found | Clearance record doesn't exist |
| 500 | Server error | Database or email service error |

---

## 🛠️ Using with Postman

1. **Create Environment Variable**:
   - Variable: `token`
   - Value: Your JWT token from login

2. **Use in Headers**:
   ```
   Authorization: Bearer {{token}}
   ```

3. **Create Collections**:
   - Clearance Endpoints
   - Department Issues
   - Department Returns
   - Testing Scenarios

4. **Run Tests**:
   - Save commonly used requests
   - Chain requests using tests

---

## 📊 Performance Notes

- Clearance check: Takes 50-100ms (checks all 12 depts)
- PDF generation: Takes 200-500ms (one-time)
- Email sending: 1-2 seconds (async in production)
- QR code: < 10ms (very fast)

---

## ⚠️ Common Errors

**Error**: Faculty not found
```json
{
  "success": false,
  "message": "Faculty not found"
}
```
**Fix**: Ensure faculty exists in User collection with matching employeeId

---

**Error**: Email not configured
```json
{
  "success": false,
  "message": "Email service not configured"
}
```
**Fix**: Set EMAIL_USER and EMAIL_PASSWORD in .env

---

**Error**: Issue not found
```json
{
  "success": false,
  "message": "Referenced issue not found"
}
```
**Fix**: Use correct issue ID from previous response

---

**Created**: March 19, 2026
**Last Updated**: March 19, 2026
