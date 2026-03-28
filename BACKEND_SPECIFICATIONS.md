# 🔧 BACKEND SPECIFICATIONS - MONGODB SCHEMA & ENDPOINTS

## DATABASE SCHEMA

### 1. ITEMS COLLECTION (Extended)

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  title: String,                    // "Blue Wallet", "Lost Student ID"
  description: String,              // Detailed description
  category: String,                 // "Wallets", "IDs", "Electronics", etc.
  itemType: String,                 // "lost" or "found"
  condition: String,                // "good", "fair", "damaged", "unknown"
  
  // Location & Time
  location: String,                 // "Gate 1", "Library", "Cafeteria", etc.
  dateLost: Date,                   // When item was lost/found
  createdAt: Date,
  updatedAt: Date,
  
  // Identification
  distinguishingFeatures: String,   // "Has scratch on corner", "Pink sticker"
  serialNumber: String,             // Optional for electronics
  brand: String,                    // Optional for items
  color: String,                    // "Blue", "Black", etc.
  size: String,                     // "Small", "Medium", "Large"
  
  // Images
  images: [String],                 // Array of image URLs from Firebase
  thumbnailImage: String,           // Main thumbnail
  
  // Owner/Finder Info
  email: String,                    // User email who posted
  name: String,                     // User name
  phone: String,                    // Contact phone
  userId: ObjectId,                 // Reference to User
  foundByUserId: ObjectId,          // If student found it
  
  // Status
  status: String,                   // "active", "claimed", "recovered", "disposed"
  verificationStatus: String,       // "verified", "pending", "rejected"
  verificationNotes: String,        // Admin's reason for approval/rejection
  verifiedBy: ObjectId,             // Which admin verified
  verifiedDate: Date,
  
  // Recovery Info
  claimedBy: ObjectId,              // User who claimed the item
  claimedDate: Date,
  recoveredDate: Date,
  recoveryNotes: String,            // How it was recovered/handed over
  
  // Metrics
  viewCount: Number,                // How many times viewed
  claimCount: Number,               // How many claims submitted
  matchScore: Number,               // AI matching score (0-100)
  
  // Tags/Keywords
  tags: [String],                   // For search optimization
  searchKeywords: [String],
  
  // Expiry
  expiryDate: Date,                 // When item will be considered disposed
  isExpired: Boolean
}

// MongoDB Indexes
db.items.createIndex({ status: 1, createdAt: -1 })
db.items.createIndex({ category: 1, status: 1 })
db.items.createIndex({ location: 1, status: 1 })
db.items.createIndex({ email: 1, status: 1 })
db.items.createIndex({ title: "text", description: "text", category: "text" })
db.items.createIndex({ dateLost: 1 })
db.items.createIndex({ verificationStatus: 1, status: 1 })
```

---

### 2. CLAIMS COLLECTION (New)

```javascript
{
  _id: ObjectId,
  
  // Item Reference
  itemId: ObjectId,                 // Reference to Items collection
  itemTitle: String,                // Denormalized for quick access
  itemCategory: String,
  itemImage: String,
  
  // Claimant Info
  claimantEmail: String,            // Student claiming the item
  claimantName: String,
  claimantPhone: String,
  claimantStudentId: String,
  claimantUserId: ObjectId,
  
  // Claim Evidence
  proofOfOwnership: String,         // Description of proof
  distinguishingMarks: String,      // Student's description of unique marks
  claimNotes: String,               // Additional notes
  documents: [String],              // File URLs if uploaded
  
  // Status Management
  status: String,                   // "pending", "approved", "rejected", "completed"
  submittedDate: Date,
  reviewedDate: Date,
  completedDate: Date,
  
  // Admin Response
  reviewerId: ObjectId,             // Which admin reviewed
  adminResponse: String,            // Admin's decision message
  adminNotes: String,               // Internal notes
  
  // Communication
  messages: [{
    sender: String,                 // "admin" or "student"
    content: String,
    timestamp: Date,
    isRead: Boolean
  }],
  
  // Timeline
  events: [{
    type: String,                   // "submitted", "approved", "rejected", "schedule", "handed_over"
    description: String,
    timestamp: Date,
    changedBy: ObjectId
  }]
}

