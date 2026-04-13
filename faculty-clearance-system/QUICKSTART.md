# ⚡ Quick Start - Get Automated Clearance Running in 5 Minutes

## TLDR - Fastest Path to Testing

### Terminal 1: Backend

```bash
cd backend
npm run dev
# You should see: ✅ Server running on port 5001
```

### Terminal 2: Frontend

```bash
cd frontend
npm start
# You should see: Compiled successfully! Available at http://localhost:3000
```

### Terminal 3: MongoDB (if needed)

```bash
# Already running? Skip this
# Not running?
mongod

# Or use MongoDB Atlas cloud (connection string in .env)
```

---

## Verify Everything Works

### Test 1: Backend is responding

```bash
curl http://localhost:5001/api/health
# Expected: {"status":"ok","message":"Server is running"}
```

### Test 2: Can login faculty

```bash
# Use existing faculty account or create one
# Login via frontend UI
# Should see dashboard
```

### Test 3: Submit Clearance

1. Login as faculty
2. Navigate to "Submit Clearance"
3. Fill form and submit
4. **Should see INSTANT result** (not loading)

---

## What to Look For

### ✅ System is Working If:

- Faculty with **no issues** → ✅ **INSTANTLY APPROVED**
- Response time < 1 second
- No "Pending" state visible
- Shows "Phase Progress: 4/4"

### ✅ System Blocking Correctly If:

- Faculty with **issued items** → ❌ **INSTANTLY REJECTED**  
- Shows "BLOCKED at Phase 1"
- Shows which items to return
- Shows item details (description, type, qty)

### ✅ Real-Time Updates If:

1. Faculty views status
2. Mark item as returned in database
3. Wait 5 seconds (auto-refresh)
4. Status updates WITHOUT page refresh

---

## Quick Test Data Setup

### Create Test Faculty with NO Issues

```javascript
// In MongoDB shell or Compass

// 1. Create faculty user
db.users.insertOne({
  _id: ObjectId(),
  id: "TEST_FAC_001",
  email: "test1@university.edu",
  full_name: "Test Faculty One",
  faculty_id: "TEST_FAC_001",
  role: "faculty",
  department: "Science"
})

// 2. Verify NO issues exist
db.issues.deleteMany({ facultyId: "TEST_FAC_001" })
db.returns.deleteMany({ facultyId: "TEST_FAC_001" })

// Now login and submit clearance
// Expected: ✅ APPROVED INSTANTLY
```

### Create Test Faculty WITH Issues

```javascript
// 1. Create faculty
db.users.insertOne({
  _id: ObjectId(),
  id: "TEST_FAC_002",
  email: "test2@university.edu",
  full_name: "Test Faculty Two",
  faculty_id: "TEST_FAC_002",
  role: "faculty"
})

// 2. Create ISSUED item (not returned)
db.issues.insertOne({
  facultyId: "TEST_FAC_002",
  departmentName: "Lab",
  itemType: "equipment",
  description: "Oscilloscope",
  quantity: 1,
  issueDate: new Date(),
  status: "Issued",
  issueReferenceNumber: "LAB-TEST-001",
  issuedBy: "Dr. Smith"
})

// Now login and submit clearance
// Expected: ❌ REJECTED, BLOCKED at Phase 1, 1 item to return
```

### Test Auto-Refresh Magic

```javascript
// With TEST_FAC_002's browser open on status page:

// 1. Faculty sees: ❌ 1 item to return (Lab - Oscilloscope)
// 2. In MongoDB console, mark as returned:
db.issues.updateOne(
  { facultyId: "TEST_FAC_002", issueReferenceNumber: "LAB-TEST-001" },
  { $set: { status: "Cleared" } }
)

// 3. Wait 5 seconds - status page auto-updates
// 4. Faculty now sees: ✅ APPROVED
// 5. NO page refresh was needed!
```

---

## JWT Token Login

### Ensure you have valid token

```javascript
// After login, token should be in localStorage
// In browser Console (F12):
localStorage.getItem('token')
// Should print: "eyJhbGciOiJIUzI1NiIs..." (long string)

// If empty: Login again
// If invalid: Check server logs for JWT errors
```

---

## Command Reference

| What | Command | Terminal |
|------|---------|----------|
| Start backend | `npm run dev` | Terminal 1 |
| Start frontend | `npm start` | Terminal 2 |
| Check server | `curl http://localhost:5001/api/health` | Terminal 3 |
| View status API | `curl http://localhost:5001/api/issues/summary` | Terminal 3 |
| Check logs | `npm run dev` | Terminal 1 (watch output) |
| Stop any | `Ctrl+C` | Any |

---

## Most Common Issues & Fixes

### Issue: "Failed to load resource: 500 Error"

**Fix**: Check server logs in Terminal 1
```bash
# Look for error message
# Common: "Cannot find collection 'issues'"
# Solution: Create test data first
```

### Issue: "No token found"

**Fix**: Login again
```bash
# In browser Console:
localStorage.clear()
# Then login again in UI
```

### Issue: Status says "Not Submitted"

**Fix**: Faculty hasn't submitted clearance yet
```bash
# Go to "Submit Clearance" page
# Fill form and submit
```

### Issue: Status doesn't update after 5 seconds

**Fix**: Check browser console for errors
```bash
# F12 → Console tab
# Look for red error messages
# Check "Auto-refresh" toggle is ON
```

