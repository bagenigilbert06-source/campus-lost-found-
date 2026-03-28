# V0 DEV PROMPTS - COMPLETE STUDENT PAGE SYSTEM

## 🎯 HOW TO USE THIS GUIDE

Copy each prompt below and paste into v0.dev (or Claude with file context). Each component is designed to integrate seamlessly with your existing codebase.

**Preconditions:**
- Backend running at `http://localhost:3001/api/`
- Firebase initialized in `/src/firebase/firebase.init.js`
- AuthContext available at `/src/context/Authcontext/AuthContext`
- TailwindCSS + DaisyUI configured

---

## 1️⃣ CLAIM ITEM MODAL COMPONENT

**File:** `src/components/ClaimItemModal.jsx`

**V0 Prompt:**
```
Create a React modal component called ClaimItemModal for claiming a found item in a campus lost & found app.

Usage:
import ClaimItemModal from '../components/ClaimItemModal';

<ClaimItemModal 
  isOpen={showClaimModal}
  onClose={() => setShowClaimModal(false)}
  itemId={item._id}
  itemTitle={item.title}
  onSuccess={() => {
    toast.success('Claim submitted!');
    setShowClaimModal(false);
  }}
/>

Requirements:
1. Modal should open when isOpen prop is true
2. Display item title at top
3. Include form with these fields:
   - Full Name (required)
   - Student ID (required)
   - Email (required)
   - Phone (required)
   - Proof of Ownership Description (textarea, required)
     - Example: "It has a blue sticker on the back"
   - Additional Notes (textarea, optional)
4. Form validation before submission
5. POST to http://localhost:3001/api/claims with:
   {
     itemId: string,
     claimantEmail: string,
     claimantName: string,
     claimantPhone: string,
     studentId: string,
     proofOfOwnership: string,
     notes: string
   }
6. Show loading state during submission
7. Use react-hot-toast for success/error messages
8. Close modal on success
9. Style with TailwindCSS + DaisyUI
10. Include close button (X) and cancel button
11. Make responsive for mobile

Icons needed:
- FaTimes for close
- FaCheck for submit
- FaSpinner for loading

Colors:
- Primary: teal (teal-600, teal-700)
- Error: red-500
- Border: gray-300
```

---

## 2️⃣ POST LOST ITEM PAGE

**File:** `src/pages/PostLostItem/PostLostItem.jsx`

**V0 Prompt:**
```
Create a full-page React component called PostLostItem for students to report a lost item.

Route: /post-lost-item

Context needed:
- AuthContext for user info (name, email)
- useNavigate for redirection

Features:
1. Header section with title "Report a Lost Item"
2. Multi-step form:
   
   STEP 1: Basic Information
   - Item Title: text input (required)
   - Item Category: dropdown (required)
     Options: Electronics, IDs, Keys, Wallets, Phones, Laptops, Bags, Clothing, Books, Other
   - Item Type: radio buttons (required)
     Options: "Student ID", "Passport", "Phone", "Laptop", "Wallet", "Keys", "Other"
   
   STEP 2: Description & Location
   - Description: textarea (required, min 20 chars)
   - Location Lost: dropdown (required)
     Options: Gate 1, Gate 2, Main Building, Library, Cafeteria, Sports Complex, Hostel, Parking, Security Office, Other
   - Date Lost: date picker (required)
   - Distinguishing Features: textarea (optional)
     Help text: "Any unique marks, colors, or identifying features"
   
   STEP 3: Photo Upload (optional but recommended)
   - Upload up to 3 photos
   - Show file size limit: 5MB each
   - Preview uploaded images with delete option
   
   STEP 4: Review & Submit
   - Show preview of all information
   - Display warning that admin will verify before posting
   - Agree to terms checkbox (required)

3. Form behavior:
   - Save form progress to localStorage
   - Auto-fill student name and email from AuthContext
   - Can go back between steps
   - Submit button only on final step
   
4. API Call: POST to http://localhost:3001/api/items
   Body should include:
   {
     title: string,
     category: string,
     itemType: string,
     description: string,
     location: string,
     dateLost: date,
     distinguishingFeatures: string,
     images: array of file objects,
     email: string (from auth),
     name: string (from auth),
     itemType: "lost" (explicitly set)
   }

5. Success: Show confirmation message and redirect to StudentDashboard
6. Error: Show error toast with message
7. Loading state during upload

Styling:
- Use TailwindCSS + DaisyUI
- Mobile responsive
- Form-focused vertical layout
- Progress indicator showing current step

Icons:
- FaArrowLeft for back
- FaArrowRight for next
- FaUpload for file upload
- FaCheckCircle for confirmation
```

---

## 3️⃣ ENHANCED POST DETAILS COMPONENT

**File:** `src/pages/PostDetails/PostDetails.jsx` (REPLACE EXISTING)

