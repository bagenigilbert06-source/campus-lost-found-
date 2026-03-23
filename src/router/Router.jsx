import {
  createBrowserRouter,

} from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home/Home";
import Register from "../pages/Register/Register";
import Signin from "../pages/Signin/Signin";
import AddItems from "../pages/AddItems/AddItems";
import AllItems from "../pages/AllItems/AllItems";
import PostDetails from "../pages/PostDetails/PostDetails";
import PrivateRoute from "./PrivetRoute";
import AdminRoute from "./AdminRoute";
import MyItemsPage from "../pages/MyItemsPage/MyItemsPage";
import AllRecoveredItems from "../pages/AllRecovered/AllRecoveredItems";
import UpdateItems from "../pages/UpdateItems/UpdateItems";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import AboutUs from "../pages/AboutUs/AboutUs";
import Contact from "../pages/Contact/Contact";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import NotificationSettings from "../pages/Settings/NotificationSettings";
import CampusDirectory from "../pages/Directory/CampusDirectory";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
  
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/register',
        element: <Register />
      },
      {            
        path: '/signin',
        element: <Signin />
      },
      {
        path: '/addItems',
        element: <PrivateRoute><AddItems /></PrivateRoute>
      },
      {
        path: '/myItems',
        element: <PrivateRoute><MyItemsPage /></PrivateRoute>,


      },
      {
        path: '/aboutUs',
        element:<AboutUs />,


      },
      
      {
        path: "*",
        element: <ErrorPage />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/items/:id",
        element: <PrivateRoute><PostDetails /></PrivateRoute>,
        loader: ({ params }) => fetch(`https://b10a11-server-side-noorjahan220.vercel.app/items/${params.id}`)

      },
      {
        path: "/update/:id",
        element: <PrivateRoute><UpdateItems /></PrivateRoute>,
        loader: ({ params }) => fetch(`https://b10a11-server-side-noorjahan220.vercel.app/items/${params.id}`)

      },
      {
        path: '/allItems',
        element: <AllItems />,
        loader: () => fetch('https://b10a11-server-side-noorjahan220.vercel.app/items')
      },
      {
        path: '/allRecovered',
        element: <PrivateRoute><AllRecoveredItems /></PrivateRoute>,

      },
      {
        path: '/admin',
        element: <AdminRoute><AdminDashboard /></AdminRoute>,
      },
      {
        path: '/settings/notifications',
        element: <PrivateRoute><NotificationSettings /></PrivateRoute>,
      },
      {
        path: '/directory',
        element: <CampusDirectory />,
      },
    ]
  },
]);
export default router
