import { createBrowserRouter } from "react-router-dom";

// Layouts
import PublicLayout from "../layout/PublicLayout";
import UserLayout from "../layout/UserLayout";
import DashboardLayout from "../layout/DashboardLayout";
import AdminLayout from "../layout/AdminLayout";
import AuthLayout from "../layout/AuthLayout";

// Pages
import Home from "../pages/Home/Home";
import DashboardHome from "../pages/DashboardHome/DashboardHome";
import Register from "../pages/Register/Register";
import Signin from "../pages/Signin/Signin";
import AddItems from "../pages/AddItems/AddItems";
import AllItems from "../pages/AllItems/AllItems";
import PostDetails from "../pages/PostDetails/PostDetails";
import MyItemsPage from "../pages/MyItemsPage/MyItemsPage";
import AllRecoveredItems from "../pages/AllRecovered/AllRecoveredItems";
import UpdateItems from "../pages/UpdateItems/UpdateItems";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import AboutUs from "../pages/AboutUs/AboutUs";
import Contact from "../pages/Contact/Contact";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminInventory from "../pages/Admin/AdminInventory";
import AdminClaims from "../pages/Admin/AdminClaims";
import AdminReports from "../pages/Admin/AdminReports";
import AdminActivityLog from "../pages/Admin/AdminActivityLog";
import AdminSettings from "../pages/Admin/AdminSettings";
import NotificationSettings from "../pages/Settings/NotificationSettings";
import CampusDirectory from "../pages/Directory/CampusDirectory";
import UserProfile from "../pages/UserProfile/UserProfile";
import StudentDashboard from "../pages/StudentDashboard/StudentDashboard";
import SearchItems from "../pages/SearchItems/SearchItems";
import DashboardSearch from "../pages/DashboardSearch/DashboardSearch";
import DashboardMessages from "../pages/DashboardMessages/DashboardMessages";
import DashboardActivity from "../pages/DashboardActivity/DashboardActivity";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import PostLostItem from "../pages/PostLostItem/PostLostItem";

// Route Guards
import PrivateRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";
import AuthGuard from "./AuthGuard";

const router = createBrowserRouter([
  // ============================================
  // AUTH ROUTES - No Navbar/Footer (clean auth pages)
  // AuthGuard prevents logged-in users from accessing these
  // ============================================
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/signin',
        element: <AuthGuard><Signin /></AuthGuard>
      },
      {
        path: '/register',
        element: <AuthGuard><Register /></AuthGuard>
      },
      {
        path: '/admin-login',
        element: <AuthGuard><AdminLogin /></AuthGuard>
      },
    ]
  },

  // ============================================
  // ADMIN ROUTES - Admin layout only (no user Navbar/Footer)
  // ============================================
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <AdminRoute><AdminDashboard /></AdminRoute>,
      },
      {
        path: 'inventory',
        element: <AdminRoute><AdminInventory /></AdminRoute>,
      },
      {
        path: 'claims',
        element: <AdminRoute><AdminClaims /></AdminRoute>,
      },
      {
        path: 'reports',
        element: <AdminRoute><AdminReports /></AdminRoute>,
      },
      {
        path: 'activity',
        element: <AdminRoute><AdminActivityLog /></AdminRoute>,
      },
      {
        path: 'settings',
        element: <AdminRoute><AdminSettings /></AdminRoute>,
      },
    ]
  },

  // ============================================
  // DASHBOARD ROUTES - App with sidebar (/app/*)
  // ============================================
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: <UserRoute><DashboardHome /></UserRoute>,
      },
      {
        path: 'profile',
        element: <UserRoute><UserProfile /></UserRoute>,
      },
      {
        path: 'my-items',
        element: <UserRoute><MyItemsPage /></UserRoute>,
      },
      {
        path: 'post-item',
        element: <UserRoute><AddItems /></UserRoute>,
      },
      {
        path: 'post-lost-item',
        element: <UserRoute><PostLostItem /></UserRoute>,
      },
      {
        path: 'search',
        element: <UserRoute><DashboardSearch /></UserRoute>,
      },
      {
        path: 'messages',
        element: <UserRoute><DashboardMessages /></UserRoute>,
      },
      {
        path: 'activity',
        element: <UserRoute><DashboardActivity /></UserRoute>,
      },
      {
        path: 'recovered',
        element: <UserRoute><AllRecoveredItems /></UserRoute>,
      },
      {
        path: 'settings/notifications',
        element: <UserRoute><NotificationSettings /></UserRoute>,
      },
      {
        path: "update/:id",
        element: <UserRoute><UpdateItems /></UserRoute>,
        loader: ({ params }) => fetch(`http://localhost:3001/api/items/${params.id}`).then(res => res.json()).then(data => {
          return Array.isArray(data) ? data[0] : data.data || data;
        })
      },
    ]
  },

  // ============================================
  // LEGACY USER ROUTES (backwards compatibility)
  // Redirects to /app/* paths
  // ============================================
  {
    element: <UserLayout />,
    children: [
      {
        path: '/dashboard',
        element: <UserRoute><StudentDashboard /></UserRoute>,
      },
      {
        path: '/profile',
        element: <UserRoute><UserProfile /></UserRoute>,
      },
      {
        path: '/myItems',
        element: <UserRoute><MyItemsPage /></UserRoute>,
      },
      {
        path: '/addItems',
        element: <UserRoute><AddItems /></UserRoute>,
      },
      {
        path: '/post-lost-item',
        element: <UserRoute><PostLostItem /></UserRoute>,
      },
      {
        path: '/allRecovered',
        element: <UserRoute><AllRecoveredItems /></UserRoute>,
      },
      {
        path: '/settings/notifications',
        element: <UserRoute><NotificationSettings /></UserRoute>,
      },
      {
        path: "/update/:id",
        element: <UserRoute><UpdateItems /></UserRoute>,
        loader: ({ params }) => fetch(`http://localhost:3001/api/items/${params.id}`).then(res => res.json()).then(data => {
          return Array.isArray(data) ? data[0] : data.data || data;
        })
      },
    ]
  },

  // ============================================
  // PUBLIC ROUTES - Public layout with Navbar/Footer
  // ============================================
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/aboutUs',
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: '/directory',
        element: <CampusDirectory />,
      },
      {
        path: '/search',
        element: <SearchItems />,
      },
      {
        path: '/allItems',
        element: <AllItems />,
        loader: () => fetch('http://localhost:3001/api/items').then(res => res.json()).then(data => {
          return Array.isArray(data) ? data : data.data || [];
        })
      },
      {
        path: "/items/:id",
        element: <PrivateRoute><PostDetails /></PrivateRoute>,
        loader: ({ params }) => fetch(`http://localhost:3001/api/items/${params.id}`).then(res => res.json()).then(data => {
          return Array.isArray(data) ? data[0] : data.data || data;
        })
      },
      {
        path: "*",
        element: <ErrorPage />
      },
    ]
  },
]);

export default router;
