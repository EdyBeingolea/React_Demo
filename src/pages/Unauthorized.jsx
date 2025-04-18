import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Unauthorized = () => {
     const navigate = useNavigate();
     const { logout } = useAuth();

     const handleGoBack = () => {
          logout();
          navigate("/");
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
               <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">
                         403
                    </h1>
                    <h2 className="text-2xl font-semibold mb-2">
                         Acceso no autorizado
                    </h2>
                    <p className="text-gray-600 mb-6">
                         No tienes permiso para acceder a esta página con tu rol
                         actual.
                    </p>
                    <button
                         onClick={handleGoBack}
                         className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                         Volver al inicio de sesión
                    </button>
               </div>
          </div>
     );
};

export default Unauthorized;
