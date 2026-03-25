# User Commands & Actions Reference

## Quick Command Guide

### Main Navigation Commands

| Command | Location | Action | Who Can Use |
|---------|----------|--------|------------|
| **Add Item** | Header "Add Item" button | Report a lost/found item | Logged-in users |
| **My Items** | Header "My Items" link | View and manage your items | Logged-in users |
| **Lost & Found Items** | Header "Lost & Found Items" | Browse all items | Everyone |
| **Home** | Header "Home" | Return to homepage | Everyone |
| **About Us** | Header "About Us" | Learn about the platform | Everyone |
| **Contact** | Header "Contact" | Get support | Everyone |

---

## Item Management Commands

### On Item Detail Page (When Viewing an Item)

#### Public Actions (Available to Everyone)
```
┌─────────────────────────────────┐
│  ITEM DETAIL PAGE COMMANDS       │
├─────────────────────────────────┤
│ • "Found This!"                 │
│   (For Lost Items)              │
│   → Claim a lost item you found │
│                                 │
│ • "This is Mine!"               │
│   (For Found Items)             │
│   → Claim a found item that's   │
│     yours                       │
│                                 │
│ • "Recovered"                   │
│   (Disabled when recovered)     │
│   → Shows item has been claimed │
└─────────────────────────────────┘
```

#### Owner-Only Actions (Only if You Own the Item)
```
┌──────────────────────────────────┐
│  OWNER-ONLY COMMANDS             │
├──────────────────────────────────┤
│ 📝 Edit Item                     │
│    → Update title, description   │
│    → Change category, location   │
│    → Add/remove images           │
│    → Modify any item details     │
│                                  │
│ 🗑️  Delete Item                  │
│    → Permanently remove item     │
│    → Cannot be undone            │
│    → Redirects to My Items       │
└──────────────────────────────────┘
```

---

### On My Items Page (Your Dashboard)

```
┌──────────────────────────────────┐
│  MY ITEMS PAGE COMMANDS          │
├──────────────────────────────────┤
│ • View All Your Items            │
│   → See table of all reported    │
│     items                        │
│                                  │
│ • Update Button (per item)       │
│   → Edit item details            │
│   → Change images                │
│   → Modify information           │
│                                  │
│ • Delete Button (per item)       │
│   → Remove item permanently      │
│   → Requires confirmation        │
│                                  │
│ • Report an Item Link            │
│   → Navigate to Add Item form    │
│   → When no items reported       │
└──────────────────────────────────┘
```

---

### On Add Item Form

```
┌──────────────────────────────────┐
│  ADD ITEM COMMANDS               │
├──────────────────────────────────┤
│ Fill Required Fields:            │
│ • Item Type (dropdown)           │
│ • Title (text)                   │
│ • Description (textarea)         │
│ • Category (dropdown)            │
│ • Location (text)                │
│ • Date Lost (date picker)        │
│                                  │
│ Add Images:                      │
│ • Paste image URL                │
│ • Click "Add Image"              │
│ • Preview appears                │
│ • Remove with × button           │
│                                  │
│ Submit:                          │
│ • Click "Report Item"            │
│ → Item saved to database         │
└──────────────────────────────────┘
```

---

## Recovery/Claim Workflow

### Step 1: Find an Item You Want to Claim
**From:** Lost & Found Items page
**Action:** Click on the item card

### Step 2: Review Item Details
**View:**
- Images
- Title and description
- Location and date
- Owner contact info

### Step 3: Claim the Item
**Click:** "Found This!" or "This is Mine!" button

### Step 4: Enter Recovery Details
**Provide:**
- Where you recovered/met (location)
- When it happened (date)
- Your information (auto-filled)

### Step 5: Submit
**Result:** 
- Item marked as "Recovered"
- Both parties have recovery details
- Item no longer available for claims

---

## Access Control Matrix

| Feature | Owner | Other Users | Admin |
|---------|-------|-------------|-------|
| View item | ✓ | ✓ | ✓ |
| Edit item | ✓ | ✗ | ✓ |
| Delete item | ✓ | ✗ | ✓ |
| Claim item | ✓ | ✓ | ✓ |
| View My Items | ✓ | ✓ (own only) | ✓ (all) |
| Verify item | ✗ | ✗ | ✓ |
| Moderate | ✗ | ✗ | ✓ |

---

## Mobile vs Desktop Experience

### Desktop
- Full table view on "My Items"
- Multiple action buttons visible
- All fields easily accessible

### Mobile
- Card/grid layout on "My Items"
- Stacked action buttons
- Touch-optimized buttons
- Collapsible sections

---

## Command Shortcuts

### If You Own an Item:
1. **Quick Edit**: My Items → Update button (per item)
2. **Quick Delete**: My Items → Delete button (per item)
3. **View & Edit**: Item Detail page → Edit Item button
4. **View & Delete**: Item Detail page → Delete Item button

### If You Found/Lost an Item:
1. **Quick Claim**: Item Detail page → "Found This!" or "This is Mine!"
2. **Track Status**: My Items → See all your recovery activities
3. **View Details**: Click item card to see full details

---

## Error Handling

### Common Issues & Solutions

**"Edit" button not showing:**
- You must be logged in as the item owner
- Check your email matches the reporting email

**"Delete" button greyed out:**
- Cannot delete recovered items (through detail page)
- Use My Items page to delete any item

**Images not loading:**
- URL must be publicly accessible
- Check URL starts with http:// or https://
- Try a different image URL

**Can't claim an item:**
- You must be logged in
- Item must not be already recovered
- Use the correct claim button for your situation

---

## Next Steps

1. **Add Your First Item**: Click "Add Item" in the header
2. **Browse Items**: Check "Lost & Found Items"
3. **Claim an Item**: Find what you lost, click claim button
4. **Manage Items**: Visit "My Items" to edit or delete

Need help? Check the full **ITEM_MANAGEMENT_GUIDE.md** for detailed instructions!
