# Issue-Based Clearance Checking - Quick Reference

## Endpoint Summary (One Page)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ISSUE-BASED CLEARANCE CHECKING API                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1️⃣  GET /check-issues/:facultyId                                          │
│     Every blocking issue for a faculty member                              │
│     Response: array of {type, department, message, details}                │
│     Auth: No                                                                │
│                                                                              │
│  2️⃣  GET /check-issues/:facultyId/department/:department                    │
│     Issue details for specific department                                   │
│     Response: {currentStatus, isBlocking, actionRequired, canResubmit}    │
│     Auth: No                                                                │
│                                                                              │
│  3️⃣  POST /report-pending-item                                             │
│     Faculty reports uncleared item                                         │
│     Body: {department, itemDescription, itemType, reportedDate}           │
│     Response: {success, pendingItem, totalPendingItems}                   │
│     Auth: Yes (JWT)                                                        │
│                                                                              │
│  4️⃣  GET /pending-items                                                    │
│     All pending items for faculty                                          │
│     Response: {pendingItems, itemsByDepartment, totalCount, hasPendingItems}│
│     Auth: Yes (JWT)                                                        │
│                                                                              │
│  5️⃣  PUT /pending-items/:itemId/resolve                                    │
│     Mark item as resolved                                                  │
│     Body: {resolvedDate, notes}                                            │
│     Response: {success, item}                                              │
│     Auth: Yes (JWT)                                                        │
│                                                                              │
│  6️⃣  GET /blocking-issue/:facultyId                                        │
│     PRIMARY reason blocking clearance                                      │
│     Response: {isBlocked, blockingIssue, currentStatus}                   │
│     Auth: No                                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Response Examples

### Blocking Issue - Department Rejection
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
  }
}
```

### Blocking Issue - Pending Items
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
  }
}
```

### All Issues Response
```json
{
  "success": true,
  "hasPendingIssues": true,
  "blockingIssues": [
    {
      "type": "returned_items",
      "department": "Library",
      "message": "Items must be returned to Library",
      "remarks": "2 books not yet returned"
    },
    {
      "type": "returned_items",
      "department": "Finance",
      "message": "Items must be returned to Finance",
      "remarks": "Salary advance not cleared"
    }
  ],
  "totalBlockingIssues": 2
}
```

### Pending Items Response
```json
{
  "success": true,
  "pendingItems": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "department": "Finance",
      "itemDescription": "Salary advance of 50,000 PKR",
      "itemType": "financial",
      "status": "pending",
      "resolved": false,
      "reportedDate": "2024-01-15T10:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "department": "Library",
      "itemDescription": "Reference books (3 titles)",
      "itemType": "general",
      "status": "resolved",
      "resolved": true,
      "resolvedDate": "2024-01-15T14:00:00Z"
    }
  ],
  "itemsByDepartment": {
    "Finance": [ /* items */ ],
    "Library": [ /* items */ ]
  },
  "totalCount": 2,
  "hasPendingItems": true
}
```

---

## Frontend Button Component Example

### React Button
```jsx
<button 
  className="btn btn-warning"
  onClick={() => checkWhyBlocked()}
>
  ⚠️ Check Why Blocked
</button>
```

### HTML Button
```html
<button class="btn btn-warning" onclick="checkWhyBlocked()">
  ⚠️ Check Why Blocked
</button>
```

### Vue Toggle
```vue
<button 
  @click="showBlockingIssue = !showBlockingIssue"
  :class="{ 'btn-active': blockingIssue }"
  class="btn btn-warning"
>
  Check Clearance Issues
</button>

<div v-if="showBlockingIssue && blockingIssue" class="issue-card">
  <h3>{{ blockingIssue.message }}</h3>
  <p>{{ blockingIssue.details }}</p>
  <button @click="handleAction">{{ blockingIssue.action }}</button>
</div>
```

---

## cURL Testing Snippets

### Test 1: Check Primary Blocker
```bash
curl -X GET "http://localhost:5000/api/clearance/blocking-issue/607f1f77bcf86cd799439011"
```

### Test 2: Report Item (Authenticated)
```bash
curl -X POST "http://localhost:5000/api/clearance/report-pending-item" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"department":"Finance","itemDescription":"Dues","itemType":"financial"}'
```

### Test 3: Get Pending Items
```bash
curl -X GET "http://localhost:5000/api/clearance/pending-items" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Test 4: Resolve Item
```bash
curl -X PUT "http://localhost:5000/api/clearance/pending-items/607f1f77bcf86cd799439012/resolve" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Resolved with department"}'
```

### Test 5: Check All Issues
```bash
curl -X GET "http://localhost:5000/api/clearance/check-issues/607f1f77bcf86cd799439011"
```

### Test 6: Check Department Issues
```bash
curl -X GET "http://localhost:5000/api/clearance/check-issues/607f1f77bcf86cd799439011/department/Library"
```

---

## JavaScript Integration

### Basic Fetch Example
```javascript
// Check blocking issue
async function checkBlocking(facultyId) {
  const res = await fetch(`/api/clearance/blocking-issue/${facultyId}`);
  const data = await res.json();
  
  if (data.isBlocked) {
    alert(`❌ ${data.blockingIssue.message}`);
  } else {
    alert('✅ No issues!');
  }
}

// Report pending item
async function reportItem(dept, desc) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/clearance/report-pending-item', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      department: dept,
      itemDescription: desc,
      itemType: 'general'
    })
  });
  const data = await res.json();
  return data.success;
}

// Get pending items
async function getPending() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/clearance/pending-items', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.pendingItems;
}

