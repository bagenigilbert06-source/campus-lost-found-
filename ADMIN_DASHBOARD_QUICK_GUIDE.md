# Admin Dashboard - Quick Developer Guide

## Quick Start

1. **Access Admin Dashboard**: Navigate to `/admin` (auto-redirects to `/admin-login` if not authenticated)
2. **Login**: Use admin email credentials configured in Firebase
3. **View Dashboard**: Displays real stats, recent items, and users from MongoDB

## Key Files at a Glance

### Services
- **adminService.js**: All API calls for admin operations
  ```javascript
  import adminService from '@/services/adminService';
  await adminService.getAdminStats();
  await adminService.verifyItem(itemId);
  ```

### Hooks
- **useAdminDashboard()**: Gets stats, recent items, recent users
  ```javascript
  const { stats, recentItems, recentUsers, loading, error, refetch } = useAdminDashboard();
  ```

- **useAdminData()**: Generic hook for paginated admin data
  ```javascript
  const { data, loading, pagination, goToPage } = useAdminData('/items', { status: 'pending' });
  ```

### Components
- **AdminLayout**: Wraps all admin pages with sidebar + header
- **AdminSidebar**: Navigation menu (auto-responsive)
- **AdminHeader**: Top bar with notifications and user menu
- **AdminStatCard**: Displays metrics with icons and trends
- **AdminTable**: Reusable table with pagination and actions
- **StatusBadge**: Status indicators (pending, verified, rejected, etc.)

### Pages
- **AdminDashboard**: Main dashboard showing overview, recent items, recent users

## Common Tasks

### Adding a New Admin Page

1. Create page in `src/pages/Admin/YourPage.jsx`
2. Use AdminLayout wrapper in router
3. Use hooks and components for data and UI

```jsx
// src/pages/Admin/AdminProducts.jsx
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminTable from '../../components/admin/AdminTable';
import useAdminData from '../../hooks/useAdminData';

export default function AdminProducts() {
  const { data, loading } = useAdminData('/products');
  
  return (
    <div>
      <h1>Products</h1>
      <AdminTable columns={columns} data={data} loading={loading} />
    </div>
  );
}
```

Then add to router:
```jsx
{
  path: '/admin/products',
  element: <AdminRoute><AdminProducts /></AdminRoute>,
}
```

### Adding a New Stat Card

```jsx
import { FiTrendingUp } from 'react-icons/fi';
import AdminStatCard from '@/components/admin/AdminStatCard';

<AdminStatCard
  icon={FiTrendingUp}
  label="Total Sales"
  value={stats?.totalSales || 0}
  color="purple"
  trend={{ direction: 'up', percentage: 12, label: 'vs last month' }}
/>
```

### Making an API Call

Always use `adminService` or create new methods there:

```javascript
// In adminService.js
getSalesData: async () => {
  try {
    const response = await apiClient.get('/sales');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
}

// In component
const data = await adminService.getSalesData();
```

## Component Props Reference

### AdminStatCard
```jsx
<AdminStatCard
  icon={FiPackage}           // react-icons component
  label="Total Items"        // string
  value={123}                // number
  color="blue"               // 'blue'|'green'|'yellow'|'red'|'purple'|'indigo'
  loading={false}            // boolean
  trend={{                   // optional
    direction: 'up',         // 'up'|'down'|'neutral'
    percentage: 12,          // number
    label: "vs last month"   // string
  }}
/>
```

### AdminTable
```jsx
<AdminTable
  columns={[                 // array of columns
    { key: 'title', label: 'Title' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value, row) => <StatusBadge status={value} />
    }
  ]}
  data={items}              // array of objects
  loading={false}           // boolean
  error={null}              // string or null
  onRowClick={(row) => {}}  // function
  pagination={{             // optional
    page: 1,
    pages: 5,
    total: 50
  }}
  onPageChange={(page) => {}} // function
  actions={[                // optional
    {
      label: 'Verify',
      variant: 'success',
      onClick: (row) => {}
    }
  ]}
/>
```

### StatusBadge
```jsx
<StatusBadge
  status="pending"          // 'pending'|'verified'|'rejected'|'recovered'|'claimed'|'active'|'inactive'
  size="md"                 // 'sm'|'md'|'lg'
/>
```

## Styling Guidelines

### Colors
Use Tailwind classes with theme colors:
- Blue: `bg-blue-50`, `text-blue-600`, `border-blue-200`
- Green: `bg-green-50`, `text-green-600`, `border-green-200`
- Yellow: `bg-yellow-50`, `text-yellow-600`, `border-yellow-200`
- Red: `bg-red-50`, `text-red-600`, `border-red-200`

### Spacing
Use Tailwind spacing scale:
- `p-4` = padding 16px
- `gap-6` = gap 24px
- `mb-8` = margin-bottom 32px

### Layout
Flexbox for 1D layouts, Grid for 2D:
```jsx
// Flexbox
<div className="flex items-center gap-4">

// Grid
<div className="grid grid-cols-3 gap-6">
```

## Data Flow

```
Component
  ↓
useAdminDashboard / useAdminData (Hook)
  ↓
adminService (Wrapper)
  ↓
apiClient (Interceptor adds auth token)
  ↓
Backend API
  ↓
MongoDB
```

## Testing the Dashboard

**Verify Load**:
- Open browser DevTools → Network
- Navigate to `/admin`
- Check that these requests succeed:
  - `GET /api/items/admin/stats` - returns stats
  - `GET /api/items?limit=5` - returns recent items
  - `GET /api/users?limit=5` - returns recent users

**Verify Actions**:
- Click "Verify" → should PATCH `/api/items/:id` with `{ status: "verified" }`
- Click "Reject" → should PATCH `/api/items/:id` with `{ status: "rejected" }`
- Click "Delete" → should DELETE `/api/items/:id`

**Verify Refresh**:
- Stats should auto-refresh every 30 seconds
- Check Network tab → requests should appear periodically
- Manual refresh button always works

## Common Issues

**"Access denied: Admin access required"**
- User is not in admin list
- Check `AuthContext` → `isAdmin` logic
- Verify user email in Firebase admin list

**Stats showing zeros**
- Check MongoDB has data
- Verify backend is running
- Check Network tab for failed requests

**Table shows "No data available"**
- Check API endpoint exists
- Verify response format is `{ data: [...] }`
- Check error state in component

**Sidebar not responsive**
- Verify `lg:` breakpoint CSS is applied
- Check viewport width in DevTools (should trigger below 1024px)
- Clear browser cache

## Performance Tips

1. **Use pagination** for large datasets
2. **Auto-refresh** helps keep data fresh (30s interval)
3. **Loading skeletons** improve perceived performance
4. **Memoize components** if rendering lists of 100+ items
5. **Lazy load pages** if adding many new admin sections

## Security Notes

- All admin endpoints require Firebase auth token
- Backend validates token with `authMiddleware`
- Admin status determined by email list in config
- No sensitive data logged to console (remove `[v0]` debug logs before production)
- CORS is properly configured for API calls

---

**Last Updated**: 2025-03-26
**Version**: 1.0