// Indexes
db.claims.createIndex({ itemId: 1, claimantEmail: 1 })
db.claims.createIndex({ status: 1, submittedDate: -1 })
db.claims.createIndex({ claimantEmail: 1, submittedDate: -1 })
```

---

### 3. USERS COLLECTION (Extended)

```javascript
{
  _id: ObjectId,
  
  // Auth Info
  email: String,                    // Unique, required
  uid: String,                      // Firebase UID
  
  // Profile
  name: String,
  profile: {
    fullName: String,
    phone: String,
    studentId: String,              // School ID
    department: String,             // Optional
    yearOfStudy: String,            // Freshman, Sophomore, etc.
    profileImage: String,           // Firebase URL
    bio: String                     // Max 200 chars
  },
  
  // Account Settings
  settings: {
    emailNotifications: Boolean,    // Default: true
    dailyDigest: Boolean,           // Default: false
    announcements: Boolean,         // Default: true
    showNamePublic: Boolean,        // Default: true
    showPhonePublic: Boolean,       // Default: false
    showEmailPublic: Boolean        // Default: false
  },
  
  // Account Status
  role: String,                     // "student", "admin", "security"
  status: String,                   // "active", "suspended", "inactive"
  createdDate: Date,
  lastLoginDate: Date,
  
  // Statistics
  stats: {
    itemsPosted: Number,            // Total items reported
    itemsRecovered: Number,         // Success rate
    claimsSubmitted: Number,
    claimsApproved: Number,
    helpfulVotes: Number            // From other users
  },
  
  // Security
  passwordHash: String,             // If not using Firebase auth only
  twoFactorEnabled: Boolean,
  
  // Preferences
  language: String,                 // "en", "fr", etc.
  timezone: String
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ uid: 1 }, { unique: true })
db.users.createIndex({ role: 1, status: 1 })
```

---

### 4. MESSAGES COLLECTION

```javascript
{
  _id: ObjectId,
  
  // Participants
  senderEmail: String,              // Who sent message
  senderRole: String,               // "student" or "admin"
  recipientEmail: String,           // Who receives it
  recipientRole: String,
  
  // Message Content
  content: String,
  subject: String,                  // Optional
  
  // References
  itemId: ObjectId,                 // Which item is being discussed
  claimId: ObjectId,                // Which claim is being discussed
  conversationId: ObjectId,         // Group sent/received messages
  
  // Status
  isRead: Boolean,                  // Default: false
  readDate: Date,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  
  // Attachments
  attachments: [String]             // File URLs if any
}

// Indexes
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.messages.createIndex({ senderEmail: 1, createdAt: -1 })
db.messages.createIndex({ recipientEmail: 1, isRead: 1 })
```

---

### 5. NOTIFICATIONS COLLECTION (New)

```javascript
{
  _id: ObjectId,
  
  // Target
  userId: ObjectId,                 // User receiving notification
  userEmail: String,
  
  // Content
  type: String,                     // "match_found", "admin_reply", "claim_approved", etc.
  title: String,                    // "Your item matches!"
  message: String,                  // Full message
  icon: String,                     // Icon name for display
  
  // References
  itemId: ObjectId,                 // Related item (if any)
  claimId: ObjectId,                // Related claim (if any)
  messageId: ObjectId,              // Related message (if any)
  
  // Navigation
  link: String,                     // Where to navigate: "/items/:id", "/student-dashboard"
  
  // Status
  isRead: Boolean,                  // Default: false
  readDate: Date,
  
  // Delivery
  deliveryMethod: String,           // "in-app", "email", "both"
  emailSent: Boolean,
  emailSentDate: Date,
  
  // Timestamps
  createdAt: Date,
  expiryDate: Date                  // Auto-delete after 30 days
}

