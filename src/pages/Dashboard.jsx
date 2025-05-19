import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/animations/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

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
          case "welfare":
               return <Navigate to="/welfare" replace />;
          case "secretariat":
               return <Navigate to="/secretary" replace />;
          default:
               return <Navigate to="/unauthorized" replace />;
     }
};

export default Dashboard;
