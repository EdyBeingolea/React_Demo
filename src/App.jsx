import {
     Navigate,
     Route,
     BrowserRouter as Router,
     Routes,
} from "react-router-dom";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginForm";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TreasuryDashboard from "./pages/dashboard/TreasuryDashboard";

function App() {
     return (
          <Router>
               <AuthProvider>
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
                              path="/student/*"
                              element={
                                   <PrivateRoute allowedRoles={["student"]}>
                                        <StudentDashboard />
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
               </AuthProvider>
          </Router>
     );
}

export default App;
