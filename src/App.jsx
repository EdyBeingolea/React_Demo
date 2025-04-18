import {
     BrowserRouter as Router,
     Route,
     Routes,
     Navigate,
} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginForm";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TreasuryDashboard from "./pages/dashboard/TreasuryDashboard";
import "./App.css";

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

               {/* Rutas protegidas por rol */}
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

               {/* Ruta de dashboard genérica que redirige según el rol */}
                         <Route
                              path="/dashboard"
                              element={
                                   <PrivateRoute>
                                        <Dashboard />
                                   </PrivateRoute>
                              }
                         />

               {/* Redirección para rutas no encontradas */}
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
