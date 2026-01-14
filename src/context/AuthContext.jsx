import { createContext, useState, useEffect } from "react";
import { setAccessToken, clearAccessToken } from "../api/axiosClient";



const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
    });

    // Initialize auth state from localStorage on app start
    useEffect(() => {
         const storedUsername = localStorage.getItem('username');
    console.log('HospitalList - Loading username:', storedUsername);
        const username = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');
        
        if (storedUsername && token) {
            setAuthState({
                isAuthenticated: true,
                user: {
                    username: storedUsername,
                    id: storedUserId || null,
                   
                }
            });
        }
    }, []);

    const login = (responseData) => {
        const accessToken = responseData.token;
        const refreshToken = responseData.refreshToken;
        const user = responseData.user; 

        console.log('Login - Setting token:', accessToken);
        console.log('Login - User:', user);

        // Set access token
        setAccessToken(accessToken);
        
        // Store refresh token
        sessionStorage.setItem("refreshToken", refreshToken);
        
        // STORE USER IN LOCALSTORAGE - THIS IS THE CRITICAL PART
        if (user && user.username) {
            localStorage.setItem('username', user.username);
            if (user.id) {
                localStorage.setItem('userId', user.id);
            }
        }
        
        // Update auth state
        setAuthState({
            isAuthenticated: true,
            user: user,
        });
    };
    
    const logout = () => {
        // Clear all storage
        clearAccessToken();
        sessionStorage.clear();
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        
        // Update auth state
        setAuthState({
            isAuthenticated: false,
            user: null
        });
    };
    
    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;