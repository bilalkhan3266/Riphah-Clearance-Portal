# Issue & Return System - Implementation Guide

## Overview
This document describes the complete implementation of the Issue & Return system for faculty clearance. The system allows department staff to issue items to faculty and accept returns, with automatic clearance verification.

---

## MongoDB Schemas

### 1. Issue Schema
**File**: `/backend/models/Issue.js`

```javascript
{
  facultyId: String,          // Faculty employee ID (indexed)
  facultyName: String,
  facultyEmail: String,
  departmentName: String,     // One of 12 departments (indexed)
  itemType: String,           // enum: book, equipment, fee, document, etc.
  description: String,        // What was issued
  quantity: Number,           // Default: 1
  issueDate: Date,           // Default: now (indexed)
  dueDate: Date,             // When to return
  status: String,            // enum: Issued, Pending, Uncleared, Partially Returned, Cleared
  issueReferenceNumber: String,  // Unique reference
  issuedBy: String,          // Staff ID who issued it
  notes: String,
  attachments: Array,
  timestamps: true           // createdAt, updatedAt
}
```

**Indexes**:
- `facultyId` (ascending)
- `departmentName` (ascending)
- `facultyId + departmentName`
- `facultyId + status`
- `departmentName + status`
- `issueDate` (descending)

### 2. Return Schema
**File**: `/backend/models/Return.js`

```javascript
{
  facultyId: String,              // Faculty employee ID (indexed)
  facultyName: String,
  facultyEmail: String,
  departmentName: String,         // One of 12 departments (indexed)
  referenceIssueId: ObjectId,     // Links to Issue (indexed)
  issueReferenceNumber: String,
  itemType: String,              // From original issue
  quantityReturned: Number,      // How much was actually returned
  returnDate: Date,              // Default: now
  status: String,                // enum: Returned, Cleared, Partial Return
  receivedBy: String,            // Staff ID who received it
  condition: String,             // enum: Good, Damaged, Normal, Excellent
  notes: String,
  attachments: Array,
  verificationDate: Date,
  verifiedBy: String,
  timestamps: true               // createdAt, updatedAt
}
```

**Indexes**:
- `facultyId` (ascending)
- `departmentName` (ascending)
- `referenceIssueId` (ascending)
- `facultyId + departmentName`
- `facultyId + status`
- `status` (ascending)
- `returnDate` (descending)

---

## API Endpoints

### Department Staff Operations

#### 1. **Issue an Item to Faculty**
```
POST /api/departments/:departmentName/issue-item
Headers: Authorization: Bearer {token}

Request Body:
{
  facultyId: "E12345",              // Required: Faculty employee ID
  itemType: "Equipment",             // Required: Type of item
  description: "Laptop",             // Required: Description
  quantity: 1,                       // Optional: Default 1
  dueDate: "2024-04-30"             // Optional: When to return
}

Response (201):
{
  success: true,
  message: "Item issued successfully to ...",
  data: {
    issueId: "ObjectId",
    facultyId: "E12345",
    itemType: "Equipment",
    description: "Laptop",
    quantity: 1,
    issueDate: "2024-03-20T10:00:00Z",
    dueDate: "2024-04-30",
    referenceNumber: "Lab-1711010400000"
  }
}
```

#### 2. **Accept Return from Faculty**
```
POST /api/departments/:departmentName/accept-return
Headers: Authorization: Bearer {token}

Request Body:
{
  facultyId: "E12345",               // Required: Faculty employee ID
  referenceIssueId: "ObjectId",      // Required: The Issue being returned
  quantityReturned: 1,               // Required: Amount being returned
  condition: "Good"                  // Optional: Good|Fair|Damaged|Lost
}

Response (201):
{
  success: true,
  message: "Return processed successfully. Item fully returned.",
  data: {
    returnId: "ObjectId",
    facultyId: "E12345",
    itemType: "Equipment",
    quantityReturned: 1,
    condition: "Good",
    returnDate: "2024-03-25T14:30:00Z",
    issueFullyReturned: true
  },
  clearanceStatus: {
    overallStatus: "APPROVED",
    currentPhase: "Phase 1",
    phaseProgress: "1/4"
  }
}
```

#### 3. **Get Department Issues**
```
GET /api/departments/:departmentName/issues
GET /api/departments/:departmentName/issues?facultyId=E12345
GET /api/departments/:departmentName/issues?status=Issued

Response:
{
  success: true,
  count: 5,
  data: [
    {
      _id: "ObjectId",
      facultyId: "E12345",
      description: "Laptop",
      quantity: 1,
      status: "Issued",
      issueDate: "2024-03-20T10:00:00Z"
    },
    ...
  ]
}
```

