import axios from "axios";
import { useContext, useEffect } from "react";
import AuthContext from "../context/Authcontext/AuthContext";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
    baseURL :'http://localhost:3001/api',
    withCredentials : true
})

const UseAxiosSecure = () => {
const { signOutUser, user } = useContext(AuthContext)
const navigate = useNavigate()
    useEffect(()=>{
        // Request interceptor to add Firebase token
        axiosInstance.interceptors.request.use(
            async (config) => {
                if (user && user.getIdToken) {
                    try {
                        const token = await user.getIdToken();
                        config.headers.Authorization = `Bearer ${token}`;
                    } catch (error) {
                        console.error('[v0] Error getting Firebase token:', error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        axiosInstance.interceptors.response.use(response => {return response},
            error => {
                if(error.status === 401 || error.status=== 403){
                    signOutUser()
                    .then(()=>{
                        console.log('logged out user')
                        navigate('/signin')
                    })
                    .catch(error => console.log(error));
                }
            return Promise.reject(error)
        })
    },[user, signOutUser, navigate])
    return axiosInstance
};

export default UseAxiosSecure;