**V0 Prompt:**
```
Create an enhanced React component called PostDetails for displaying a single item in detail.

Features:
1. Image Gallery Section:
   - Display all images (or fallback to placeholder)
   - Main large image view (70% width)
   - Thumbnail carousel below (with arrow navigation)
   - Lightbox modal when clicking image (full screen with zoom)
   - Image counter "1 of 3"

2. Item Information Panel (30% width):
   - Item Title (large, bold)
   - Status Badge:
     - "Active" - green
     - "Claimed" - yellow
     - "Recovered" - blue
   - Verification Badge:
     - "Verified" - checkmark, green
     - "Pending" - hourglass, yellow
     - "Unverified" - warning
   - Category tag
   - Location tag with icon
   - Date posted
   - Description (full text, expandable if long)
   - Distinguishing features (if available)
   - Found by (user name or "Security Office")

3. Claim Section:
   - Large "CLAIM THIS ITEM" button (only if user not owner and status="active")
   - Opens ClaimItemModal on click
   - If already claimed by user: Show "Claim Pending" message
   - If owner: Show "Edit" and "Delete" buttons
   - If recovered: Show "Recovered on [date]"

4. Action Buttons:
   - Claim Item (primary button)
   - Message Admin (secondary button)
   - Save/Bookmark (if featured available)
   - Share (social media icons)

5. Contact Section:
   - "Contact Admin" button linking to Contact page
   - Quick FAQ about this item type

6. Related Items Section:
   - Show 3-5 similar items in same category
   - Carousel or grid layout

7. Mobile responsive:
   - Stack vertically on mobile
   - Full-width image
   - Vertical action buttons
   - Larger touch targets

Props/Data needed:
- item: {
    _id: string,
    title: string,
    description: string,
    category: string,
    location: string,
    images: array,
    status: "active" | "claimed" | "recovered",
    verificationStatus: "verified" | "pending" | "unverified",
    foundBy: string,
    foundDate: date,
    distinguishingFeatures: string,
    email: string (finder's email)
  }

Dependencies:
- react-router-dom (useLoaderData, useNavigate, Link)
- react-icons (various icons)
- react-hot-toast (notifications)
- react-lightbox-gallery (for image lightbox)
- AuthContext (current user)

Styling:
- Primary color: teal-600
- Use shadows and rounded corners
- Hover effects on buttons
- Smooth transitions
```

---

## 4️⃣ ADVANCED SEARCH COMPONENT

**File:** `src/pages/SearchItems/SearchItems.jsx` (ENHANCE EXISTING)

**V0 Prompt:**
```
Enhance the SearchItems component with advanced filtering and sorting.

Current filters (keep these):
- Search by keyword
- Category filter
- Location filter

New filters to add:
1. Date Range:
   - Found between: date picker (from) to date picker (to)
   - Default: Last 30 days
   - Quick shortcuts: "Last 7 days", "Last 30 days", "All time"

2. Condition:
   - Radio buttons or checkboxes
   - Options: Good, Fair, Damaged, Unknown
   - Default: All

3. Item Status:
   - Checkboxes
   - Options: Available (not claimed), Claimed, Recovered
   - Default: Available only

4. Verification Status:
   - Checkboxes
   - Options: Verified only, Pending, All
   - Default: Verified only

5. Sort by:
   - Dropdown menu
   - Options:
     * Most Recent (newest first)
     * Oldest First
     * Most Viewed
     * Closest to me (if user allows location)
   - Default: Most Recent

UI Layout:
- Left sidebar (collapsible on mobile) with all filters
- Main content area with search bar on top
- Filter chip display showing active filters
- "Clear all filters" button
- Results counter "Found X items"

Behavior:
1. Filters update results in real-time (debounce 300ms)
2. Store filter state in URL query params:
   ?q=wallet&category=wallets&from=2024-01-01&to=2024-12-31&status=available&sort=newest
3. Preserve filters when navigating back
4. Show loading skeleton while fetching
5. Show empty state with helpful message

API Call:
GET /api/search?
  q=search_term
  &category=category_name
  &location=location_name
  &dateFrom=date
  &dateTo=date
  &status=available|claimed|recovered
  &verificationStatus=verified|pending|all
  &sort=newest|oldest|viewed|closest
  &page=1
  &limit=12

Response should return:
{
  success: true,
  data: array of items,
  pagination: {
    total: number,
    page: number,
    pages: number,
    limit: number
  }
}

Display:
- Show results in grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each item card shows:
  * Main image with aspect ratio 16:9
  * Title
  * Category badge
  * Location
  * Date posted "5 days ago"
  * Status badge
  * Verification badge
  * "Claim" button

Mobile:
- Collapsible filter panel (hamburger icon)
- Sticky search bar
- Full-width cards

Performance:
- Lazy load images
- Virtual scroll if >100 items
- Cache results for 5 minutes
```

