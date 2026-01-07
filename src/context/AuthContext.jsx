
import { createContext, useState} from "react";
import { setAccessToken } from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
    });

    const login = (responseData) => {

        const accessToken = responseData.token;
        const refreshToken = responseData.refreshToken;
        const user = responseData.user;

        console.log('Login - Setting token:', accessToken);
        console.log('Login - User:', user);

        setAccessToken(accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
        setAuthState({
            isAuthenticated: true,
            user: user,
        });
    };
    const logout = () => {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        sessionStorage.clear();
        setAuthState({
            isAuthenticated: false,
            user: null
        });
    };
    return (
        <AuthContext.Provider value={{ authState, login , logout }}>
            {children}
        </AuthContext.Provider>
    );

};
export default AuthContext;

