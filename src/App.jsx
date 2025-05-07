import {
     Navigate,
     Route,
     BrowserRouter as Router,
     Routes,
} from "react-router-dom";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import LogoutAnimation from "./components/animations/LogoutAnimation";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginForm";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/student/Student_Dashboard";
import StudentCourses from "./pages/student/Student_Courses";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TreasuryDashboard from "./pages/treasury/TreasuryDashboard";
import { useAuth } from "./context/AuthContext";

const AppContent = () => {
     const { isLoggingOut } = useAuth();

     if (isLoggingOut) {
          return <LogoutAnimation />;
     }

     return (
          <Routes>
               <Route path="/" element={<Login />} />
               <Route
                    path="/unauthorized"
                    element={<Unauthorized />}
               />
               <Route
                    path="/auth/callback"
                    element={<AuthCallback />}
               />
               <Route
                    path="/student"
                    element={
                         <PrivateRoute allowedRoles={["student"]}>
                              <StudentDashboard />
                         </PrivateRoute>
                    }
               />
               <Route
                    path="/courses"
                    element={
                         <PrivateRoute allowedRoles={["student"]}>
                              <StudentCourses />
                         </PrivateRoute>
                    }
               />
               <Route
                    path="/teacher/*"
                    element={
                         <PrivateRoute allowedRoles={["teacher"]}>
                              <TeacherDashboard />
                         </PrivateRoute>
                    }
               />
               <Route
                    path="/treasury/*"
                    element={
                         <PrivateRoute allowedRoles={["treasury"]}>
                              <TreasuryDashboard />
                         </PrivateRoute>
                    }
               />
               <Route
                    path="/dashboard"
                    element={
                         <PrivateRoute>
                              <Dashboard />
                         </PrivateRoute>
                    }
               />
               <Route
                    path="*"
                    element={<Navigate to="/" replace />}
               />
          </Routes>
     );
};

function App() {
     return (
          <Router>
               <AuthProvider>
                    <AppContent />
               </AuthProvider>
          </Router>
     );
}

export default App;
