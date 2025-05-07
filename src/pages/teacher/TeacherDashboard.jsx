import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/animations/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const TeacherDashboard = () => {
     const { profile, logout } = useAuth();
     const navigate = useNavigate();

     if (!profile) return <LoadingSpinner />;

     return (
          <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Panel del Profesor</h1>
                    <button
                         onClick={logout}
                         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                         Cerrar sesión
                    </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                         onClick={() => navigate("/teacher/calificaciones")}
                         className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                         Gestionar calificaciones
                    </button>
               </div>
          </div>
     );
};

export default TeacherDashboard;
