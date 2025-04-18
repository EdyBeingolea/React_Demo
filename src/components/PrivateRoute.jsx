import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const PrivateRoute = ({ children }) => {
     const { isAuthenticated, loading, tokens } = useAuth();

     if (loading) return <LoadingSpinner />;

     if (!isAuthenticated || !tokens?.access_token) {
          // Limpieza adicional por si acaso
          localStorage.removeItem("google_token");
          return <Navigate to="/" replace />;
     }

     return children;
};

export default PrivateRoute;
