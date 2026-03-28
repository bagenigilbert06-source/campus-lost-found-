# Architecture Guide - Public/Private Separation

## Directory Structure

```
src/
├── layout/
│   ├── PublicLayout.jsx          # For unauthenticated users
│   ├── DashboardLayout.jsx       # For authenticated users (NEW)
│   ├── UserLayout.jsx            # Wrapper for backward compatibility
│   ├── AdminLayout.jsx           # Admin dashboard
│   └── AuthLayout.jsx            # Clean auth pages
│
├── pages/
│   ├── common/
│   │   ├── PublicNavbar.jsx      # Marketing site navbar (NEW)
│   │   ├── DashboardNavbar.jsx   # Dashboard header (NEW)
│   │   ├── DashboardSidebar.jsx  # Dashboard sidebar (NEW)
│   │   ├── Navbar.jsx            # Legacy - kept for compatibility
│   │   └── Footer.jsx
│   │
│   ├── Home/                     # Public home page
│   ├── Signin/                   # Auth page
│   ├── Register/                 # Auth page
│   │
│   ├── DashboardHome/            # Main dashboard (NEW)
│   ├── DashboardSearch/          # Item search (NEW)
│   ├── DashboardMessages/        # Inbox (NEW)
│   ├── DashboardActivity/        # Activity history (NEW)
│   │
│   ├── StudentDashboard/         # Legacy dashboard
│   ├── SearchItems/              # Legacy search
│   ├── AllItems/                 # Public items listing
│   ├── UserProfile/
│   ├── AddItems/                 # Post item form
│   └── ... other pages
│
└── router/
    ├── Router.jsx                # Main routing configuration
    ├── UserRoute.jsx             # Protects user-only pages
    ├── AdminRoute.jsx            # Protects admin pages
    ├── PrivetRoute.jsx           # General auth protection
    └── AuthGuard.jsx             # Prevents auth pages access (NEW)
```

## User Experience Flow

### Unauthenticated Users
```
→ "/" (Landing/Home)
  → "/" (Search/Browse items)
  → "/signin" or "/register" (AuthGuard prevents access if authenticated)
  → (After login) "/app/dashboard"
```

### Authenticated Users
```
→ "/app/dashboard" (Main dashboard home)
  → "/app/search" (Search items)
  → "/app/post-item" (Post found item)
  → "/app/post-lost-item" (Post lost item)
  → "/app/my-items" (Manage postings)
  → "/app/messages" (Inbox)
  → "/app/activity" (Activity history)
  → "/app/profile" (Account settings)
```

### Admin Users
```
→ "/admin" (Admin dashboard)
  → "/admin/inventory"
  → "/admin/claims"
  → "/admin/reports"
  → "/admin/activity"
  → "/admin/settings"
```

## Component Hierarchy

### Public Pages
```
PublicLayout
├── PublicNavbar
├── <Page Content> (Home, About, Contact, etc.)
└── Footer
```

### Dashboard Pages
```
DashboardLayout
├── DashboardNavbar
├── DashboardSidebar
└── <Page Content>
    ├── DashboardHome
    ├── DashboardSearch
    ├── DashboardMessages
    └── DashboardActivity
```

## Routing Logic

### AuthGuard (Prevents authenticated users from accessing)
```javascript
User Logged In?
├─ Yes → Redirect to dashboard (admin or user)
└─ No → Allow access to signin/register
```

### UserRoute (Protects user-only pages)
```javascript
User Logged In?
├─ No → Redirect to signin
└─ Yes →
    Admin User?
    ├─ Yes → Redirect to admin
    └─ No → Allow access
```

### AdminRoute (Protects admin pages)
```javascript
User Logged In?
├─ No → Redirect to signin
└─ Yes →
    Admin User?
    ├─ No → Redirect to dashboard
    └─ Yes → Allow access
```

## Data Flow

### Dashboard Data Fetching
```
DashboardHome → Fetch:
├─ User's items (itemsPosted)
├─ User's claims (claimsSubmitted, approved, pending)
├─ User's recovered items
└─ User's messages (unread count)

DashboardSearch → Fetch:
├─ All items
└─ Apply client-side filters

DashboardMessages → Fetch:
├─ Messages for user
└─ Filter by read/unread

DashboardActivity → Fetch:
├─ User's items
├─ User's claims
├─ User's messages
└─ Combine and sort by date
```