---

## 5️⃣ USER PROFILE PAGE

**File:** `src/pages/UserProfile/UserProfile.jsx`

**V0 Prompt:**
```
Create a comprehensive user profile page for students.

Route: /user-profile

Tabs/Sections:
1. Personal Information Tab:
   - Display current user info in read-only mode initially
   - Edit button to switch to edit mode
   - Fields (editable):
     * Full Name (required)
     * Email (read-only from auth)
     * Phone Number (required)
     * Student ID (read-only from registration)
     * Profile Picture (upload new)
     * Bio/About Me (optional, max 200 chars)
   - Save/Cancel buttons in edit mode
   - Success/error messages

2. Account Settings Tab:
   - Change Password:
     * Current Password field
     * New Password field
     * Confirm Password field
     * Submit button
     * Password strength indicator
   - Email Notifications:
     * Checkbox: Email when item match found
     * Checkbox: Daily activity digest
     * Checkbox: Admin announcements
   - Privacy Settings:
     * Show name on postings (toggle)
     * Show phone number (toggle)
     * Show email (toggle)
   - System Preferences:
     * Language (English, then others)
     * Theme (Light/Dark - future)

3. Activity Tab:
   - Timeline of all user actions:
     * Posted lost item
     * Searched for items
     * Submitted claim
     * Message received
     * Item recovered
   - Show last 20 activities
   - Filter by type dropdown
   - Each entry shows: action, date, item (if applicable), status

4. Statistics Tab:
   - Items Posted: X
   - Claims Submitted: X
   - Items Recovered: X
   - Success Rate: X%
   - Average Recovery Time: X days
   - Most Searched Category: (name)
   - Chart showing recovery trend (last 90 days)

5. Linked Accounts Tab:
   - Account linked to Firebase
   - Display email used
   - Option to disconnect (with warning)

Layout:
- Top section: Profile header with avatar, name, "Student" badge
- Tabs below header (scrollable on mobile)
- Switch between tabs with smooth transitions

Data/API:
GET /api/users/profile - get current user profile
PUT /api/users/profile - update profile
GET /api/users/activity - get user activity timeline
GET /api/users/stats - get recovery statistics

Styling:
- Professional layout with card-based design
- TailwindCSS + DaisyUI
- Form validation on edit
- Loading states for async operations
- Success toasts for updates
- Error alerts for failures
- Mobile responsive (stack vertically)

Context:
- Use AuthContext to get current user
- Use useNavigate for redirects
- Use useState for edit modes
- Use useEffect for data fetching

Icons:
- FaUser for profile
- FaCog for settings
- FaClock for activity
- FaChart for stats
- FaLink for linked accounts
- FaEdit for edit mode
```

---

## 6️⃣ MY CLAIMS PAGE (Enhanced)

**File:** `src/pages/StudentDashboard/ClaimsTab.jsx`

**V0 Prompt:**
```
Create enhanced My Claims tab component for StudentDashboard.

Features:
1. Claims List:
   - Show all claims submitted by current user
   - Sort by: Newest, Oldest, Pending first
   - Filter by status: All, Pending, Approved, Rejected
   
2. Each Claim Card shows:
   - Item image (thumbnail)
   - Item title
   - Status badge with color:
     * "Pending" - yellow
     * "Approved" - green
     * "Rejected" - red
     * "Transfer Arranged" - blue
     * "Completed" - green checkmark
   - Date submitted "5 days ago"
   - Admin's response preview (truncated)
   - "View Details" button

3. Claim Detail Modal:
   - Full claim information
   - Conversation thread with admin
   - Timeline:
     * Claim submitted
     * Admin response
     * Any updates
   - Reply button to add notes
   - Download proof documents (if available)
   - Status update log

4. Empty state:
   - Helpful message when no claims
   - Button to "Start searching for items"

5. Statistics card:
   - Total claims: X
   - Pending: X
   - Approved: X
   - Success rate: X%

API Calls:
GET /api/claims?studentEmail=user@email.com
  Returns: [{
    _id: string,
    itemId: string,
    itemTitle: string,
    itemImage: string,
    status: "pending" | "approved" | "rejected",
    submittedDate: date,
    adminResponse: string,
    lastUpdate: date
  }]

GET /api/claims/:claimId
  Returns: {
    ...full claim details,
    messages: array of conversation
  }

Styling:
- Card-based layout
- Status colors consistent with admin panel
- Timeline visualization
- Responsive grid
```

---

## 7️⃣ NOTIFICATIONS SYSTEM

**File:** `src/components/NotificationBell.jsx` + Service