#### 4. **Get Department Returns**
```
GET /api/departments/:departmentName/returns
GET /api/departments/:departmentName/returns?facultyId=E12345
GET /api/departments/:departmentName/returns?status=Cleared

Response:
{
  success: true,
  count: 3,
  data: [
    {
      _id: "ObjectId",
      facultyId: "E12345",
      itemType: "Equipment",
      quantityReturned: 1,
      status: "Cleared",
      condition: "Good",
      returnDate: "2024-03-25T14:30:00Z"
    },
    ...
  ]
}
```

#### 5. **Get Pending Issues for Faculty**
```
GET /api/departments/:departmentName/faculty/:facultyId/pending-issues

Response:
{
  success: true,
  count: 2,
  data: [
    {
      _id: "ObjectId",
      description: "Laptop",
      itemType: "Equipment",
      quantity: 1,
      status: "Issued",
      issueDate: "2024-03-20T10:00:00Z",
      dueDate: "2024-04-30"
    }
  ]
}
```

---

## Faculty/Clearance Integration

### Pre-Submission Check
```
GET /api/clearance-submission-check
Headers: Authorization: Bearer {token}

Response:
{
  success: true,
  facultyId: "E12345",
  canSubmitClearance: false,
  totalPendingItems: 3,
  departmentsWithPendingIssues: ["Lab", "Library"],
  issuesByDepartment: {
    "Lab": [
      {
        id: "ObjectId",
        description: "Laptop",
        quantity: 1,
        status: "Issued",
        dueDate: "2024-04-30",
        isOverdue: false
      }
    ],
    "Library": [
      {
        id: "ObjectId",
        description: "Books",
        quantity: 5,
        status: "Partially Returned"
      }
    ]
  },
  message: "You have 3 item(s) to return before clearance submission."
}
```

### Submit Clearance Request
```
POST /api/clearance-requests
Headers: Authorization: Bearer {token}

Request Body:
{
  designation: "Assistant Professor",
  office_location: "Building A, Room 201",
  contact_number: "+1234567890",
  degree_status: "Masters",
  department: "Computer Science"
}

Response:
{
  success: true,
  message: "Clearance request submitted! Automatic verification in progress...",
  request: {
    _id: "ObjectId",
    faculty_id: "E12345",
    status: "Pending" // or "Approved" if auto-cleared
    // ... other fields
  }
}
```

**Automatic Clearance Logic**:
- When a clearance request is submitted, the system automatically checks for any pending issues
- If NO pending issues exist in ANY department → Status = "Approved" (CLEARED)
- If pending issues exist → Status = "Pending" (needs returns)
- Departments move sequentially through phases (Phase 1 → Phase 2 → etc.)

---

## Service Functions

### Pending Issues Service
**File**: `/backend/services/pendingIssuesService.js`

```javascript
// Get pending issues by faculty (grouped by department)
await pendingIssuesService.getPendingIssuesByFaculty(facultyId);

// Get pending issues in specific department
await pendingIssuesService.getPendingIssuesInDepartment(facultyId, departmentName);

// Check if faculty has pending issues
const hasPending = await pendingIssuesService.hasPendingIssues(facultyId, departmentName);

// Get count of pending issues per department
await pendingIssuesService.getPendingIssuesCount(facultyId);

// Get what's blocking clearance
await pendingIssuesService.getClearanceBlockingIssues(facultyId);
```

### Auto-Clearance Service
**File**: `/backend/services/autoClearanceService.js` (Already Implemented)

```javascript
// Check faculty clearance (runs automatically on submission)
const result = await autoClearanceService.checkFacultyClearance(facultyId);

// Returns:
{
  overallStatus: "APPROVED" | "REJECTED",
  currentPhase: "Phase 1" | "Phase 2" | etc,
  phaseProgress: "1/4",
  phases: {
    "Phase 1": {
      status: "APPROVED" | "BLOCKED",
      allApproved: true | false,
      departments: [...]
    }
  },
  departmentDetails: {
    "Lab": {
      isCleared: true,
      pendingItems: [],
      pendingCount: 0
    }
  }
}
```

---

## Workflow Examples

### Example 1: Issue and Return Flow

```
1. Department Staff Issues Item:
   POST /api/departments/Lab/issue-item
   Body: { facultyId: "E123", itemType: "Equipment", description: "Laptop" }
   → Creates Issue record with status "Issued"

2. Faculty Sees Pending Item:
   GET /api/clearance-submission-check
   → Returns canSubmitClearance: false, shows pending items

3. Faculty Returns Item:
   POST /api/departments/Lab/accept-return
   Body: { facultyId: "E123", referenceIssueId: "...", quantityReturned: 1 }
   → Creates Return record, updates Issue status to "Cleared"
   → Auto-checks clearance

4. Faculty Now Can Submit:
   GET /api/clearance-submission-check
   → Returns canSubmitClearance: true if all items cleared
   
5. Faculty Submits Clearance:
   POST /api/clearance-requests
   → Auto-verification runs
   → If no pending items → Status "Approved" → Certificate issued
```

### Example 2: Phase-Based Clearance

