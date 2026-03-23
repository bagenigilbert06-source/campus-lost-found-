import axios from "axios";
import { useContext, useEffect } from "react";
import AuthContext from "../context/Authcontext/AuthContext";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
    baseURL :'https://b10a11-server-side-noorjahan220.vercel.app',
    withCredentials : true
})

const UseAxiosSecure = () => {
const { signOutUser } = useContext(AuthContext)
const navigate = useNavigate()
    useEffect(()=>{
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
    },[])
    return axiosInstance
};

export default UseAxiosSecure;