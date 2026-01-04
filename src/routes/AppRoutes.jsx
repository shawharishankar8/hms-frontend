import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HospitalList from "../pages/HospitalList";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import HospitalDetails from "../pages/HospitalDetails.jsx";


export default function AppRoutes() {
    const { authState } = useAuth();
    
    return (
        <Routes>
             <Route
        path="/"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/hospital" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/hospital"
            element = {
            <ProtectedRoute>
                <HospitalList />
            </ProtectedRoute>
            }
            />
            <Route
                path="/hospital/:hospitalId"
                element={
                    <ProtectedRoute>
                        <HospitalDetails />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}