### Issue: "Cannot find departmentIssuesRoutes"

**Fix**: Make sure you updated `server.js`
```javascript
// In server.js, around line 78, should have:
const departmentIssuesRoutes = require('./routes/departmentIssuesRoutes');
app.use('/api/issues', departmentIssuesRoutes);
```

---

## Expected Behavior Demo

### Scenario A: Zero Item Faculty

```
Terminal 1:
$ npm run dev
✅ Server running on port 5001

Browser:
1. Login with TEST_FAC_001 (no items)
2. Go to Submit Clearance
3. Fill form → Click Submit
4. INSTANT: ✅ CLEARANCE APPROVED
   Phase Progress: 4/4
   No items to return
   Ready for certificate
```

### Scenario B: Blocked Faculty

```
Browser:
1. Login with TEST_FAC_002 (has Lab oscilloscope)
2. Go to Submit Clearance
3. Fill form → Click Submit
4. INSTANT: ❌ CLEARANCE IN PROGRESS
   BLOCKED at Phase 1
   Lab: ❌ 1 item to return
   
   Lab [1]:
   ├─ Oscilloscope
   ├─ Type: equipment
   └─ Qty: 1
```

### Scenario C: Auto-Refresh Magic

```
Browser (still on status page):
- Shows: ❌ BLOCKED, 1 item in Lab

MongoDB Console (new tab):
- Run update to mark item as Cleared

Browser (after 5 seconds):
- AUTO-UPDATES to: ✅ APPROVED
- NO REFRESH BUTTON CLICKED
- Timeline: < 5 seconds
```

---

## Files to Check

**If Backend Issues:**
- [ ] `backend/server.js` - routes registered?
- [ ] `backend/services/autoClearanceService.js` - service exists?
- [ ] `backend/routes/departmentIssuesRoutes.js` - endpoints defined?
- [ ] `backend/.env` - database connection string correct?

**If Frontend Issues:**
- [ ] `frontend/src/components/Faculty/ClearanceStatusModern.js` - component exists?
- [ ] `frontend/src/components/Faculty/ClearanceStatusModern.css` - styles exist?
- [ ] `frontend/src/App.js` - route added?
- [ ] `frontend/.env` - API URL correct?

**If Database Issues:**
- [ ] MongoDB running?
- [ ] Connection string in `.env` correct?
- [ ] Database `faculty_db` or similar exists?

---

## Success Timeline

```
T+0:00   Start `npm run dev` in backend terminal
↓
T+0:05   "Server running on port 5001" ✅

T+0:10   Start `npm start` in frontend terminal
↓
T+0:30   "Compiled successfully" ✅

T+0:45   Navigate to http://localhost:3000 ✅

T+1:00   Login with faculty account ✅

T+1:30   Submit clearance request ✅

T+1:35   See instant result (no loading) ✅

T+2:00   Test passed! 🎉
```

---

## Advanced Debugging

### See actual API response

```bash
# Terminal 3
curl -X GET http://localhost:5001/api/issues/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Will show exact JSON response
# Check if phaseProgress, currentPhase, overallStatus are present
```

### Monitor database queries

```javascript
// In MongoDB shell
db.setProfilingLevel(1)  // Log all queries
// Then resubmit clearance
db.system.profile.find().pretty()  // See queries
```

### Check auto-clearance service directly

```javascript
// In Node REPL
const service = require('./backend/services/autoClearanceService');
service.checkFacultyClearance('TEST_FAC_002').then(r => {
  console.log(JSON.stringify(r, null, 2));
});
```

---

## What's Happening Under the Hood

1. Faculty submits clearance form
2. Backend receives with JWT token
3. Extracts `facultyId` from token
4. Calls `autoClearanceService.checkFacultyClearance()`
5. Service queries MongoDB:
   ```
   For each Phase (1→4):
     For each Department:
       Query: Issue.find({facultyId, departmentName, status: pending})
       If found: REJECT department
       If not: APPROVE department
   ```
6. Returns result (< 100ms)
7. Frontend shows status
8. Auto-refresh fetches `/api/issues/summary` every 5 seconds
9. If anything changed, status updates

**No approvals. No waiting. All automated.**

---

## Final Checklist

Before declaring "working":

- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] Can login
- [ ] Can see dashboard
- [ ] Can navigate to Submit Clearance
- [ ] TEST_FAC_001 approved instantly (< 1s)
- [ ] TEST_FAC_002 blocked instantly (< 1s)
- [ ] Status shows phase breakdown
- [ ] Status shows items to return
- [ ] Auto-refresh toggles work
- [ ] Manual refresh updates status
- [ ] No console errors (F12)

**All yes? You're done! System is working.** 🚀

---

## Next: Full Testing

Once Quick Start works, see `AUTOMATED_CLEARANCE_TESTING_GUIDE.md` for:
- 5 complete scenarios
- Edge cases
- Performance verification
- Production readiness

---

## Need Help?

1. **Quick check**: Does `curl http://localhost:5001/api/health` return `{"status":"ok"}`?
2. **Token check**: Does `localStorage.getItem('token')` return something in console?
3. **Data check**: Does `db.issues.count()` show test data?
4. **Logs check**: What error appears in `npm run dev` output?

**If stuck**: Check server logs first. 99% of issues show there.

---

**You're all set! Test it now.** ⚡
