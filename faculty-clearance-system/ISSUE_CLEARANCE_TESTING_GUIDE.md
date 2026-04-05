# Issue-Based Clearance Checking - Implementation Guide

## Quick Start

### What's New?
Six new API endpoints for tracking and managing issues that block faculty clearance:

1. **Check all issues** - See everything blocking clearance
2. **Check department issues** - Get specific details for a department
3. **Report pending item** - Faculty reports uncleared items
4. **Get pending items** - View all reported pending items
5. **Resolve pending item** - Mark items as cleared
6. **Check blocking issue** - Get the primary blocker

---

## Testing with cURL/Postman

### Test 1: Check Primary Blocker
```bash
curl -X GET "http://localhost:5000/api/clearance/blocking-issue/607f1f77bcf86cd799439011"
```

**What it does:** Returns the #1 reason why a faculty can't be cleared  
**Expected:** Either a blocking issue or null if cleared

---

### Test 2: Report a Pending Item (Authenticated)
```bash
curl -X POST "http://localhost:5000/api/clearance/report-pending-item" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Finance",
    "itemDescription": "Salary advance of 50000 PKR not cleared",
    "itemType": "financial",
    "reportedDate": "2024-01-15T10:00:00Z"
  }'
```

**What it does:** Records pendng items that block clearance  
**Expected:** Returns the created pending item with ID

---

### Test 3: Get All Pending Items (Authenticated)
```bash
curl -X GET "http://localhost:5000/api/clearance/pending-items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**What it does:** Shows all pending items for the faculty  
**Expected:** Array of pending items grouped by department

---

### Test 4: Resolve a Pending Item (Authenticated)
```bash
curl -X PUT "http://localhost:5000/api/clearance/pending-items/607f1f77bcf86cd799439012/resolve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Cleared with Finance office on 2024-01-15",
    "resolvedDate": "2024-01-15T10:30:00Z"
  }'