// Indexes
db.notifications.createIndex({ userEmail: 1, createdAt: -1 })
db.notifications.createIndex({ isRead: 1, userEmail: 1 })
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })
```

---

### 6. ACTIVITY LOG COLLECTION

```javascript
{
  _id: ObjectId,
  
  // Actor
  userId: ObjectId,
  userEmail: String,
  
  // Action
  action: String,                   // "posted_item", "searched", "claimed_item", etc.
  actionType: String,               // "create", "read", "update", "delete"
  
  // Entity
  entity: String,                   // "item", "claim", "message"
  entityId: ObjectId,
  entityName: String,               // Item title, etc.
  
  // Details
  details: {
    oldValue: Object,               // For update actions
    newValue: Object,
    description: String
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}

// Indexes
db.activityLog.createIndex({ userEmail: 1, timestamp: -1 })
db.activityLog.createIndex({ action: 1, timestamp: -1 })
```

---

## API ENDPOINTS

### ITEMS ENDPOINTS

#### GET /api/items
Search and retrieve items with filtering
```
Query Parameters:
- q: string                    // Search keyword
- category: string             // Filter by category
- location: string             // Filter by location
- dateFrom: date               // Filter from date
- dateTo: date                 // Filter to date
- status: string               // "active", "claimed", "recovered"
- verificationStatus: string   // "verified", "pending", all
- sort: string                 // "newest", "oldest", "viewed"
- page: number                 // Default: 1
- limit: number                // Default: 12, Max: 100
- itemType: string             // "lost" or "found"

Response:
{
  success: boolean,
  data: [{
    _id: string,
    title: string,
    images: [string],
    category: string,
    location: string,
    status: string,
    verificationStatus: string,
    createdAt: date,
    viewCount: number
  }],
  pagination: {
    total: number,
    page: number,
    pages: number,
    limit: number
  }
}

Status Codes:
- 200: Success
- 400: Bad request (invalid filters)
- 500: Server error
```

#### POST /api/items
Create new item (lost or found)
```
Authorization: Required (Bearer token)

Request Body:
{
  title: string (required),
  category: string (required),
  itemType: "lost" | "found" (required),
  condition: string,
  description: string (required, min 20 chars),
  location: string (required),
  dateLost: date (required),
  distinguishingFeatures: string,
  images: [File],              // Upload to Firebase
  phone: string,
  name: string
}

Response:
{
  success: boolean,
  message: string,
  data: {
    _id: string,
    title: string,
    status: "pending",
    verificationStatus: "pending"
  }
}

Status: 201 Created, 400 Bad Request, 401 Unauthorized, 500 Error
```

#### GET /api/items/:itemId
Get single item details
```
Response:
{
  success: boolean,
  data: {
    _id: string,
    title: string,
    description: string,
    category: string,
    location: string,
    images: [string],
    status: string,
    verificationStatus: string,
    distinguishingFeatures: string,
    foundBy: string,
    foundDate: date,
    viewCount: number,
    claimCount: number,
    email: string,
    name: string
  }
}

Increment viewCount on each request.
```

#### PUT /api/items/:itemId
Update item details (owner or admin only)
```
Authorization: Required

Request Body:
{
  title: string,
  description: string,
  status: string,
  distinguishingFeatures: string,
  // ... other updatable fields
}

Response: { success: boolean, data: {...} }
```

#### DELETE /api/items/:itemId
Delete item (owner or admin only)
```
Authorization: Required
Response: { success: boolean, message: string }
```

---

### CLAIMS ENDPOINTS

#### POST /api/claims
Submit a claim for an item
```
Authorization: Required

Request Body:
{
  itemId: string (required),
  proofOfOwnership: string (required),
  distinguishingMarks: string,
  claimNotes: string,
  claimantPhone: string,
  claimantStudentId: string,
  documents: [File]             // Optional proof documents
}

Response:
{
  success: boolean,
  message: string,
  data: {
    _id: string,
    status: "pending",
    submittedDate: date
  }
}

Status: 201 Created, 400 Bad Request, 401 Unauthorized, 409 Conflict (already claimed)
```

#### GET /api/claims
Get user's claims
```
Authorization: Required

Query Parameters:
- status: string               // "pending", "approved", "rejected"
- page: number
- limit: number

Response:
{
  success: boolean,
  data: [{
    _id: string,
    itemTitle: string,
    itemCategory: string,
    status: string,
    submittedDate: date,
    adminResponse: string,
    lastUpdate: date
  }],
  pagination: {...}
}
```

#### GET /api/claims/:claimId
Get claim details with conversation
```
Response:
{
  success: boolean,
  data: {
    _id: string,
    itemId: string,
    claimantEmail: string,
    claimantName: string,
    proofOfOwnership: string,
    status: string,
    adminResponse: string,
    messages: [{
      sender: "admin" | "student",
      content: string,
      timestamp: date
    }],
    events: [{
      type: string,
      description: string,
      timestamp: date
    }]
  }
}
```

#### PUT /api/claims/:claimId
Update claim status (admin only)
```
Authorization: Required (Admin)

Request Body:
{
  status: "approved" | "rejected" | "completed",
  adminResponse: string,
  adminNotes: string
}

Response: { success: boolean, data: {...} }
```

#### POST /api/claims/:claimId/message
Add message to claim conversation
```
Authorization: Required

Request Body:
{
  content: string (required)
}

Response:
{
  success: boolean,
  data: {
    sender: "student" | "admin",
    content: string,
    timestamp: date
  }
}
```

---

### SEARCH ENDPOINTS

#### GET /api/search
Advanced search with multiple filters
```
Query Parameters:
- q: string                    // Full text search
- category: string
- location: string
- dateFrom: date
- dateTo: date
- itemType: "lost" | "found"
- status: string
- verificationStatus: string
- sort: string
- page: number
- limit: number

Response:
{
  success: boolean,
  data: [{...items...}],
  pagination: {...}
}
```

#### GET /api/search/nearby
Search items near user location (future)
```
Query Parameters:
- lat: number                  // Latitude
- lng: number                  // Longitude
- radius: number               // In kilometers

Response:
{
  success: boolean,
  data: [{...items with distance field...}]
}
```

#### GET /api/search/suggestions
Get search suggestions based on user input
```
Query Parameters:
- q: string

Response:
{
  success: boolean,
  data: {
    items: ["Blue Wallet", "Lost Keys", ...],
    categories: ["Wallets", "Keys", ...],
    locations: ["Gate 1", "Library", ...]
  }
}
```

---

### USER ENDPOINTS

#### GET /api/users/profile
Get current user profile
```
Authorization: Required

Response:
{
  success: boolean,
  data: {
    _id: string,
    email: string,
    profile: {
      fullName: string,
      phone: string,
      studentId: string,
      profileImage: string,
      bio: string
    },
    settings: {...},
    stats: {
      itemsPosted: number,
      itemsRecovered: number,
      claimsSubmitted: number,
      claimsApproved: number
    }
  }
}
```

#### PUT /api/users/profile
Update user profile
```
Authorization: Required

Request Body:
{
  profile: {
    fullName: string,
    phone: string,
    bio: string,
    profileImage: File             // Or URL
  },
  settings: {...}
}

Response: { success: boolean, data: {...} }
```

#### PUT /api/users/password
Change password
```
Authorization: Required

Request Body:
{
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}

Response: { success: boolean, message: string }
```

#### GET /api/users/activity
Get user activity timeline
```
Authorization: Required

Query Parameters:
- limit: number                // Default: 20
- skip: number                 // For pagination

Response:
{
  success: boolean,
  data: [{
    type: string,              // "posted_item", "claimed_item", etc.
    description: string,
    timestamp: date,
    link: string               // Optional redirect link
  }]
}
```

#### GET /api/users/stats
Get user statistics
```
Authorization: Required

Response:
{
  success: boolean,
  data: {
    itemsPosted: number,
    itemsRecovered: number,
    claimsSubmitted: number,
    claimsApproved: number,
    successRate: number,       // Percentage
    averageRecoveryTime: number, // Days
    mostSearchedCategory: string,
    monthlyTrend: [{          // Last 12 months
      month: string,
      recovered: number,
      posted: number
    }]
  }
}
```

---

### NOTIFICATION ENDPOINTS

#### GET /api/notifications
Get user notifications
```
Authorization: Required

Query Parameters:
- limit: number                // Default: 10
- unreadOnly: boolean          // Default: false

Response:
{
  success: boolean,
  data: [{
    _id: string,
    type: string,
    title: string,
    message: string,
    link: string,
    isRead: boolean,
    createdAt: date
  }],
  unreadCount: number
}
```

#### PUT /api/notifications/:notificationId/read
Mark notification as read
```
Authorization: Required
Response: { success: boolean }
```

#### PUT /api/notifications/mark-all-read
Mark all notifications as read
```
Authorization: Required
Response: { success: boolean }
```

#### DELETE /api/notifications/:notificationId
Delete notification
```
Authorization: Required
Response: { success: boolean }
```

---

### MESSAGE ENDPOINTS

#### POST /api/messages
Send message to admin/student
```
Authorization: Required

Request Body:
{
  recipientEmail: string,
  content: string (required),
  subject: string,
  itemId: string,              // Optional
  claimId: string              // Optional
}

Response:
{
  success: boolean,
  data: {
    _id: string,
    content: string,
    createdAt: date,
    conversationId: string
  }
}
```

#### GET /api/messages
Get user's messages/conversations
```
Authorization: Required

Query Parameters:
- status: "all" | "unread"     // Default: "all"
- page: number

Response:
{
  success: boolean,
  data: [{
    _id: string,
    senderEmail: string,
    senderName: string,
    content: string,
    isRead: boolean,
    createdAt: date
  }],
  unreadCount: number
}
```

#### PUT /api/messages/:messageId/read
Mark message as read
```
Authorization: Required
Response: { success: boolean }
```

---

## ERROR CODES & RESPONSES

```javascript
// All endpoints follow this error response format:
{
  success: false,
  message: string,
  error: string,
  code: string
}

// Common HTTP Status Codes:
200: OK - Success
201: Created - Resource created successfully
400: Bad Request - Invalid input
401: Unauthorized - Missing/invalid auth token
403: Forbidden - No permission for this resource
404: Not Found - Resource not found
409: Conflict - Resource already exists or conflicting state
422: Unprocessable Entity - Validation failed
500: Internal Server Error - Server error
503: Service Unavailable - Database or external service down

// Common Error Codes:
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
ALREADY_EXISTS
INVALID_STATUS
EXTERNAL_SERVICE_ERROR
DATABASE_ERROR
```

---

## IMPLEMENTATION NOTES

1. **Authentication**: Use Firebase JWT tokens or your auth system
2. **Rate Limiting**: Implement per-user rate limits (100 requests/min)
3. **Caching**: Cache frequent queries (search results, item details)
4. **Image Storage**: Use Firebase Storage for all images
5. **Pagination**: Always implement pagination for list endpoints
6. **Validation**: Validate all inputs on backend
7. **Timestamps**: Use server timestamps, not client timestamps
8. **Transactions**: Use MongoDB transactions for claim approval
9. **Indexes**: Create indexes on frequently queried fields
10. **Logging**: Log all important actions for audit trail

---

## TESTING THE ENDPOINTS

Using curl or Postman:

```bash
# Create new item
curl -X POST http://localhost:3001/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blue Wallet",
    "category": "Wallets",
    "itemType": "found",
    "description": "Found near library with cash inside",
    "location": "Library",
    "dateLost": "2024-03-27"
  }'

# Search items
curl "http://localhost:3001/api/items?q=wallet&category=wallets&status=active"

# Submit claim
curl -X POST http://localhost:3001/api/claims \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "proofOfOwnership": "Has my initials MB inside",
    "claimantPhone": "+254712345678",
    "claimantStudentId": "DCS-01-8604/2024"
  }'
```

---

Done! This gives your backend team everything they need to implement properly. 🎯