// Resolve item
async function resolveItem(itemId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/clearance/pending-items/${itemId}/resolve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes: 'Resolved' })
  });
  return (await res.json()).success;
}
```

---

## TypeScript Types

```typescript
interface BlockingIssue {
  type: 'department_rejection' | 'pending_items';
  severity: 'high' | 'medium' | 'low';
  message: string;
  details?: string;
  department?: string;
  itemCount?: number;
  action: string;
}

interface PendingItem {
  _id: string;
  department: string;
  itemDescription: string;
  itemType: string;
  reportedDate: Date;
  createdAt: Date;
  status: 'pending' | 'resolved';
  resolved: boolean;
  resolvedDate?: Date;
  resolutionNotes?: string;
}

interface CheckIssuesResponse {
  success: boolean;
  hasPendingIssues: boolean;
  blockingIssues: Array<{
    type: string;
    department?: string;
    message: string;
    remarks?: string;
  }>;
  totalBlockingIssues: number;
  clearanceId: string;
  currentStatus: string;
}

interface PendingItemsResponse {
  success: boolean;
  pendingItems: PendingItem[];
  itemsByDepartment: Record<string, PendingItem[]>;
  totalCount: number;
  hasPendingItems: boolean;
}
```

---

## State Management (Redux/Vuex)

### Redux Actions
```javascript
export const checkBlockingIssue = (facultyId) => async (dispatch) => {
  const res = await fetch(`/api/clearance/blocking-issue/${facultyId}`);
  const data = await res.json();
  dispatch({
    type: 'SET_BLOCKING_ISSUE',
    payload: data
  });
};

export const reportPendingItem = (item) => async (dispatch) => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/clearance/report-pending-item', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  });
  const data = await res.json();
  dispatch({
    type: 'ADD_PENDING_ITEM',
    payload: data.pendingItem
  });
};
```

### Vuex Mutations
```javascript
const mutations = {
  SET_BLOCKING_ISSUE(state, issue) {
    state.blockingIssue = issue;
  },
  ADD_PENDING_ITEM(state, item) {
    state.pendingItems.push(item);
  },
  RESOLVE_PENDING_ITEM(state, itemId) {
    const item = state.pendingItems.find(i => i._id === itemId);
    if (item) item.status = 'resolved';
  },
  SET_PENDING_ITEMS(state, items) {
    state.pendingItems = items;
  }
};
```

---

## Error Handling Pattern

```javascript
async function handleAPICall(endpoint, method = 'GET', body = null) {
  try {
    const token = localStorage.getItem('token');
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    showErrorMessage(error.message);
    throw error;
  }
}

// Usage
try {
  const result = await handleAPICall('/api/clearance/blocking-issue/123');
  displayBlockingIssue(result.blockingIssue);
} catch (error) {
  // Error already displayed
}
```

---

## Database Query Examples

### Find Faculty with Pending Items
```javascript
// Find all faculty with pending items
db.clearancerequests.find({ has_pending_items: true })

// Find pending items for specific faculty
db.clearancerequests.findOne({ faculty_id: ObjectId('...') })
  .pending_items.filter(p => p.status === 'pending')

// Count unresolved items by department
db.clearancerequests.aggregate([
  { $match: { has_pending_items: true } },
  { $unwind: '$pending_items' },
  { $match: { 'pending_items.status': 'pending' } },
  { $group: {
      _id: '$pending_items.department',
      count: { $sum: 1 }
    }
  }
])
```

---

## Monitoring & Health Check

### Check if System is Working
```bash
# Test basic connectivity
curl http://localhost:5000/api/clearance/blocking-issue/test

# Expected: 404 (not found) or 200 with null data
# Not expected: 500 error

# Test with real data
curl http://localhost:5000/api/clearance/check-issues/$(YOUR_FACULTY_ID)
# Should return either [] or array with issues
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot read property '_id' of undefined" | Faculty hasn't submitted clearance yet |
| "JWT token expired" | User needs to re-login |
| "No pending items found" | has_pending_items flag not set (auto-sets) |
| "Department not found" | Check exact department name spelling |
| 404 on resolve | itemId doesn't exist or belongs to different faculty |

---

## Implementation Checklist

- [ ] Routes added to clearanceRoutes.js
- [ ] Mongoose imported in routes file
- [ ] ClearanceRequest schema updated
- [ ] Tested all 6 endpoints with cURL
- [ ] Integrated blocking issue check in dashboard
- [ ] Added pending items widget to UI
- [ ] Created report item form
- [ ] Added pending items list view
- [ ] Implemented resolve functionality
- [ ] Added error handling in frontend
- [ ] Styled UI components
- [ ] Added notifications/alerts
- [ ] Updated documentation
- [ ] Tested with real faculty data
- [ ] Performance tested with large datasets
- [ ] Security audit completed
- [ ] Deployed to staging
- [ ] User testing feedback gathered
- [ ] Deployed to production

---

## Support & Next Steps

**Documentation Files:**
- `ISSUE_BASED_CLEARANCE_API.md` - Full API documentation
- `ISSUE_CLEARANCE_TESTING_GUIDE.md` - Testing guide with code examples
- `ISSUE_BASED_CLEARANCE_SUMMARY.md` - Complete implementation summary

**Quick Links:**
- Backend: `/backend/routes/clearanceRoutes.js`
- Schema: `/backend/models/ClearanceRequest.js`
- API Base: `http://localhost:5000/api/clearance`

**Questions?**
Check the appropriate documentation file or review the code comments in the route handlers.

