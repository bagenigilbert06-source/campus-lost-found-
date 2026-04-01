import axios from "axios";
import { useContext, useEffect } from "react";
import AuthContext from "../context/Authcontext/AuthContext";
import { useNavigate } from "react-router-dom";
import auth from "../firebase/firebase.init";
import { API_BASE } from "../services/apiService";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const UseAxiosSecure = () => {
  const { signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Install interceptors once per hook lifecycle
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.getIdToken) {
            const token = await currentUser.getIdToken();
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            } else {
              config.headers = { Authorization: `Bearer ${token}` };
            }
          }
        } catch (error) {
          console.error('[v0] Error getting Firebase token:', error);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          try {
            await signOutUser();
            console.log('logged out user');
            navigate('/signin');
          } catch (signOutError) {
            console.error('[v0] Error signing out user after unauthorized response:', signOutError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, signOutUser]);

  return axiosInstance;
};

export default UseAxiosSecure;
