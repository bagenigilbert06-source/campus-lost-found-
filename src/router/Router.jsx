import { createBrowserRouter } from "react-router-dom";

// Layouts
import PublicLayout from "../layout/PublicLayout";
import UserLayout from "../layout/UserLayout";
import AdminLayout from "../layout/AdminLayout";
import AuthLayout from "../layout/AuthLayout";

// Pages
import Home from "../pages/Home/Home";
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
import NotificationSettings from "../pages/Settings/NotificationSettings";
import CampusDirectory from "../pages/Directory/CampusDirectory";
import UserProfile from "../pages/UserProfile/UserProfile";
import StudentDashboard from "../pages/StudentDashboard/StudentDashboard";
import SearchItems from "../pages/SearchItems/SearchItems";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import AdminItems from "../pages/Admin/AdminItems";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminSettings from "../pages/Admin/AdminSettings";

// Route Guards
import PrivateRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";

const router = createBrowserRouter([
  // ============================================
  // AUTH ROUTES - No Navbar/Footer (clean auth pages)
  // ============================================
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/signin',
        element: <Signin />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/admin-login',
        element: <AdminLogin />
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
        path: 'items',
        element: <AdminRoute><AdminItems /></AdminRoute>,
      },
      {
        path: 'users',
        element: <AdminRoute><AdminUsers /></AdminRoute>,
      },
      {
        path: 'settings',
        element: <AdminRoute><AdminSettings /></AdminRoute>,
      },
    ]
  },

  // ============================================
  // USER/STUDENT ROUTES - User layout with Navbar/Footer
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
