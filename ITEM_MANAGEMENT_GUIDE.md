# Item Management Guide

## Overview
The Lost & Found application provides comprehensive item management features for users to report, track, and manage lost/found items.

---

## How Item Management Works

### 1. **Adding an Item**
**Where:** "Add Item" button in navigation
**What You Need:**
- Item Type (Lost/Found)
- Title (e.g., "Blue Backpack")
- Description (detailed info)
- Category (Electronics, Documents, Accessories, etc.)
- Location (where it was lost/found)
- Date Lost (when it went missing)
- Images (at least 1 image URL required)

**Process:**
1. Click "Add Item" in the navigation
2. Fill out all form fields
3. Add at least one image by pasting image URLs
4. Click "Report Item" to submit

---

### 2. **Viewing Your Items**
**Where:** "My Items" page (only accessible when logged in)
**Shows:**
- Table of all items you've reported
- Item title, category, location, date
- Quick access to edit/delete each item

**Features:**
- View all your reported items in one place
- See item status at a glance
- Quick actions: Edit or Delete

---

### 3. **Editing an Item**
**Access Points:**
1. From "My Items" page - Click "Update" button on the item row
2. From Item Detail page - Click "Edit Item" button (only if you're the owner)

**Can Edit:**
- Item type, title, description
- Category, location
- Date information
- Images (add new, remove old ones)

**Process:**
1. Navigate to the item you want to edit
2. Click "Edit Item" or "Update"
3. Make changes to any field
4. Update images as needed
5. Click "Update Item" to save

---

### 4. **Deleting an Item**
**Access Points:**
1. From "My Items" page - Click "Delete" button on the item row
2. From Item Detail page - Click "Delete Item" button (only if you're the owner)

**Process:**
1. Click Delete button
2. Confirm deletion in the popup
3. Item is permanently removed from the database

**Note:** This action cannot be undone!

---

### 5. **Claiming/Recovering an Item**
**Item Detail Page Actions:**

#### For Lost Items:
- Button: "Found This!" - Use this if you found the lost item

#### For Found Items:
- Button: "This is Mine!" - Use this if you found your lost item in the "Found Items" list

**Recovery Process:**
1. Click the appropriate button
2. Enter:
   - Recovered Location (where you met/exchanged)
   - Recovered Date (when the exchange happened)
   - Your information (auto-filled)
3. Click "Submit" to mark as recovered

**Result:** Item status changes to "Recovered" and is no longer available for claims

---

## User Permissions

### **Item Owner** - Can:
- Edit their item details anytime
- Delete their item anytime
- Claim found items
- View recovery details

### **Other Users** - Can:
- View all items (public listing)
- Claim lost items if they found them
- Claim found items if they lost them

### **Admin** - Can:
- Verify items as legitimate
- Manage all items
- Moderate the platform

---

## Item Lifecycle

```
1. User Reports Item (Lost/Found)
   ↓
2. Item is Listed (Status: Pending Verification)
   ↓
3. Admin Verifies Item (Status: Verified)
   ↓
4. Other Users Can Claim (Found This / This is Mine)
   ↓
5. Item Marked as Recovered (Status: Recovered)
   ↓
6. Item Owner Can Delete if Desired
```

---

## Key Features

### **Multiple Images**
- Add as many images as needed
- See preview grid before submitting
- Replace or remove images anytime

### **Search & Filter**
- Find items by title, location, or category
- Filter by item type (Lost/Found/Recovered)
- View by category

### **Verification System**
- New items show "Pending Verification" status
- Security office reviews and verifies
- Verified items get a green badge

### **Recovery Tracking**
- Record where and when items were recovered
- Track who claimed items
- View recovery details

---

## Tips for Better Item Management

### When Adding an Item:
- Use clear, descriptive titles
- Include specific details in description
- Add clear, well-lit photos
- Be accurate with dates and locations

### When Searching:
- Search by exact keywords (e.g., "black laptop")
- Use location filters to narrow results
- Check multiple times - new items are added regularly

### When Claiming Items:
- Provide accurate recovery location
- Record the correct date
- Be honest about found/lost status

---

## Troubleshooting

### "Edit" button not showing?
- You can only edit items you own
- Make sure you're logged in with the correct account
- The owner is determined by the email used when reporting

### Can't delete an item?
- Only the item owner can delete
- Check you're logged in with the correct account

### Images not showing?
- Image URLs must be valid and publicly accessible
- Check URL formatting (should start with http:// or https://)
- Try using a different image URL

### Item not appearing in search?
- New items show as "Pending" until verified by admin
- Wait for admin verification to appear in main listings
- Use "My Items" to see all your items (pending or verified)

---

## Contact & Support
For issues with item management, contact the security office at support@zetech.ac.ke or +254 (0) 710 120 120
