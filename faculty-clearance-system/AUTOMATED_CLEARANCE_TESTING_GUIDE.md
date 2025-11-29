# 🧪 Automated Clearance System - Complete Testing Guide

## Pre-Requisites

1. **Backend running**: `npm run dev` (Node.js server at port 5001)
2. **Frontend running**: `npm start` (React app at port 3000)
3. **MongoDB**: Connected and running
4. **Test user**: Faculty account with proper JWT token

---

## End-to-End Workflow

### SCENARIO 1: Instant Approval (Faculty with no issues)

#### Setup

1. Create test faculty in MongoDB:
```javascript
db.users.insertOne({
  _id: ObjectId(),
  employeeId: "FAC001",
  email: "faculty1@university.edu",
  full_name: "Dr. Ahmed Khan",
  role: "faculty",
  department: "Faculty of Science"
})
```

2. Verify NO issues exist:
```javascript
db.issues.find({ facultyId: "FAC001" }) // Should return empty
```

#### Test Execution

1. **Login** with faculty account (FAC001)
2. **Navigate** to "Submit Clearance"
3. **Fill** the form:
   - Designation: Assistant Professor
   - Office Location: Science Block, Room 201
   - Contact Number: 03001234567
   - Degree Status: Completed
4. **Click** "Submit Clearance"

#### Expected Result

**Status Page Should Show**:
```
✅ CLEARANCE APPROVED
Phase Progress: 4/4
All phases passed

Phase 1: ✅ APPROVED
  Lab: ✅ APPROVED (All items cleared)
  Library: ✅ APPROVED (All items cleared)
  Pharmacy: ✅ APPROVED (All items cleared)

Phase 2: ✅ APPROVED
  Finance: ✅ APPROVED
  HR: ✅ APPROVED
  Records: ✅ APPROVED

Phase 3: ✅ APPROVED
  IT: ✅ APPROVED
  ORIC: ✅ APPROVED
  Administration: ✅ APPROVED

Phase 4: ✅ APPROVED
  Warden: ✅ APPROVED
  HOD: ✅ APPROVED
  Dean: ✅ APPROVED

📦 Items to Return: None
🎯 Ready for Certificate: YES
```

**Time**: < 1 second (instant decision)

---

### SCENARIO 2: Phase 1 Block (Lab has pending items)

#### Setup

1. Create test faculty:
```javascript
db.users.insertOne({
  _id: ObjectId(),
  employeeId: "FAC002",
  email: "faculty2@university.edu",
  full_name: "Dr. Fatima Ali",
  role: "faculty"
})
```

2. Create ISSUED item (NOT returned):
```javascript
db.issues.insertOne({
  _id: ObjectId(),
  facultyId: "FAC002",
  departmentName: "Lab",
  itemType: "equipment",
  description: "Oscilloscope Model XYZ-400",
  quantity: 1,
  issueDate: new Date("2024-01-15"),
  dueDate: new Date("2024-03-15"),
  status: "Issued",
  issueReferenceNumber: "LAB-001-2024",
  issuedBy: "Dr. Smith"
})
```

3. Verify NO returns exist:
```javascript
db.returns.find({ 
  facultyId: "FAC002",
  referenceIssueId: ObjectId("...") 
}) // Should return empty
```

#### Test Execution

1. **Login** as FAC002
2. **Navigate** to "Submit Clearance"
3. **Fill** and **Submit**

#### Expected Result

**Status Page Should Show**:
```
⏳ CLEARANCE IN PROGRESS
Phase Progress: 0/4
BLOCKED at Phase 1

Phase 1: ❌ BLOCKED
  Lab: ❌ REJECTED (1 uncleared item)
  Library: ⏳ NOT EVALUATED (Phase blocked)
  Pharmacy: ⏳ NOT EVALUATED (Phase blocked)

Phase 2: ⏳ NOT EVALUATED (waiting for Phase 1)
Phase 3: ⏳ NOT EVALUATED (waiting for Phase 1)
Phase 4: ⏳ NOT EVALUATED (waiting for Phase 1)

📦 Items to Return: 1

Lab [1]:
  ├─ Oscilloscope Model XYZ-400
  ├─ Type: equipment
  ├─ Quantity: 1
  ├─ Issued: Jan 15, 2024
  └─ Due: Mar 15, 2024

⚠️ Return 1 item to clear Lab and proceed to Phase 2
```

**Time**: < 1 second

---

### SCENARIO 3: Mark Item Returned & Watch Auto-Update

#### From Scenario 2, faculty sees they must return oscilloscope

