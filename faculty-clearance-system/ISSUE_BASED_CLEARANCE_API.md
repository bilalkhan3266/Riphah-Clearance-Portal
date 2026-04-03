# Issue-Based Clearance Checking API

## Overview
The issue-based clearance checking system provides comprehensive endpoints for tracking and managing unresolved items that block faculty clearance. Faculty members and administrators can check what issues are preventing clearance completion and monitor progress toward resolution.

---

## New API Endpoints

### 1. Check All Unresolved Issues
**GET** `/api/clearance/check-issues/:facultyId`

Returns all blocking issues preventing a faculty member from being cleared.

**Path Parameters:**
- `facultyId` (required): MongoDB ObjectId of the faculty member

**Response:**
```json
{
  "success": true,
  "hasPendingIssues": true,
  "blockingIssues": [
    {
      "type": "returned_items",
      "department": "Library",
      "message": "Items must be returned to Library",
      "remarks": "Books and journals not yet returned"
    },
    {
      "type": "pending_items",
      "message": "Faculty has pending items that need clearance",
      "details": []
    }
  ],
  "totalBlockingIssues": 2,
  "clearanceId": "507f1f77bcf86cd799439011",
  "currentStatus": "In Progress"
}
```

**Blocking Issue Types:**
- `returned_items`: Items that must be physically returned to a department
- `pending_items`: Unresolved administrative items

---

### 2. Check Department-Specific Issues
**GET** `/api/clearance/check-issues/:facultyId/department/:department`

Returns detailed issue information for a specific department.

**Path Parameters:**
- `facultyId` (required): MongoDB ObjectId of the faculty member
- `department` (required): Department name (e.g., 'Library', 'Finance')

**Response:**
```json
{
  "success": true,
  "issue": {
    "department": "Library",
    "currentStatus": "Rejected",
    "lastCheckedAt": "2024-01-15T10:30:00Z",
    "approvedBy": null,
    "checkedBy": "admin_user",
    "remarks": "Reference books and journals not yet returned",
    "isBlocking": true,
    "actionRequired": "Items must be returned to this department",
    "nextStep": "Visit Library office and resolve the issue",
    "canResubmit": true,
    "resubmissionInstructions": "Once items are returned, use the 'Resubmit Clearance' option"
  },
  "clearanceId": "507f1f77bcf86cd799439011"
}
```

**Response Fields:**
- `department`: Department name
- `currentStatus`: Current clearance status (Pending/Approved/Rejected)
- `lastCheckedAt`: When the department last checked the clearance
- `isBlocking`: Whether this department is blocking overall clearance
- `actionRequired`: What action the faculty needs to take
- `canResubmit`: Whether faculty can resubmit after resolving issues

---

### 3. Report Pending Item
**POST** `/api/clearance/report-pending-item`

Faculty reports an uncleared item that's blocking their clearance.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "department": "Finance",
  "itemDescription": "Salary advance balance of 50,000 PKR not yet cleared",
  "itemType": "financial",
  "reportedDate": "2024-01-15T10:30:00Z"
}
```

**Request Fields:**
- `department` (required): Department name
- `itemDescription` (required): Detailed description of the pending item
- `itemType` (optional): Category (e.g., 'financial', 'equipment', 'general')
- `reportedDate` (optional): Date of report (defaults to current date)

**Response:**
```json
{
  "success": true,
  "message": "Pending item reported successfully",
  "pendingItem": {
    "_id": "507f1f77bcf86cd799439012",
    "department": "Finance",
    "itemDescription": "Salary advance balance of 50,000 PKR not yet cleared",
    "itemType": "financial",
    "reportedDate": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "pending",
    "resolved": false
  },
  "totalPendingItems": 3
}
```

---

### 4. Get All Pending Items
**GET** `/api/clearance/pending-items`

Retrieves all pending items reported by the authenticated faculty member.

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "success": true,
  "pendingItems": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "department": "Finance",
      "itemDescription": "Salary advance balance not cleared",
      "itemType": "financial",
      "reportedDate": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "pending",
      "resolved": false
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "department": "Library",
      "itemDescription": "Reference books not returned",
      "itemType": "general",
      "reportedDate": "2024-01-14T15:45:00Z",
      "createdAt": "2024-01-14T15:45:00Z",
      "status": "resolved",
      "resolved": true,
      "resolvedDate": "2024-01-15T09:00:00Z",
      "resolutionNotes": "Books returned to library"
    }
  ],
  "itemsByDepartment": {
    "Finance": [
      { /* item details */ }
    ],
    "Library": [
      { /* item details */ }
    ]
  },
  "totalCount": 2,
  "hasPendingItems": true
}
```

