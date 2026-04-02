import React from "react";
import { API_BASE } from '../utils/apiConfig.js';
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "../layout/PublicLayout";
import DashboardLayout from "../layout/DashboardLayout";
import AdminLayout from "../layout/AdminLayout";
import AuthLayout from "../layout/AuthLayout";

// Pages
import Home from "../pages/Home/Home";
import DashboardHome from "../pages/DashboardHome/DashboardHome";
import Register from "../pages/Register/Register";
import Signin from "../pages/Signin/Signin";
import PostDetails from "../pages/PostDetails/PostDetails";
import MyItemsPage from "../pages/MyItemsPage/MyItemsPage";
import AllRecoveredItems from "../pages/AllRecovered/AllRecoveredItems";
import UpdateItems from "../pages/UpdateItems/UpdateItems";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import AboutUs from "../pages/AboutUs/AboutUs";
import Contact from "../pages/Contact/Contact";  // For public landing page
import DashboardContact from "../pages/DashboardContact/DashboardContact";  // For authenticated users
import FeaturesPage from "../pages/Features/FeaturesPage";
import ServicesPage from "../pages/Services/ServicesPage";
import FAQPage from "../pages/FAQ/FAQPage";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminInventory from "../pages/Admin/AdminInventory";
import AdminClaims from "../pages/Admin/AdminClaims";
import AdminReports from "../pages/Admin/AdminReports";
import AdminActivityLog from "../pages/Admin/AdminActivityLog";
import AdminSettings from "../pages/Admin/AdminSettings";
import AdminMessages from "../pages/Admin/AdminMessages";
import AdminAddItem from "../pages/Admin/AdminAddItem";
import AIAnalytics from "../pages/Admin/AIAnalytics";
import NotificationSettings from "../pages/Settings/NotificationSettings";
import CampusDirectory from "../pages/Directory/CampusDirectory";
import UserProfile from "../pages/UserProfile/UserProfile";
import SearchItems from "../pages/SearchItems/SearchItems";
import PostLostItem from "../pages/PostLostItem/PostLostItem";
import AuthContext from "../context/Authcontext/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import DashboardSearch from "../pages/DashboardSearch/DashboardSearch";
import DashboardMessages from "../pages/DashboardMessages/DashboardMessages";
import DashboardActivity from "../pages/DashboardActivity/DashboardActivity";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import MatchesPage from "../pages/Matches/MatchesPage";

// Route Guards
import PrivateRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";
import AuthGuard from "./AuthGuard";

const ContactRoute = () => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <LoadingScreen message="Checking user session..." />;
  }

  if (user) {
    return <Navigate to="/app/contact" replace />;
  }

  return <Contact />;
};

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
        path: 'add-item',
        element: <AdminRoute><AdminAddItem /></AdminRoute>,
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
      {
        path: 'messages',
        element: <AdminRoute><AdminMessages /></AdminRoute>,
      },
      {
        path: 'ai-analytics',
        element: <AdminRoute><AIAnalytics /></AdminRoute>,
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
        path: 'matches',
        element: <UserRoute><MatchesPage /></UserRoute>,
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
        path: 'contact',
        element: <UserRoute><DashboardContact /></UserRoute>,
      },
      {
        path: 'help',
        element: <Navigate to="/app/contact" replace />,
      },
      {
        path: "update/:id",
        element: <UserRoute><UpdateItems /></UserRoute>,
        loader: ({ params }) => {
          return fetch(`${API_BASE}/items/${params.id}`).then(res => res.json()).then(data => {
            return Array.isArray(data) ? data[0] : data.data || data;
          });
        }
      },
      {
        path: "items/:id",
        element: <UserRoute><PostDetails /></UserRoute>,
        loader: ({ params }) => {
          return fetch(`${API_BASE}/items/${params.id}`).then(res => res.json()).then(data => {
            return Array.isArray(data) ? data[0] : data.data || data;
          }).catch(error => {
            console.error('Error loading item:', error);
            return null;
          });
        }
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
        path: '/features',
        element: <FeaturesPage />
      },
      {
        path: '/services',
        element: <ServicesPage />
      },
      {
        path: '/faq',
        element: <FAQPage />
      },
      {
        path: '/aboutUs',
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <ContactRoute />
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
        path: '/addItems',
        element: <Navigate to="/app/post-item" replace />,
      },

      {
        path: "/items/:id",
        element: <PrivateRoute><PostDetails /></PrivateRoute>,
        loader: ({ params }) => {
          return fetch(`${API_BASE}/items/${params.id}`).then(res => res.json()).then(data => {
            return Array.isArray(data) ? data[0] : data.data || data;
          });
        }
      },
      {
        path: "*",
        element: <ErrorPage />
      },
    ]
  },
]);

export default router;