**V0 Prompt:**
```
Create a notification bell component with dropdown notification list.

Component placement: Top right of navbar

Features:
1. Bell Icon:
   - Show badge with unread count when > 0
   - Red badge styling
   - Smooth animation when new notification arrives

2. Notification Dropdown:
   - Click bell to toggle dropdown
   - Sticky to top-right of viewport
   - Show last 10 notifications:
     * Item match found
     * Admin replied to message
     * Claim status updated
     * Item recovered
   - Each notification shows:
     * Icon (based on type)
     * Notification text
     * Time ago "2 hours ago"
     * Unread indicator (dot)
     * Click to navigate to related item/message

3. Notification Types:
   - Type: "match_found"
     Text: "Your item '[Item]' might have been found! View details"
     Link: /items/:itemId
   - Type: "admin_reply"
     Text: "Security office replied to your message"
     Link: /student-dashboard (messages tab)
   - Type: "claim_approved"
     Text: "Your claim for '[Item]' has been approved"
     Link: /student-dashboard (claims tab)
   - Type: "claim_rejected"
     Text: "Your claim for '[Item]' was not approved"
   - Type: "item_recovered"
     Text: "Your lost item '[Item]' has been recovered"

4. Actions in dropdown:
   - "Mark all as read" button
   - "Clear all" button (with confirmation)
   - Scroll through notifications
   - Each notification has delete button (X)

5. Real-time Updates:
   - Fetch new notifications every 30 seconds
   - Or use WebSocket/Firebase for real-time (future)
   - Use react-hot-toast for urgent notifications

API:
GET /api/notifications?user=email&limit=10
  Returns: [{
    _id: string,
    userId: string,
    type: string,
    title: string,
    message: string,
    link: string,
    isRead: boolean,
    createdAt: date,
    icon: string (icon name)
  }]

PUT /api/notifications/:notificationId/read
  Mark as read

PUT /api/notifications/mark-all-read
  Mark all as read

DELETE /api/notifications/:notificationId
  Delete notification

Styling:
- TailwindCSS dropdown
- Smooth open/close animation
- Hover effects on notifications
- Mobile: full-width modal instead of dropdown

Context:
- Could use custom NotificationContext for global state
- Or integrate with existing AuthContext
```

---

## HOW TO IMPLEMENT

### Step 1: Order of Implementation
```
1. ClaimItemModal (1-2 hours)
2. PostDetails Enhancement (2-3 hours)
3. PostLostItem (3-4 hours)
4. Advanced Search (3-4 hours)
5. UserProfile (3-4 hours)
6. Notifications (4-5 hours)
```

### Step 2: Backend Requirements
Ensure these endpoints exist:
```
POST   /api/claims                    - submit claim
GET    /api/claims                    - get user's claims
GET    /api/claims/:claimId           - get claim details
POST   /api/items                     - create new item (lost or found)
PUT    /api/items/:itemId             - update item
DELETE /api/items/:itemId             - delete item
GET    /api/items/:itemId             - get item details
GET    /api/search                    - search with filters
GET    /api/users/profile             - get current user
PUT    /api/users/profile             - update user profile
GET    /api/users/activity            - get user activity log
GET    /api/users/stats               - get user statistics
GET    /api/notifications             - get notifications
PUT    /api/notifications/:id/read    - mark as read
DELETE /api/notifications/:id         - delete notification
```

### Step 3: Frontend Integration
```
1. Update Router.jsx with new routes:
   - /post-lost-item
   - /user-profile
   - /items/:id (enhance existing)

2. Update StudentDashboard tabs layout

3. Add NotificationBell to MainLayout navbar

4. Install new dependencies if needed:
   npm install react-lightbox-gallery react-large-image
```

### Step 4: Testing
```
- Test on desktop and mobile
- Test form validation
- Test API error handling
- Test loading states
- Test with empty data
- Test with missing images
- Test claim submission flow
```

---

## 🎨 COLOR REFERENCE

```
Primary: teal
- teal-50 (bg)
- teal-100 (hover bg)
- teal-600 (btn, text)
- teal-700 (btn hover)

Status Colors:
- Active/Success: green-500, green-600
- Pending: yellow-500, yellow-600
- Error/Rejected: red-500, red-600
- Info/Claimed: blue-500, blue-600
- Verified: green-500
- Unverified: gray-400

Other:
- Text: gray-900 (dark), gray-600 (medium), gray-400 (light)
- Border: gray-200, gray-300
- Background: white, gray-50
```

---

## ✅ SUCCESS CRITERIA

When all components are built:
- ✅ Students can search and filter found items comprehensively
- ✅ Students can view full item details with images
- ✅ Students can claim found items with proof of ownership
- ✅ Students can post lost items looking for them
- ✅ Students can manage their profile and account
- ✅ Students can see all their claims and track status
- ✅ Students receive notifications on matches/updates
- ✅ All features work on mobile and desktop
- ✅ Matches your original project specification
```

This is ready to give to v0.dev!

