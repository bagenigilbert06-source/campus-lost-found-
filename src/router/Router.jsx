import { createBrowserRouter } from "react-router-dom";

// Layouts
import MainLayout from "../layout/MainLayout";

// Route Guards
import PrivateRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import StudentRoute from "./StudentRoute";
import PublicRoute from "./PublicRoute";

// Public Pages
import Home from "../pages/Home/Home";
import AboutUs from "../pages/AboutUs/AboutUs";
import Contact from "../pages/Contact/Contact";
import AllItems from "../pages/AllItems/AllItems";
import SearchItems from "../pages/SearchItems/SearchItems";
import CampusDirectory from "../pages/Directory/CampusDirectory";
import ErrorPage from "../pages/ErrorPage/ErrorPage";

// Auth Pages - Student
import Register from "../pages/Register/Register";
import Signin from "../pages/Signin/Signin";

// Auth Pages - Admin
import AdminLogin from "../pages/AdminLogin/AdminLogin";

// Protected Pages - Any Authenticated User
import PostDetails from "../pages/PostDetails/PostDetails";
import AddItems from "../pages/AddItems/AddItems";
import MyItemsPage from "../pages/MyItemsPage/MyItemsPage";
import UpdateItems from "../pages/UpdateItems/UpdateItems";
import AllRecoveredItems from "../pages/AllRecovered/AllRecoveredItems";
import NotificationSettings from "../pages/Settings/NotificationSettings";
import UserProfile from "../pages/UserProfile/UserProfile";

// Protected Pages - Student Only
import StudentDashboard from "../pages/StudentDashboard/StudentDashboard";

// Protected Pages - Admin Only
import AdminDashboard from "../pages/Admin/AdminDashboard";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // ==========================================
      // PUBLIC ROUTES - No authentication required
      // ==========================================
      {
        index: true,
        element: <Home />
      },
      {
        path: 'aboutUs',
        element: <AboutUs />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'allItems',
        element: <AllItems />,
        loader: () => fetch(`${API_URL}/items`).then(res => res.json()).then(data => {
          return Array.isArray(data) ? data : data.data || [];
        })
      },
      {
        path: 'search',
        element: <SearchItems />
      },
      {
        path: 'directory',
        element: <CampusDirectory />
      },

      // ==========================================
      // AUTH ROUTES - Student Login/Register
      // Redirects authenticated users to their dashboard
      // ==========================================
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        )
      },
      {
        path: 'signin',
        element: (
          <PublicRoute>
            <Signin />
          </PublicRoute>
        )
      },

      // ==========================================
      // AUTH ROUTES - Admin Login
      // Only redirects authenticated admins
      // ==========================================
      {
        path: 'admin-login',
        element: (
          <PublicRoute adminOnly>
            <AdminLogin />
          </PublicRoute>
        )
      },

      // ==========================================
      // PROTECTED ROUTES - Any Authenticated User
      // Both students and admins can access these
      // ==========================================
      {
        path: 'addItems',
        element: (
          <PrivateRoute>
            <AddItems />
          </PrivateRoute>
        )
      },
      {
        path: 'myItems',
        element: (
          <PrivateRoute>
            <MyItemsPage />
          </PrivateRoute>
        )
      },
      {
        path: 'items/:id',
        element: (
          <PrivateRoute>
            <PostDetails />
          </PrivateRoute>
        ),
        loader: ({ params }) => fetch(`${API_URL}/items/${params.id}`).then(res => res.json()).then(data => {
          return Array.isArray(data) ? data[0] : data.data || data;
        })
      },
      {
        path: 'update/:id',
        element: (
          <PrivateRoute>
            <UpdateItems />
          </PrivateRoute>
        ),
        loader: ({ params }) => fetch(`${API_URL}/items/${params.id}`).then(res => res.json()).then(data => {
          return Array.isArray(data) ? data[0] : data.data || data;
        })
      },
      {
        path: 'allRecovered',
        element: (
          <PrivateRoute>
            <AllRecoveredItems />
          </PrivateRoute>
        )
      },
      {
        path: 'settings/notifications',
        element: (
          <PrivateRoute>
            <NotificationSettings />
          </PrivateRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        )
      },

      // ==========================================
      // STUDENT-ONLY ROUTES
      // Only students can access (admins redirected to admin dashboard)
      // ==========================================
      {
        path: 'dashboard',
        element: (
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        )
      },

      // ==========================================
      // ADMIN-ONLY ROUTES
      // Only admins can access (students redirected away)
      // ==========================================
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )
      },

      // ==========================================
      // CATCH-ALL - 404
      // ==========================================
      {
        path: '*',
        element: <ErrorPage />
      }
    ]
  }
]);

export default router;
