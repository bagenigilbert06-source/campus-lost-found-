# Admin Dashboard - Quick Test Instructions

## For Testing Purposes

### Step 1: Create Admin Account
1. Go to Register page
2. Use one of these admin emails:
   - `admin@zetech.ac.ke`
   - `security@zetech.ac.ke`
   - `lost-and-found@zetech.ac.ke`
3. Create a password and complete registration
4. You'll be automatically given admin privileges

### Step 2: Access Admin Dashboard
After signing in with an admin email, you have 3 ways to access:

**Option A - Via Navbar:**
1. Look at top right corner of screen
2. Click your profile picture
3. Click "Admin Dashboard" in the dropdown

**Option B - Direct URL:**
- Go to: `http://localhost:3173/admin` (if dev server is on 3173)
- Or: `/admin` (relative path)

**Option C - Mobile Menu:**
1. Tap profile icon
2. Scroll down and find "Admin Dashboard"
3. Tap to open

### Step 3: View Dashboard Features

The dashboard shows:
- **Total Items**: All reported lost/found items
- **Pending Items**: Items waiting for approval
- **Verified Items**: Approved items
- **Recovered Items**: Successfully returned items
- **Total Users**: How many people reported items

### Step 4: Test Item Verification

1. You'll see a list of "Pending Items"
2. For each item:
   - **Check Button** - Mark item as verified
   - **X Button** - Mark item as rejected
   - **Eye Icon** - View full details

3. Click "Verify" on a pending item
4. You should see:
   - Success notification
   - Item moves out of pending list
   - Dashboard stats update

### Step 5: Verify Access Control

Try this with a non-admin account:
1. Sign in with a regular student email (not in adminEmails list)
2. The "Admin Dashboard" option should NOT appear
3. Accessing `/admin` should redirect you away
4. You'll see: "Access denied: Admin access required"

---

## Testing Checklist

- [ ] Can sign in with admin email
- [ ] Admin Dashboard link appears in navbar dropdown
- [ ] Admin Dashboard link appears in mobile menu
- [ ] Can view dashboard statistics
- [ ] Can view pending items list
- [ ] Can click Verify button
- [ ] Verification works and updates stats
- [ ] Can click Reject button
- [ ] Rejection works and updates stats
- [ ] Non-admin cannot access admin page
- [ ] Direct URL access works (`/admin`)
- [ ] Dashboard displays accurate stats

---

## Common Test Scenarios

### Scenario 1: Verify Multiple Items
1. Add 3-4 test items as a regular user
2. Sign in as admin
3. Verify 2-3 of them
4. Check dashboard shows correct counts

### Scenario 2: Reject Duplicate Report
1. Add same item twice
2. Verify the first one
3. Reject the second (duplicate)
4. Check that only one shows as verified

### Scenario 3: Admin Permission Check
1. Create regular user account
2. Try to access `/admin` - should fail
3. Sign in as admin - should succeed

### Scenario 4: Dashboard Real-time Updates
1. Open admin dashboard
2. Have another user report a new item
3. Verify the stats update without manual refresh

---

## Sample Test Data

Use these for testing:

**Test Item 1 (Lost):**
- Title: Lost iPhone 13 Black
- Location: Library
- Category: Electronics
- Description: Black iPhone 13, cracked screen, last seen Tuesday morning
- Date: 2026-03-20

**Test Item 2 (Found):**
- Title: Found Blue Backpack
- Location: Cafeteria
- Category: Bags & Luggage
- Description: Blue Nike backpack with student ID inside
- Date: 2026-03-25

**Test Item 3 (Recovered):**
- Title: Lost Key Set
- Location: Main Gate
- Category: Keys
- Description: Set of 3 keys with blue keychain
- Date: 2026-03-23

---

## Debug Tips

### Check if Admin Email is Configured
Open browser console and check your auth token:
```javascript
console.log(localStorage.getItem('firebaseToken'))
```

### Check Admin Status
In any React component, you can log:
```javascript
console.log("[v0] isAdmin:", isAdmin)
console.log("[v0] user:", user)
```

### Check API Responses
Open Network tab in DevTools:
1. Look for API calls to `/api/items`
2. Check response data
3. Verify verificationStatus field changes

### Backend Verification
Check MongoDB to see if verification worked:
1. Open MongoDB Atlas
2. Find the Items collection
3. Look for `verificationStatus` field changes
4. Check `verifiedBy` field has admin email

---

## Resetting Test Data

If you want to start fresh:

1. **Clear All Items** (via MongoDB):
   ```javascript
   db.items.deleteMany({})
   ```

2. **Reset Verification Status** (via MongoDB):
   ```javascript
   db.items.updateMany({}, {$set: {verificationStatus: "pending"}})
   ```

3. **Clear All Users** (if needed):
   ```javascript
   db.users.deleteMany({})
   ```

---

## Expected Console Logs

When admin functions work correctly, you should see:

```
[v0] Auth state changed: admin@zetech.ac.ke
[v0] User role determined: admin
[v0] Delete response: {success: true, deletedCount: 1}
[v0] Item loader response: {_id: "...", title: "..."}
```

---

## Next Steps

After testing:
1. Verify all features work as expected
2. Test with multiple admin accounts
3. Test with regular user accounts
4. Check permission boundaries
5. Verify error handling

---

**Questions?** Check `ADMIN_ACCESS_GUIDE.md` for detailed documentation.