---

### 5. Resolve Pending Item
**PUT** `/api/clearance/pending-items/:itemId/resolve`

Marks a pending item as resolved.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `itemId` (required): MongoDB ObjectId of the pending item

**Request Body:**
```json
{
  "resolvedDate": "2024-01-15T10:30:00Z",
  "notes": "Salary advance was paid and settled with Finance office"
}
```

**Request Fields:**
- `resolvedDate` (optional): Date of resolution (defaults to current date)
- `notes` (optional): Resolution notes/comments

**Response:**
```json
{
  "success": true,
  "message": "Item marked as resolved",
  "item": {
    "_id": "507f1f77bcf86cd799439012",
    "department": "Finance",
    "itemDescription": "Salary advance balance not cleared",
    "itemType": "financial",
    "reportedDate": "2024-01-15T10:30:00Z",
    "status": "resolved",
    "resolved": true,
    "resolvedDate": "2024-01-15T10:30:00Z",
    "resolutionNotes": "Salary advance was paid and settled with Finance office"
  }
}
```

---

### 6. Check Primary Blocking Issue
**GET** `/api/clearance/blocking-issue/:facultyId`

Returns the primary issue blocking faculty clearance (most critical first).

**Path Parameters:**
- `facultyId` (required): MongoDB ObjectId of the faculty member

**Response - Department Rejection:**
```json
{
  "success": true,
  "isBlocked": true,
  "blockingIssue": {
    "type": "department_rejection",
    "severity": "high",
    "department": "Library",
    "message": "Clearance blocked: Items must be returned to Library",
    "details": "Reference books and journals not yet returned",
    "action": "Return items and resubmit clearance"
  },
  "clearanceId": "507f1f77bcf86cd799439011",
  "currentStatus": "In Progress"
}
```

**Response - Pending Items:**
```json
{
  "success": true,
  "isBlocked": true,
  "blockingIssue": {
    "type": "pending_items",
    "severity": "medium",
    "message": "Clearance blocked: 3 unresolved item(s)",
    "itemCount": 3,
    "action": "Resolve pending items"
  },
  "clearanceId": "507f1f77bcf86cd799439011",
  "currentStatus": "In Progress"
}
```

**Response - Not Blocked:**
```json
{
  "success": true,
  "isBlocked": false,
  "blockingIssue": null,
  "clearanceId": "507f1f77bcf86cd799439011",
  "currentStatus": "Cleared"
}
```

**Severity Levels:**
- `high`: Department rejection - physical items must be returned
- `medium`: Pending items - administrative action required
- `low`: Minor issues

---

## Integration with Existing System

### Database Schema Updates
The ClearanceRequest model has been updated with:

```javascript
{
  // Issue-based tracking
  has_pending_items: Boolean,           // Flag for pending items
  pending_items: [                      // Array of reported items
    {
      _id: ObjectId,
      department: String,
      itemDescription: String,
      itemType: String,
      reportedDate: Date,
      createdAt: Date,
      status: String,                   // 'pending' or 'resolved'
      resolved: Boolean,
      resolvedDate: Date,
      resolutionNotes: String
    }
  ],
  pending_items_details: Mixed          // Additional metadata
}
```

### Department Status Schema
Each department in the `departments` object maintains:

```javascript
{
  hasPendingItems: Boolean,             // Department has pending items
  remarks: String                       // Description of pending items
}
```

