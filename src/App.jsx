import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginForm";
import './App.css'

function App() {
     return (
          <Router>
               <AuthProvider>
                    <Routes>
                         <Route path="/" element={<Login />} />
                         <Route
                              path="/dashboard"
                              element={
                                   <PrivateRoute>
                                        <Dashboard />
                                   </PrivateRoute>
                              }
                         />
                         <Route path="/" element={<Login />} />
                    </Routes>
               </AuthProvider>
          </Router>
     );
}

export default App;
