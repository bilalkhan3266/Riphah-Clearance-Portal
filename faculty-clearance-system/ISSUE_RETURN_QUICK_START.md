# Issue & Return System - Quick Start Guide

## What's New?

The system now has **automatic item tracking** for clearance:
- Department staff issues items to faculty
- Faculty must return items to get clearance
- Returning all items → Automatic approval

---

## For Department Staff

### Issuing an Item

1. Go to your department's **Issue Tab** (e.g., Lab → Issue Files)
2. Fill in the form:
   - **Employee ID**: Enter faculty ID (e.g., E12345)
   - **Item Type**: Select from dropdown (Equipment, Documents, etc)
   - **Description**: What's being issued (e.g., "Laptop")
   - **Quantity**: How many (default: 1)
   - **Due Date**: When it should be returned (optional)
3. Click **Issue Item**
4. Success message confirms issue created
5. Item now shows in Issues table

### Accepting a Return

1. Go to your department's **Return Tab** (e.g., Lab → Return Files)
2. Fill in the form:
   - **Employee ID**: Enter faculty ID (e.g., E12345)
   - **Select Issue**: Dropdown auto-filters by employee ID
   - **Quantity Returned**: How much is being returned (default: 1)
   - **Condition**: Good, Fair, Damaged, or Lost
3. Click **Accept Return**
4. Success message shows
5. Item status updates, clearance auto-checks

---

## For Faculty

### Check Before Submitting Clearance

1. Go to **Clearance Dashboard** → **My Clearance**
2. System automatically shows:
   - ✅ Items already returned
   - ❌ Items still needed
   - Department where each is pending

3. Example:
   ```
   Lab: Return Laptop
   Library: Return 3 Books
   Finance: All items returned ✓
   ```

### Submit Clearance When Ready

1. Return ALL issued items to departments
2. Go to **Submit Clearance**
3. System checks automatically
4. If all returned → Green checkmark, can submit
5. If pending → Red X, must return items first
6. Submit → System auto-verifies → Certificate generated

---

## Real-World Example Workflow

### Day 1: Checkout
```
Faculty E123 goes to Library
Librarian issues: 5 textbooks (due in 7 days)
  - Description: "COMP 301 Textbooks"
  - Quantity: 5
  - Condition: Good
System: Issue created, added to E123's pending list
```

### Day 5: Partial Return
```
Faculty E123 returns 3 books (kept 2)
Librarian accepts return:
  - Quantity Returned: 3
  - Condition: Good
System: Updates issue to "Partially Returned" (2 still pending)
Faculty still can't submit clearance - 2 books outstanding
```

### Day 7: Final Return
```
Faculty E123 returns remaining 2 books
Librarian accepts:
  - Quantity Returned: 2
  - Condition: Good
System: Issue marks as "Cleared" ✓
Faculty checks clearance status: "All Library items returned!"
Faculty can now submit clearance
```

### Day 7: Clearance Submission
```
Faculty E123 submits clearance request
System checks: "Library cleared, all other depts clear"
Result: AUTO-APPROVED ✓
Certificate generated + emailed
Clearance complete!
```

---

## Viewing Records

### Department Staff View

**Issues Tab** - See what was issued:
- Faculty Name, ID, Item, Quantity
- When issued, Due date
- Current status (Issued/Cleared/Partial Return)
- Click to see more details

**Returns Tab** - See what was returned:
- Faculty Name, ID, Item, Quantity Returned
- Condition when received
- When returned
- Return status (Cleared/Partial Return)

**Filters**:
```
Filter by Status: Issued, Cleared, Partial Return
Filter by Faculty: Enter ID to see that faculty's items only
```

### Faculty View

**My Pending Items** - What I need to return:
- Lab: Laptop (1 item, Due: April 30)
- Library: Books (3 items, Due: April 15) ⚠️ OVERDUE
- Finance: All cleared ✓

**Clear Departments** - Phase progress:
- Phase 1: 
  - ✓ Lab cleared
  - ✓ Library cleared  
  - ✗ Pharmacy - 2 items pending
- Phase 2: BLOCKED (waiting for Phase 1)

---

## Common Scenarios

