# Admin Dashboard Access Guide

## Overview
The Admin Dashboard is a powerful tool for managing all Lost & Found items on campus, verifying items, and monitoring the system. Only authorized admin users can access this feature.

---

## How to Access the Admin Dashboard

### Method 1: Direct URL
Navigate directly to: `http://localhost:3001/admin` or `https://yourapp.com/admin`

### Method 2: Through Navbar Menu
1. Sign in with an admin account
2. Click your profile picture in the top right corner
3. An "Admin Dashboard" option will appear in the dropdown menu (only for admins)
4. Click it to access the dashboard

### Method 3: Mobile Menu
1. Sign in with an admin account
2. Tap the profile icon on mobile
3. Scroll to find "Admin Dashboard" option
4. Tap to access

---

## Admin User Setup

### Current Admin Emails
The following emails have admin access by default:
- `admin@zetech.ac.ke`
- `security@zetech.ac.ke`
- `lost-and-found@zetech.ac.ke`

### Adding New Admin Users
To add more admin users, edit the `schoolConfig.js` file:

```javascript
// src/config/schoolConfig.js
adminEmails: [
  'admin@zetech.ac.ke',
  'security@zetech.ac.ke',
  'lost-and-found@zetech.ac.ke',
  'newadmin@zetech.ac.ke'  // Add new admin email here
]
```

After adding an email:
1. The user must register/sign in with that email
2. Their account will automatically be granted admin privileges
3. The "Admin Dashboard" option will appear in their navbar

---

## Admin Dashboard Features

### 1. Dashboard Overview
- **Total Items Count** - Shows total number of lost/found items reported
- **Pending Verification** - Items waiting for security team approval
- **Verified Items** - Items that have been verified as genuine
- **Recovered Items** - Items successfully returned to owners
- **Total Users** - Number of unique users who reported items

### 2. Item Verification
The dashboard displays pending items that need verification. For each pending item, you can:

**Verify Item:**
- Click the checkmark icon or "Verify" button
- Item becomes marked as verified in the system
- Adds your email and verification timestamp
- Increases the "Verified Items" count

**Reject Item:**
- Click the X icon or "Reject" button
- Item is marked as rejected
- Useful for false reports or duplicate entries
- Keeps the rejection reason in the database

### 3. Item Details in Admin View
For each pending item, you can see:
- Item title and description
- Category and location where lost/found
- Date the item was reported
- Reporter name and email
- Item images (if any)
- Current verification status
- Verification history

### 4. Quick Stats
The dashboard provides real-time statistics:
- Items by category
- Items by location
- Verified vs pending items
- Recovery rate
- Active users

---

## What Can Admins Do?

### Item Management
- View all items reported on campus
- Verify legitimate lost & found reports
- Reject false or duplicate reports
- Monitor item recovery status
- Track verification history

### User Oversight
- See who reported items
- Contact information for reporters
- Monitor system activity
- Prevent abuse/spam reports

### System Monitoring
- Check dashboard statistics
- Track recovered item trends
- Monitor recovery success rate
- Identify common loss areas

---

## What Admins Cannot Do

- **Cannot edit user profiles** - Users manage their own accounts
- **Cannot force recovery** - Only item owners can mark items as recovered
- **Cannot delete items permanently** - Items are marked rejected, not deleted
- **Cannot create fake items** - Items must be reported through the proper form
- **Cannot access personal data** - Only sees necessary information for verification

---

## Verification Process Best Practices

### When to VERIFY an item:
✓ Item description is detailed and realistic
✓ Images are provided (if applicable)
✓ Location and date make sense
✓ Reporter contact info is valid
✓ No obvious signs of fake or duplicate report

### When to REJECT an item:
✗ Vague or suspicious description
✗ No location information provided
✗ Invalid dates (future dates, far past dates)
✗ Obviously duplicate report
✗ Missing reporter contact information
✗ Suspicious multiple reports from same user

---

## Troubleshooting Admin Access

### Problem: Admin Dashboard Link Not Showing
**Solution:**
1. Verify your email is in the `adminEmails` list in `schoolConfig.js`
2. Sign out and sign back in to refresh permissions
3. Clear browser cache and refresh the page
4. Try the direct URL: `/admin`

### Problem: "Access Denied" Error
**Solution:**
1. Make sure you're signed in
2. Verify you're using the correct admin email
3. Check that the email is in the `schoolConfig.js` admin list
4. Contact a system administrator to add your email

### Problem: Dashboard Shows No Items
**Solution:**
1. No items may have been reported yet
2. All items might already be verified
3. Check the filter/search settings
4. Refresh the page
5. Check backend connection

---

## Security Notes

1. **Keep Admin Credentials Safe**
   - Use strong passwords
   - Don't share your login email
   - Log out when not in use

2. **Verification Integrity**
   - Only verify items you're confident about
   - Your email is logged with each verification
   - Be objective in your decisions

3. **Data Privacy**
   - Only collect information needed for verification
   - Don't share reporter details publicly
   - Respect user privacy

---

## Admin Role Hierarchy

Currently, all admins have equal permissions. If you need role-based access control:
- Super Admin (full control)
- Moderator (can verify items)
- Viewer (read-only access)

Contact your development team to implement this.

---

## Support & Questions

If you have issues accessing the admin dashboard:
1. Check this guide first
2. Verify your email is in the admin list
3. Try signing out and back in
4. Contact: `support@zetech.ac.ke`

---

## Database Schema (Admin Reference)

Items stored in MongoDB with these relevant fields:
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  location: String,
  itemType: 'Lost' | 'Found' | 'Recovered',
  images: [String],
  verificationStatus: 'pending' | 'verified' | 'rejected',
  verifiedBy: String (admin email),
  verifiedAt: Date,
  email: String (reporter email),
  name: String (reporter name),
  createdAt: Date,
  updatedAt: Date
}
```

---

Last Updated: March 2026
