import LoadingSpinner from "../components/animations/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

function AuthCallback() {
     const { loading, error } = useAuth();

     return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
               {loading ? (
                    <div className="text-center">
                         <LoadingSpinner />
                         <p className="mt-4 text-gray-600">
                              Procesando autenticación...
                         </p>
                    </div>
               ) : error ? (
                    <div className="text-center text-red-500">
                         <p>Error en la autenticación: {error}</p>
                         <p className="mt-2">
                              Serás redirigido a la página de inicio de
                              sesión...
                         </p>
                    </div>
               ) : (
                    <div className="text-center text-green-500">
                         <p>Autenticación exitosa!</p>
                         <p className="mt-2">Redirigiendo...</p>
                    </div>
               )}
          </div>
     );
}

export default AuthCallback;