### Scenario 1: Faculty Forgets Item
```
1. Faculty returns only 1 of 2 books
2. System shows: "1 book still pending"
3. Faculty receives reminder email
4. Faculty can't submit clearance until 2nd book returned
```

### Scenario 2: Item Damaged
```
1. Faculty returns book - water damaged
2. Staff marks: Condition = "Damaged"
3. Item is still marked as returned (cleared)
4. Record shows condition for admin review
```

### Scenario 3: Faculty Leaves Item Behind
```
1. Library issues laptop on Day 1
2. Faculty leaves dept on Day 50 - item not returned
3. System shows: "1 item overdue 20 days"
4. Faculty cannot clear until item resolved
5. May require admin override or replacement fee
```

---

## Key Features

✅ **Automatic Tracking**
- All issued items tracked automatically
- No manual approval needed for returns

✅ **Clearance Blocking**
- Pending items block clearance submission
- Faculty can see exactly what's needed
- Clear progress indicators

✅ **Department Staff Control**
- Staff can issue items on the spot
- Staff records returns with condition
- Can manage multiple faculty

✅ **Auto-Clearing**
- Returning item → Immediate status update
- System re-checks clearance automatically
- No waiting for approvals

✅ **Phase-Based Progress**
- Can't proceed to Phase 2 until Phase 1 complete
- All departments within phase must clear


---

## Troubleshooting

### Issue appears in dropdown but can't select it
- **Cause**: Issue is for different faculty
- **Fix**: Check employee ID matches - system filters automatically

### "Item already fully returned" error
- **Cause**: Trying to process return for already-cleared issue
- **Fix**: That issue is close! Item is fully cleared. Check for different issue.

### Faculty blocked but says items returned
- **Cause**: Return wasn't recorded in system
- **Fix**: Department staff must process return in Return tab
- **Note**: Returning to faculty physically ≠ recorded in system

### Department shows "Pending" but all items cleared
- **Cause**: System hasn't rechecked clearance yet
- **Fix**: Wait 30 seconds or refresh page - auto-check runs after return

### Can see issues but can't accept return
- **Cause**: Permission issue or issue belongs to different department
- **Fix**: Verify you're in correct department tab

---

## API Quick Reference

For developers testing via API:

```bash
# Issue an item
curl -X POST http://localhost:3001/api/departments/Lab/issue-item \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "E12345",
    "itemType": "Equipment",
    "description": "Laptop",
    "quantity": 1,
    "dueDate": "2024-04-30"
  }'

# Accept a return
curl -X POST http://localhost:3001/api/departments/Lab/accept-return \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "E12345",
    "referenceIssueId": "MONGO_ID_HERE",
    "quantityReturned": 1,
    "condition": "Good"
  }'

# Check pending items before clearance
curl -X GET http://localhost:3001/api/clearance-submission-check \
  -H "Authorization: Bearer TOKEN"

# Get department issues
curl -X GET http://localhost:3001/api/departments/Lab/issues \
  -H "Authorization: Bearer TOKEN"
```

---

## Status Reference

### Issue Status
- **Issued**: Item was given to faculty, complete return expected
- **Pending**: Waiting for faculty to return
- **Partially Returned**: Some items returned, some still outstanding
- **Uncleared**: Faculty hasn't dealt with this item yet
- **Cleared**: Item fully returned ✓

### Return Status
- **Returned**: Faculty returned the item (may be partial)
- **Cleared**: Full return processed and accepted ✓
- **Partial Return**: Only part of issued quantity returned

### Condition
- **Good**: Item returned in good condition ✓
- **Fair**: Minor wear or damage
- **Damaged**: Significant damage - admin may review
- **Lost**: Item not returned - serious issue

### Clearance Status
- **APPROVED**: All items cleared across all phases ✓ → Certificate!
- **REJECTED**: Items still pending - needs returns
- **BLOCKED_AT_PHASE**: Can't move to next phase until current phase complete

---

## Support

If items don't appear in dropdown:
1. Verify employee ID matches exactly (case-sensitive)
2. Verify issue is still pending (not already cleared)
3. Check both department - issue may be in different dept

If clearance status doesn't update:
1. Returns are processed immediately
2. Clearance check runs automatically
3. If still pending, check for other pending items

For bulk operations or special cases, contact admin.