1. **Admin/Department** marks item as returned:
```javascript
db.returns.insertOne({
  facultyId: "FAC002",
  departmentName: "Lab",
  referenceIssueId: ObjectId("..."), // from Issue document
  issueReferenceNumber: "LAB-001-2024",
  itemType: "equipment",
  quantityReturned: 1,
  returnDate: new Date(),
  status: "Returned",
  condition: "Good",
  receivedBy: "Dr. Smith",
  verificationDate: new Date(),
  verifiedBy: "Lab Manager"
})

// Also update original Issue to mark as cleared
db.issues.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "Cleared", updatedAt: new Date() } }
)
```

2. **Faculty** keeps viewing clearance status page
3. **No manual refresh needed** - auto-refresh triggers every 5 seconds

#### Expected Result

**After 5 seconds, Status Automatically Updates To**:
```
✅ CLEARANCE APPROVED
Phase Progress: 4/4

Phase 1: ✅ APPROVED
  Lab: ✅ APPROVED (All items cleared) ← CHANGED!
  Library: ✅ APPROVED
  Pharmacy: ✅ APPROVED

Phase 2: ✅ APPROVED
[... all phases approved ...]

📦 Items to Return: None
🎯 Ready for Certificate: YES
```

**No Page Refresh Required** ✨

---

### SCENARIO 4: Multiple Phases Blocking

#### Setup

1. Create faculty with issues in multiple departments:

```javascript
// Phase 1: Lab has issue
db.issues.insertOne({
  facultyId: "FAC003",
  departmentName: "Lab",
  description: "Centrifuge Machine",
  status: "Issued"
})

// Phase 2: Finance has issue
db.issues.insertOne({
  facultyId: "FAC003",
  departmentName: "Finance",
  description: "Outstanding Library Fees",
  status: "Pending"
})

// Phase 3: IT has issue
db.issues.insertOne({
  facultyId: "FAC003",
  departmentName: "IT",
  description: "University Laptop",
  status: "Issued"
})
```

#### Test Execution

Faculty submits clearance

#### Expected Result

```
⏳ CLEARANCE IN PROGRESS
BLOCKED at Phase 1 (earliest phase with issue)

Phase 1: ❌ BLOCKED
  Lab: ❌ REJECTED (1 item: Centrifuge Machine)
  Library: ⏳ NOT EVALUATED
  Pharmacy: ⏳ NOT EVALUATED

Phase 2: ⏳ NOT EVALUATED (blocked at Phase 1)
Phase 3: ⏳ NOT EVALUATED (blocked at Phase 1)
Phase 4: ⏳ NOT EVALUATED (blocked at Phase 1)

Message: "Complete Phase 1 before proceeding to Phase 2"
```

**Critical**: System blocks at FIRST failing phase. Must fix Phase 1 before Phase 2 can be evaluated.

---

### SCENARIO 5: Progressive Phase Completion

#### Starting from Scenario 4

**Step 1**: Return Phase 1 items
- Mark Centrifuge as returned
- Wait for auto-refresh

**Status Updates To**:
```
⏳ CLEARANCE IN PROGRESS
BLOCKED at Phase 2

Phase 1: ✅ APPROVED (all cleared)
Phase 2: ❌ BLOCKED
  Finance: ❌ REJECTED (Outstanding fees)
  HR: ⏳ NOT EVALUATED
  Records: ⏳ NOT EVALUATED

Phase 3: ⏳ NOT EVALUATED (blocked at Phase 2)
Phase 4: ⏳ NOT EVALUATED (blocked at Phase 2)
```

**Step 2**: Return Phase 2 items
- Mark fees as paid
- Auto-refresh

**Status Updates To**:
```
⏳ CLEARANCE IN PROGRESS
BLOCKED at Phase 3

Phase 1: ✅ APPROVED
Phase 2: ✅ APPROVED
Phase 3: ❌ BLOCKED
  IT: ❌ REJECTED (Laptop not returned)
  ORIC: ⏳ NOT EVALUATED
  Admin: ⏳ NOT EVALUATED

Phase 4: ⏳ NOT EVALUATED (blocked at Phase 3)
```

**Step 3**: Return Phase 3 items
- Mark laptop as returned
- Auto-refresh

**Status Updates To**:
```
⏳ CLEARANCE IN PROGRESS
Phase 3: ✅ APPROVED
Phase 4: ✅ APPROVED

✅ CLEARANCE APPROVED
Phase Progress: 4/4

All departments cleared!
```

---

## API Testing via Postman/cURL

