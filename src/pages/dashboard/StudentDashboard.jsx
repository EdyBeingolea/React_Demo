import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
     const { user, profile, tokens, logout } = useAuth();

     const navigate = useNavigate();

     if (!profile) return <LoadingSpinner />;

     return (
          <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Panel del Estudiante</h1>
                    <p>Nombre del estudiante: {user?.name}</p>
                    <p>Correo electrónico: {user?.email}</p>
                    <p>Rol: {profile?.role}</p>
                    <div className="fixed bottom-0 right-0 bg-white p-4 shadow-lg z-50 max-w-xs">
                         <h3 className="font-bold mb-2">Debug Tokens</h3>
                         <div className="space-y-2">
                              <div>
                                   <p className="text-sm font-semibold">
                                        Access Token:
                                   </p>
                                   <p className="text-xs break-all bg-gray-100 p-1 rounded">
                                        {tokens?.access_token ||
                                             "No disponible"}
                                   </p>
                              </div>
                              <div>
                                   <p className="text-sm font-semibold">
                                        Refresh Token:
                                   </p>
                                   <p className="text-xs break-all bg-gray-100 p-1 rounded">
                                        {tokens?.refresh_token ||
                                             "No disponible"}
                                   </p>
                              </div>
                              <div>
                                   <p className="text-sm font-semibold">
                                        Expira:
                                   </p>
                                   <p className="text-xs">
                                        {tokens?.expiry
                                             ? new Date(
                                                    tokens.expiry
                                               ).toLocaleString()
                                             : "No disponible"}
                                   </p>
                              </div>
                         </div>
                    </div>
                    <button
                         onClick={logout}
                         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                         Cerrar sesión
                    </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                         onClick={() => navigate("/student/listado")}
                         className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                         Ver listado
                    </button>
               </div>
          </div>
     );
};

export default StudentDashboard;