```

**What it does:** Marks an item as resolved  
**Expected:** Returns the updated pending item with status='resolved'

---

### Test 5: Check All Issues for Faculty
```bash
curl -X GET "http://localhost:5000/api/clearance/check-issues/607f1f77bcf86cd799439011"
```

**What it does:** Returns all blocking issues  
**Expected:** Array of all issues with types and details

---

### Test 6: Check Department Specific Issues
```bash
curl -X GET "http://localhost:5000/api/clearance/check-issues/607f1f77bcf86cd799439011/department/Library"
```

**What it does:** Get details for specific department  
**Expected:** Issue details + action required + resubmit instructions

---

## Frontend Integration Examples

### Example 1: Showing Clearance Blocker to Faculty
```javascript
// In Faculty Dashboard Component
async function checkWhyBlocked() {
  const response = await fetch(
    `/api/clearance/blocking-issue/${facultyId}`
  );
  const data = await response.json();
  
  if (data.isBlocked && data.blockingIssue) {
    const blocker = data.blockingIssue;
    
    // Show different messages based on type
    if (blocker.type === 'department_rejection') {
      showAlert(`⚠️ ${blocker.message}
               Department: ${blocker.department}
               Details: ${blocker.details}
               Action: ${blocker.action}`);
    } else if (blocker.type === 'pending_items') {
      showAlert(`⚠️ You have ${blocker.itemCount} unresolved items
               Action: ${blocker.action}`);
    }
  } else {
    showAlert('✅ No issues blocking your clearance!');
  }
}
```

### Example 2: Faculty Reporting Uncleared Items
```javascript
// In a "Report Issue" Form Component
async function reportItem(form) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    '/api/clearance/report-pending-item',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        department: form.department,
        itemDescription: form.description,
        itemType: form.type,
        reportedDate: new Date()
      })
    }
  );
  
  const result = await response.json();
  
  if (result.success) {
    showSuccess(`✅ Item reported! Total pending: ${result.totalPendingItems}`);
    refreshPendingItems();
  } else {
    showError(`❌ Failed: ${result.message}`);
  }
}
```

### Example 3: Dashboard Widget for Pending Items
```javascript
// In Dashboard Component
async function showPendingItemsWidget() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    '/api/clearance/pending-items',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  
  if (data.hasPendingItems) {
    // Group by status
    const pending = data.pendingItems.filter(i => i.status === 'pending');
    const resolved = data.pendingItems.filter(i => i.status === 'resolved');
    
    console.log(`📋 Pending Items: ${pending.length}`);
    console.log(`✅ Resolved Items: ${resolved.length}`);
    
    // Display in UI
    displayWidget({
      title: 'Pending Clearance Items',
      pending: pending,
      resolved: resolved,
      byDept: data.itemsByDepartment
    });
  }
}
```

### Example 4: Department Staff Checking Faculty Issues
```javascript
// In Department Dashboard/Admin Panel
async function checkFacultyIssues(facultyId) {
  // Get all blocking issues
  const response = await fetch(
    `/api/clearance/check-issues/${facultyId}`
  );
  const data = await response.json();
  
  if (data.hasPendingIssues) {
    // Show each issue
    data.blockingIssues.forEach(issue => {
      console.log(`Issue: ${issue.type}`);
      console.log(`Department: ${issue.department}`);
      console.log(`Details: ${issue.message}`);
    });
    
    // Render issue resolution panel
    showIssuePanel(data.blockingIssues);
  }
}
```

---

## Vue.js Integration Example
```vue
<template>
  <div class="clearance-issues">
    <!-- Check if blocked -->
    <div v-if="blockingIssue" class="alert alert-warning">
      <h4>⚠️ {{ blockingIssue.message }}</h4>
      <p>{{ blockingIssue.details }}</p>
      <button @click="handleBlockingIssue">{{ blockingIssue.action }}</button>
    </div>

    <!-- Pending items list -->
    <div v-if="hasPendingItems" class="pending-items">
      <h3>Pending Items ({{ totalPendingItems }})</h3>
      
      <div v-for="item in pendingItems" :key="item._id" class="item">
        <div class="item-header">
          <span class="dept">{{ item.department }}</span>
          <span class="type" :class="`type-${item.itemType}`">{{ item.itemType }}</span>
          <span class="status" :class="`status-${item.status}`">{{ item.status }}</span>
        </div>
        
        <p class="description">{{ item.itemDescription }}</p>
        
        <div v-if="item.status === 'pending'" class="actions">
          <button @click="markResolved(item._id)" class="btn-resolve">
            Mark as Resolved
          </button>
        </div>
        
        <div v-else class="resolved-info">
          <small>Resolved on {{ formatDate(item.resolvedDate) }}</small>
          <small v-if="item.resolutionNotes">
            Note: {{ item.resolutionNotes }}
          </small>
        </div>
      </div>
    </div>

    <!-- No issues -->
    <div v-else class="alert alert-success">
      ✅ All clearance items resolved!
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      blockingIssue: null,
      pendingItems: [],
      hasPendingItems: false,
      totalPendingItems: 0
    };
  },
  
  mounted() {
    this.loadBlockingIssue();
    this.loadPendingItems();
  },
  
  methods: {
    async loadBlockingIssue() {
      const response = await fetch(
        `/api/clearance/blocking-issue/${this.$route.params.facultyId}`
      );
      const data = await response.json();
      this.blockingIssue = data.blockingIssue;
    },
    
    async loadPendingItems() {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clearance/pending-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      this.pendingItems = data.pendingItems;
      this.hasPendingItems = data.hasPendingItems;
      this.totalPendingItems = data.totalCount;
    },
    
    async markResolved(itemId) {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/clearance/pending-items/${itemId}/resolve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notes: 'Resolved by faculty'
          })
        }
      );
      
      if (response.ok) {
        this.$notify.success('Item marked as resolved');
        this.loadPendingItems();
      }
    },
    
    handleBlockingIssue() {
      if (this.blockingIssue.type === 'department_rejection') {
        // Show form to resubmit
        this.$router.push({
          name: 'ResubmitClearance',
          params: { department: this.blockingIssue.department }
        });
      } else if (this.blockingIssue.type === 'pending_items') {
        // Show pending items section
        document.querySelector('.pending-items').scrollIntoView();
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.clearance-issues {
  padding: 20px;
}

.pending-items {
  margin-top: 20px;
}

.item {
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
}

.item-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.status {
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 12px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-resolved {
  background: #d4edda;
  color: #155724;
}
</style>
```

---

## React Integration Example
```jsx
import React, { useState, useEffect } from 'react';

export function ClearanceIssuesWidget() {
  const [blockingIssue, setBlockingIssue] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkBlockingIssue();
    loadPendingItems();
  }, []);
  
  async function checkBlockingIssue() {
    try {
      const facultyId = getUserId(); // Your auth method
      const response = await fetch(`/api/clearance/blocking-issue/${facultyId}`);
      const data = await response.json();
      setBlockingIssue(data.blockingIssue);
    } catch (error) {
      console.error('Error checking blocker:', error);
    }
  }
  
  async function loadPendingItems() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clearance/pending-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingItems(data.pendingItems);
      setLoading(false);
    } catch (error) {
      console.error('Error loading items:', error);
      setLoading(false);
    }
  }
  
  async function resolveItem(itemId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/clearance/pending-items/${itemId}/resolve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: 'Resolved' })
        }
      );
      
      if (response.ok) {
        loadPendingItems(); // Refresh list
      }
    } catch (error) {
      console.error('Error resolving item:', error);
    }
  }
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="clearance-issues">
      {blockingIssue && (
        <div className="alert alert-warning">
          <h4>⚠️ {blockingIssue.message}</h4>
          <p>{blockingIssue.details || blockingIssue.action}</p>
        </div>
      )}
      
      <div className="pending-items">
        <h3>Pending Items ({pendingItems.filter(i => i.status === 'pending').length})</h3>
        
        {pendingItems.map(item => (
          <div key={item._id} className="item">
            <div className="item-header">
              <span className="dept">{item.department}</span>
              <span className={`status status-${item.status}`}>
                {item.status}
              </span>
            </div>
            
            <p className="description">{item.itemDescription}</p>
            
            {item.status === 'pending' ? (
              <button 
                onClick={() => resolveItem(item._id)}
                className="btn btn-primary"
              >
                Mark as Resolved
              </button>
            ) : (
              <small className="text-muted">
                Resolved on {new Date(item.resolvedDate).toLocaleDateString()}
              </small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Database Considerations

### Query Optimization
The system uses indexes for fast queries:
- `faculty_id` + `created_at` for finding latest requests
- Full-text search on `pending_items` descriptions (recommended)

### Backup & Recovery
Pending items are stored in the ClearanceRequest document:
```javascript
// Always backup before migrations
db.clearancerequests.find({ has_pending_items: true }).count()
```

---

## Troubleshooting

### Issue: "No clearance request found"
**Cause:** Faculty hasn't submitted a clearance request yet  
**Solution:** Call submit clearance endpoint first

### Issue: Pending item not appearing
**Cause:** `has_pending_items` flag not set  
**Solution:** Endpoint automatically sets flag - try again

### Issue: JWT token expired
**Cause:** Session timeout  
**Solution:** Refresh token or re-login

---

## Monitoring & Logging

The endpoints log important events:
```
🔍 [GET /check-issues] Checking issues for faculty: 607f1f77...
📝 [POST /report-pending-item] New report from 607f1f77...
✅ Pending item reported and saved
```

Check logs with:
```bash
# Tail recent logs
tail -f logs/clearance.log | grep "issues"
tail -f logs/clearance.log | grep "pending"
```

---

## Summary

**What each endpoint does:**

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /check-issues/:facultyId` | Get all blocking issues | No |
| `GET /check-issues/:facultyId/department/:dept` | Get dept-specific issues | No |
| `POST /report-pending-item` | Faculty reports items | Yes |
| `GET /pending-items` | Get all pending items | Yes |
| `PUT /pending-items/:itemId/resolve` | Mark item resolved | Yes |
| `GET /blocking-issue/:facultyId` | Get primary blocker | No |

**Next Steps:**
1. Test endpoints with cURL/Postman
2. Integrate into frontend using examples above
3. Monitor logs for issues
4. Gather user feedback for improvements