### Test 1: Submit Clearance

```bash
curl -X POST http://localhost:5001/api/clearance-requests \
  -H "Authorization:Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Assistant Professor",
    "office_location": "Building A",
    "contact_number": "03001234567",
    "degree_status": "Completed",
    "department": "Science"
  }'
```

**Check Response**: Should show phases with `APPROVED` or `REJECTED` status (NOT pending)

### Test 2: Get Clearance Summary

```bash
curl -X GET http://localhost:5001/api/issues/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check Response**: `phaseProgress`, `currentPhase`, `totalItemsToReturn`

### Test 3: Get Items to Return

```bash
curl -X GET http://localhost:5001/api/issues/clearance-requirements \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check Response**: Lists all items blocking clearance by department

### Test 4: Get Department-Specific Status

```bash
curl -X GET http://localhost:5001/api/issues/pending/Lab \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check Response**: Shows whether Lab is cleared or what items pending

---

## Frontend Testing Checklist

- [ ] **Scenario 1**: Faculty with no issues instantly approved
- [ ] **Scenario 2**: Faculty with Phase 1 issue blocked at Phase 1
- [ ] **Scenario 3**: Auto-refresh updates status without page refresh
- [ ] **Scenario 4**: Multiple phases show only first blocking phase
- [ ] **Scenario 5**: Progressive phase completion works correctly
- [ ] Status page shows all 4 phases
- [ ] Items to return listed correctly
- [ ] Phase progress bar updates correctly
- [ ] Current phase indicator accurate
- [ ] Refresh button works
- [ ] Auto-refresh toggle works

---

## Backend Testing Checklist

- [ ] Auto-clearance service queries correct database
- [ ] Phase order enforced (can't skip phases)
- [ ] Department enum values match exactly
- [ ] Uncleared statuses correctly trigger rejection
- [ ] Item count calculations accurate
- [ ] Faculty ID isolation working (no data mixing)
- [ ] Timestamps recorded correctly
- [ ] JWT token extraction works
- [ ] Error handling graceful (no 500 errors)

---

## Debugging Commands

### Check faculty clearance instantly

```javascript
// In server terminal
const autoClearance = require('./services/autoClearanceService');
autoClearance.checkFacultyClearance('FAC_ID_HERE').then(result => {
  console.log('CLEARANCE RESULT:', JSON.stringify(result, null, 2));
});
```

### List all issues for faculty

```javascript
db.issues.find({ facultyId: 'FAC_ID_HERE' })
```

### List all returns for faculty

```javascript
db.returns.find({ facultyId: 'FAC_ID_HERE' })
```

### Check clearance record status

```javascript
db.clearances.findOne({ facultyId: 'FAC_ID_HERE' })
```

---

## Common Issues & Fixes

### Issue: Status shows "PENDING"

**Should not happen** - system always decides immediately.

**Debug**:
```javascript
db.clearances.findOne({ facultyId: 'YOUR_ID' })
```

**Fix**: Check auto-clearance service logs for errors

###  Issue: Faculty blocked but expects approval

**Check**: Are there actually issued items?

```javascript
db.issues.find({ 
  facultyId: 'YOUR_ID',
  status: { $in: ['Issued', 'Pending', 'Uncleared'] }
})
```

**If empty**: Clearance.js may need flushing - system should auto-update

### Issue: Auto-refresh not working

**Check**: Browser console for errors

**Fix Options**:
1. Disable auto-refresh temporarily
2. Manual "Refresh" button click
3. Server may be down - check `/api/health` endpoint

---

## Performance Expectations

| Operation | Expected Time | Notes |
|-----------|---|---|
| Submit clearance | < 100ms | All 4 phases evaluated instantly |
| Auto-refresh | < 500ms | Periodic status check |
| Manual refresh | < 500ms | Single endpoint query |
| Phase progression | Instant | No waiting for approvals |
| Status page load | < 1s | Fetches phase summary |

---

## Success Criteria

✅ **System is working correctly if**:

1. Faculty submits → Status shows immediately (no loading)
2. No "Pending" states ever shown (system always decides)
3. Can't proceed to Phase 2 without Phase 1 approval
4. Returning one item updates status within 5 seconds
5. All department enums match exactly
6. Phase progress bar accurate
7. Certificate generated only when ALL phases approved

---

## Support

- **Server logs**: Check `npm run dev` output for errors
- **Browser console**: `F12` → Console tab for frontend errors
- **MongoDB logs**: Check database connection errors
- **API Testing**: Use `/api/health` to verify server running
