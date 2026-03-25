# Admin Dashboard - Quick Start Guide

## TL;DR - Get Started in 2 Minutes

### For Existing Admins
1. Sign in with your admin email
2. Click your profile → Admin Dashboard
3. Verify pending items

### To Add New Admin
Edit `src/config/schoolConfig.js`:
```javascript
adminEmails: [
  'admin@zetech.ac.ke',
  'security@zetech.ac.ke',
  'lost-and-found@zetech.ac.ke',
  'YOUR_EMAIL_HERE'  // ← Add new admin
]
```

---

## Admin Dashboard Overview

### Key Stats at a Glance
```
┌─────────────────────────────────────┐
│ Total Items: 45                     │
├─────────────────────────────────────┤
│ Pending: 8  │  Verified: 32        │
│ Recovered: 5                        │
└─────────────────────────────────────┘
```

### Main Tasks
| Task | Location | What It Does |
|------|----------|--------------|
| Verify Item | Pending Items List | Approves legitimate report |
| Reject Item | Pending Items List | Marks as false/duplicate |
| View Details | Click Item | See full information |
| Go to Dashboard | Navbar → Profile | Access admin panel |

---

## Where Items Come From

Users can report items through:
- **Add Item** button (navbar) → Create new report
- **Found This** button (on Lost items) → Claim found item
- **This is Mine** button (on Found items) → Claim as owner

All new reports go to "Pending" and wait for admin verification.

---

## Item Lifecycle

```
1. USER REPORTS ITEM
   (Click "Add Item" → Fill form → Submit)
        ↓
2. STATUS: PENDING
   (Waiting for admin to verify)
        ↓
3. ADMIN VERIFIES
   (Check details → Click "Verify" button)
        ↓
4. STATUS: VERIFIED
   (Now visible to all users, can be claimed)
        ↓
5. USER CLAIMS ITEM
   (Click "Found This" or "This is Mine")
        ↓
6. STATUS: RECOVERED
   (Item successfully returned, case closed)
```

---

## Quick Actions

### Verify an Item
```
1. Go to Admin Dashboard
2. Find item in "Pending Items"
3. Click ✓ (Verify button)
4. See success notification
5. Item moves to "Verified Items"
```

### Reject an Item
```
1. Go to Admin Dashboard
2. Find item in "Pending Items"
3. Click ✗ (Reject button)
4. Item marked as rejected
5. Hidden from public view
```

### View Item Details
```
1. Go to Admin Dashboard
2. Click item title or 👁 icon
3. See full information
4. View all images
5. See reporter contact info
```

---

## Access Levels

### What Admins Can See
✓ All reported items (pending and verified)
✓ Item images and details
✓ Reporter name and email
✓ Verification status and history
✓ Dashboard statistics
✓ Recovery tracking

### What Admins Cannot Do
✗ Cannot delete items (only reject)
✗ Cannot edit item details
✗ Cannot claim items
✗ Cannot mark items as recovered
✗ Cannot access user passwords
✗ Cannot create fake reports

---

## Current Admin Emails

These accounts have admin access:
- admin@zetech.ac.ke
- security@zetech.ac.ke
- lost-and-found@zetech.ac.ke

**To add more admins:** Edit `schoolConfig.js` and add email to `adminEmails` array

---

## Dashboard Sections

### Overview Tab
- Statistics cards
- Charts and graphs
- Quick metrics
- Recent activity

### Pending Items Tab
- Items waiting for verification
- Quick preview
- Action buttons
- Filter/sort options

### Verified Items Tab
- Approved items
- Visibility status
- Recovery tracking
- Item history

### User Management (Future)
- User statistics
- Report history per user
- Spam detection
- User activity logs

---

## Common Questions

**Q: I added my email to adminEmails but I'm not admin**
A: Sign out and sign in again. Admin status is determined at login time.

**Q: Can I undo a verification?**
A: Currently no. Verify carefully. Future versions may add undo functionality.

**Q: What happens if I verify a fake report?**
A: The user can still claim it, but they won't find the item. Mark as rejected if unsure.

**Q: How do users report items?**
A: Through "Add Item" button when signed in. They choose Lost/Found and fill details.

**Q: Can I see who claimed an item?**
A: The recovered items list shows recovery status, but not specific claimant (for privacy).

---

## Statistics Explained

**Total Items**
- All items ever reported
- Includes pending, verified, and recovered

**Pending Verification**
- Items reported but not yet checked by admin
- Need your approval before going public

**Verified Items**
- Items approved as legitimate
- Now searchable by other users
- Can be claimed/recovered

**Recovered Items**
- Successfully returned to owners
- Case closed
- Used for success metrics

**Total Users**
- Unique people who reported items
- Helps track engagement
- Not all may be active

---

## Verification Tips

### ✓ DO VERIFY:
- Items with detailed descriptions
- Items with date and location
- Items with images (when available)
- Reports from regular users
- Items matching common loss patterns

### ✗ DON'T VERIFY:
- Vague descriptions ("lost something")
- Missing location information
- Impossible dates (future, too old)
- Multiple reports from same user
- Suspicious/test reports

---

## Navigation Paths

**From Navbar:**
1. Click Profile Picture → Admin Dashboard

**From URL:**
- Direct: `/admin`
- Full: `http://localhost:3173/admin`

**From Mobile:**
1. Tap Profile Icon → Find Admin Dashboard → Tap

---

## Troubleshooting

**Can't see Admin Dashboard button?**
- Sign out and sign in
- Check email is in adminEmails list
- Clear browser cache
- Try direct URL: `/admin`

**Getting "Access Denied"?**
- Verify you're signed in
- Confirm email is admin email
- Check schoolConfig.js has your email
- Try signing out/in again

**Dashboard won't load?**
- Check backend is running
- Verify MongoDB connection
- Try refreshing page
- Check browser console for errors

**Verification button not working?**
- Ensure item hasn't been rejected
- Check network connection
- Verify you're still signed in
- Check browser console for errors

---

## Related Documentation

- **ADMIN_ACCESS_GUIDE.md** - Detailed admin features
- **ADMIN_TEST_INSTRUCTIONS.md** - How to test admin features
- **ITEM_MANAGEMENT_GUIDE.md** - How items are managed
- **USER_COMMANDS_REFERENCE.md** - All user commands

---

## Key File Locations

- Admin Route Protection: `src/router/AdminRoute.jsx`
- Admin Dashboard: `src/pages/Admin/AdminDashboard.jsx`
- Admin Config: `src/config/schoolConfig.js`
- Navbar (with admin link): `src/pages/common/Navbar.jsx`

---

**Need Help?** Check the detailed guides above or contact support.

**Last Updated:** March 2026
