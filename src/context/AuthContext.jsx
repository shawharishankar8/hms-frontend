
import { createContext, useState} from "react";
import { setAccessToken } from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
    });

    const login = ({ user, accessToken , refreshToken})=>{
        setAccessToken(accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
        setAuthState({
            isAuthenticated:true,
            user:user,
        });
    };
    const logout = () => {
        setAccessToken(null);
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

