import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const PrivateRoute = ({ children, allowedRoles }) => {
     const { isAuthenticated, loading, profile } = useAuth();
     const location = useLocation();

     if (loading) return <LoadingSpinner />;

     if (!isAuthenticated) {
          sessionStorage.setItem("auth_redirect_after", location.pathname);
          return <Navigate to="/" state={{ from: location }} replace />;
     }

     if (allowedRoles && !allowedRoles.includes(profile?.role)) {
          return (
               <Navigate
                    to="/unauthorized"
                    state={{ from: location }}
                    replace
               />
          );
     }

     return children;
};

export default PrivateRoute;