## Styling Approach

### Color Scheme
- Primary: Teal (#10b981)
- Secondary: Green shades
- Neutral: Gray scale
- Status colors:
  - Red: Lost items, rejected claims
  - Green: Found items, approved claims
  - Orange: Pending claims

### Responsive Breakpoints
- Mobile: < 768px (sidebar hidden by default)
- Tablet: 768px - 1024px (sidebar shown on desktop)
- Desktop: > 1024px (full sidebar visible)

### Dark Mode
- All components support dark mode via `dark:` prefix
- Uses system preference or user toggle
- Consistent color mapping for dark variant

## Adding New Dashboard Pages

### Step 1: Create the page component
```javascript
// src/pages/NewPage/NewPage.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';

const NewPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/signin');
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      {/* Your content here */}
    </div>
  );
};

export default NewPage;
```

### Step 2: Add route in Router.jsx
```javascript
// In DashboardLayout children routes
{
  path: 'new-page',
  element: <UserRoute><NewPage /></UserRoute>,
}
```

### Step 3: Add sidebar link in DashboardSidebar.jsx
```javascript
// In menuItems array
{
  label: 'New Page',
  path: '/app/new-page',
  icon: FaIcon,
  description: 'Description here'
}
```

## State Management

### Authentication State
- Stored in AuthContext
- User info: name, email, photo, role
- Auth methods: signInUser, createUser, signInWithGoogle, signOutUser
- Admin status determined by email in schoolConfig

### Component State
- Each page component manages its own state (loading, data, filters)
- DashboardNavbar manages user menu dropdown
- DashboardSidebar manages mobile toggle

## Best Practices

1. **Always check user context in pages**
   - Redirect to signin if user not found
   - Use useNavigate for redirects

2. **Use UserRoute wrapper for protected pages**
   - Ensures only logged-in users access
   - Admin users get redirected appropriately

3. **Keep layouts clean and focused**
   - PublicLayout for public pages
   - DashboardLayout for authenticated pages

4. **Consistent styling**
   - Use Tailwind utility classes
   - Follow existing color scheme
   - Support dark mode

5. **Error handling**
   - Wrap API calls in try/catch
   - Show toast notifications for errors
   - Provide fallback UI

6. **Loading states**
   - Show loading spinner while fetching
   - Disable buttons during submission
   - Provide feedback to users

## Common Tasks

### Redirect Authenticated User Away
```javascript
import AuthGuard from '../router/AuthGuard';

<AuthGuard>
  <SigninPage />
</AuthGuard>
```

### Protect Page for Authenticated Users
```javascript
import UserRoute from '../router/UserRoute';

<UserRoute>
  <DashboardPage />
</UserRoute>
```

### Check User in Component
```javascript
const { user, isAdmin } = useContext(AuthContext);

if (!user) return <Navigate to="/signin" />;
if (isAdmin) return <Navigate to="/admin" />;
```

### Show Toast Notifications
```javascript
import toast from 'react-hot-toast';

toast.success('Success message!');
toast.error('Error message!');
toast.loading('Loading...');
```

## Debugging Tips

1. **Check user authentication**
   - Open DevTools Console
   - Check AuthContext in React DevTools
   - Verify user object has email and displayName

2. **Verify route configuration**
   - Check Router.jsx for correct path
   - Ensure component is imported
   - Check route guards are applied

3. **Sidebar navigation**
   - DashboardSidebar menuItems array controls links
   - Path must match Router.jsx path
   - Icons must be imported from react-icons

4. **Dark mode issues**
   - Check html element has 'dark' class
   - Use 'dark:' prefix in Tailwind classes
   - Verify color contrast in dark mode

## Performance Optimization

1. **Lazy load dashboard data**
   - Fetch only on mount
   - Use conditional rendering
   - Cache data in state

2. **Optimize images**
   - Use proper image format
   - Lazy load images in lists
   - Provide alt text

3. **Minimize re-renders**
   - Use useCallback for event handlers
   - Memoize expensive components
   - Separate concerns into smaller components

4. **Code splitting**
   - Dashboard pages can be lazy loaded
   - Admin pages separate from user pages
   - Public pages separate from authenticated