---

## Use Cases

### Use Case 1: Faculty Checking What's Blocking Clearance
```bash
# Faculty wants to know why they can't be cleared
GET /api/clearance/blocking-issue/:facultyId
# Returns: Primary blocker with action required
```

### Use Case 2: Faculty Reporting Uncleared Items
```bash
# Faculty reports they have uncleared items
POST /api/clearance/report-pending-item
{
  "department": "Finance",
  "itemDescription": "Dues not cleared",
  "itemType": "financial"
}
# This updates the clearance request and blocks further progression
```

### Use Case 3: Department Staff Checking Faculty Issues
```bash
# Department staff wants to see details for specific department
GET /api/clearance/check-issues/:facultyId/department/:department
# Returns detailed issue info for that department
```

### Use Case 4: Faculty Following Up on Pending Items
```bash
# Faculty monitors their pending items
GET /api/clearance/pending-items
# Marks items as resolved as they clear them
PUT /api/clearance/pending-items/:itemId/resolve
```

---

## Error Handling

All endpoints return standardized error responses:

**400 - Bad Request:**
```json
{
  "success": false,
  "message": "Department and item description are required"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "No clearance request found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Error checking issues: {error details}"
}
```

---

## Implementation Notes

### For Frontend Developers

1. **Check Clearance Blocker:**
   ```javascript
   // Call this to show faculty why they can't submit
   const response = await fetch(`/api/clearance/blocking-issue/${facultyId}`);
   const { blockingIssue, isBlocked } = await response.json();
   
   if (isBlocked) {
     showBlockerMessage(blockingIssue);
   }
   ```

2. **Report Pending Item:**
   ```javascript
   // Faculty reports uncleared items
   const response = await fetch('/api/clearance/report-pending-item', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${token}` },
     body: JSON.stringify({
       department: 'Finance',
       itemDescription: 'Dues to be cleared',
       itemType: 'financial'
     })
   });
   ```

3. **Monitor Pending Items:**
   ```javascript
   // Show faculty all their pending items
   const response = await fetch('/api/clearance/pending-items', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   const { pendingItems, totalCount } = await response.json();
   displayPendingItems(pendingItems);
   ```

### For Backend Services

The `issueClearanceService` integrates with these endpoints:

```javascript
// Check if faculty has blocking issues
const issues = await issueClearanceService.checkBlockingIssues(facultyId);

// Get pending items for a faculty
const items = await issueClearanceService.getPendingItems(facultyId);

// Automatically update pending items based on department rejections
const updated = await issueClearanceService.syncFromDepartmentStatus(clearanceId);
```

---

## Testing Guide

### Test 1: Report and Resolve Pending Item
```bash
# 1. Report a pending item
POST /api/clearance/report-pending-item
{
  "department": "Finance",
  "itemDescription": "Test item",
  "itemType": "financial"
}

# 2. Get all pending items
GET /api/clearance/pending-items

# 3. Resolve the item (use returned _id)
PUT /api/clearance/pending-items/{itemId}/resolve
{
  "notes": "Item resolved"
}

# 4. Verify it's resolved
GET /api/clearance/pending-items
# Verify status is now 'resolved'
```

### Test 2: Check Department-Specific Issues
```bash
# 1. Get all issues for faculty
GET /api/clearance/check-issues/{facultyId}

# 2. Get issues for specific department
GET /api/clearance/check-issues/{facultyId}/department/Library

# 3. Get Primary blocker
GET /api/clearance/blocking-issue/{facultyId}
```

---

## Summary

The issue-based clearance checking system provides:

✅ **Real-time Issue Tracking** - Know what's blocking clearance  
✅ **Detailed Feedback** - Understand why clearance is blocked  
✅ **Pending Item Management** - Track and resolve uncleared items  
✅ **Department Integration** - Linked with department rejection status  
✅ **Faculty Transparency** - Clear communication on clearance progress  

These endpoints work seamlessly with the existing automatic clearance system to provide comprehensive clearance management.
