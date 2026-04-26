# 🌐 API ENDPOINTS FOR VIEWING ISSUES

## Available Endpoints

### 1. Get All Pending Issues for Faculty
```bash
curl -X GET http://localhost:5001/api/department-issues/my-pending-issues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Phase Status
```bash
curl -X GET http://localhost:5001/api/department-issues/phase-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Clearance Requirements
```bash
curl -X GET http://localhost:5001/api/department-issues/clearance-requirements \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Issues by Department
```bash
curl -X GET "http://localhost:5001/api/department-issues/pending/Lab" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## How to Get a Token
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty1@test.edu","password":"Test@123"}'
```

## Response Example
The response will contain all issues grouped by department.

