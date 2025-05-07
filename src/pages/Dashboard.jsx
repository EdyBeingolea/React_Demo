import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/animations/LoadingSpinner";

const Dashboard = () => {
     const { profile, loading } = useAuth();

     if (loading) return <LoadingSpinner />;

     switch (profile?.role) {
          case "student":
               return <Navigate to="/student" replace />;
          case "teacher":
               return <Navigate to="/teacher" replace />;
          case "treasury":
               return <Navigate to="/treasury" replace />;
          default:
               return <Navigate to="/unauthorized" replace />;
     }
};

export default Dashboard;