```
Faculty: E456
Initial Submission:
- Lab: 2 items issued → NOT cleared until both returned
- Library: 1 item issued → NOT cleared until returned
- Can't proceed to Finance/HR/Record (Phase 2) until Phase 1 complete

After Lab Items Returned:
- Lab: cleared ✓
- Library: still pending (1 item)
- Still blocked in Phase 1 - can't get Phase 2 approval

After Library Item Returned:
- Phase 1 complete ✓ (Lab, Library, Pharmacy all cleared)
- Can now proceed to Phase 2
```

---

## Controller Functions

### Department Staff Controller
**File**: `/backend/modules/departmentStaffController.js`

```javascript
exports.issueItem();           // POST /issue-item
exports.acceptReturn();        // POST /accept-return
exports.getDepartmentIssues(); // GET /issues
exports.getDepartmentReturns(); // GET /returns
exports.getFacultyPendingIssues(); // GET /pending-issues
```

---

## Error Handling

### Common Error Cases

```javascript
// Faculty not found
{ success: false, message: "Faculty with ID E12345 not found" }

// Issue not found
{ success: false, message: "Referenced issue not found" }

// Mismatched faculty/department
{ success: false, message: "Issue does not match faculty or department" }

// Already fully returned
{ success: false, message: "This item has already been fully returned" }

// Missing required fields
{ success: false, message: "facultyId, itemType, and description are required" }
```

---

## Integration Points

### 1. **Issue Creation** 
- Department staff creates issue via frontend form
- System verifies faculty exists
- Creates Issue record with unique reference number
- Faculty sees this as pending clearance requirement

### 2. **Return Acceptance**
- Department staff records item return
- System updates Issue status to "Cleared" (if full return) or "Partially Returned"
- **Automatic re-check of clearance** runs
- If all issues in all departments cleared → Faculty auto-approved

### 3. **Clearance Submission**
- Faculty checks what items need returning first
- Submits clearance request
- System immediately checks for pending issues
- If none → Approved + Certificate generated
- If any pending → Awaits returns + shows progress

### 4. **Department Staff Views**
- Can see all issues issued by their department
- Can see all returns received by their department
- Can filter by faculty to see individual records
- Can process multiple returns in sequence

---

## Database Queries (Performance)

All indexes are optimized for these common queries:

```javascript
// Most Common: Get faculty pending items in department
Issue.find({
  facultyId: "E123",
  departmentName: "Lab",
  status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
})
// Uses: facultyId + departmentName index + status filter

// Get all pending for faculty across departments
Issue.find({
  facultyId: "E123",
  status: { $in: ['Issued', ..., 'Partially Returned'] }
})
// Uses: facultyId index, sorted by status

// Get department's returns today
Return.find({
  departmentName: "Lab",
  returnDate: { $gte: startOfDay }
})
// Uses: departmentName index, sorted by returnDate (descending)
```

---

## Testing Checklist

- [ ] Issue item to faculty via API
- [ ] Verify issue appears in pending items list
- [ ] Verify faculty cannot submit clearance
- [ ] Accept return of issued item
- [ ] Verify issue status updates to "Cleared"
- [ ] Verify auto-clearance check completes
- [ ] Verify faculty can now submit clearance
- [ ] Verify partial returns work correctly
- [ ] Verify overdue tracking (dueDate)
- [ ] Verify phase-based blocking

---

## Files Modified/Created

✅ **Models** (Already Existing):
- `/backend/models/Issue.js`
- `/backend/models/Return.js`

✅ **Controllers** (New/Updated):
- `/backend/modules/departmentStaffController.js` (NEW)
- `/backend/modules/issueController.js` (Existing)
- `/backend/modules/returnController.js` (Existing)

✅ **Services** (New/Existing):
- `/backend/services/pendingIssuesService.js` (NEW)
- `/backend/services/autoClearanceService.js` (Existing - integrates)

✅ **Routes** (Updated):
- `/backend/routes/departmentRoutes.js` (Added new endpoints)
- `/backend/routes/clearanceRoutes.js` (Added check endpoint)

✅ **Frontend** (Already Working):
- All Issue components (Lab, Library, Pharmacy, etc.)
- All Return components (Lab, Library, Pharmacy, etc.)

---

## Deployment Notes

1. **No new packages required** - Uses existing mongoose, express modules
2. **No database migrations needed** - Collections created on first use
3. **Indexes created automatically** - Mongoose creates schema indexes
4. **Auto-clearance runs seamlessly** - Integrates with existing service
5. **No breaking changes** - New endpoints, doesn't modify existing ones

---

## Future Enhancements

- [ ] Bulk issue operations (issue to multiple faculty)
- [ ] Return notifications to faculty
- [ ] Condition tracking (damaged/lost items)
- [ ] Overdue item reminders
- [ ] Department inventory management
- [ ] Item barcode/QR code scanning
- [ ] Return deadlines enforcement

