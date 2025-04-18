import { useEffect } from "react";
import ErrorBoundary from "../components/ErrorBoundary ";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
const Dashboard = () => {
     const { user, profile, tokens, loading, error, logout } = useAuth();

     useEffect(() => {
          if (!loading && tokens?.access_token) {
               console.log("🔑 Token de acceso completo:", tokens.access_token);
               console.log(
                    "📧 Token para Gmail (mismo token):",
                    tokens.access_token
               );
               console.log(
                    "💾 Token para Drive (mismo token):",
                    tokens.access_token
               );
               console.log(
                    "🔄 Expira:",
                    new Date(tokens.expiry).toLocaleString()
               );
               console.log("🔐 Alcances:", tokens.scopes);
          }
     }, [tokens, loading]);

     const handleSendEmail = async () => {
          try {
               const response = await axios.post(
                    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                    { raw: btoa("Prueba de email") },
                    {
                         headers: {
                              Authorization: `Bearer ${tokens.access_token}`,
                              "Content-Type": "application/json",
                         },
                    }
               );
               console.log("Correo enviado:", response);
          } catch (error) {
               console.error("Error al enviar correo:", error);
          }
     };

     if (loading) return <LoadingSpinner />;

     if (error) {
          return (
               <div className="p-6 text-red-600">
                    Error: {error}
                    <button
                         onClick={() => window.location.reload()}
                         className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
                    >
                         Recargar
                    </button>
               </div>
          );
     }

     return (
          <div className="p-6">
               <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                         Bienvenido, {user?.name}
                    </h1>
                    <button
                         onClick={logout}
                         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                         Cerrar sesión
                    </button>
               </div>

               <div className="mb-6">
                    <button
                         onClick={handleSendEmail}
                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                         Probar envío de correo
                    </button>
               </div>

               <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                         Datos del Backend
                    </h2>
                    {profile ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(profile).map(([key, value]) => (
                                   <div
                                        key={key}
                                        className="bg-gray-50 p-3 rounded"
                                   >
                                        <p className="text-sm font-medium text-gray-500">
                                             {key}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900">
                                             {typeof value === "object"
                                                  ? JSON.stringify(value)
                                                  : String(value)}
                                        </p>
                                   </div>
                              ))}
                         </div>
                    ) : (
                         <p>Cargando datos del perfil...</p>
                    )}
               </div>

               {tokens && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h2 className="text-xl font-semibold mb-4">
                              Información de Tokens
                         </h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-3 rounded">
                                   <p className="text-sm font-medium text-gray-500">
                                        Email
                                   </p>
                                   <p className="mt-1 text-sm text-gray-900">
                                        {user.email}
                                   </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded">
                                   <p className="text-sm font-medium text-gray-500">
                                        Token de acceso
                                   </p>
                                   <p className="mt-1 text-sm text-gray-900 break-all">
                                        {tokens.access_token.substring(0, 10)}
                                        ...{tokens.access_token.slice(-5)}
                                   </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded">
                                   <p className="text-sm font-medium text-gray-500">
                                        Expiración
                                   </p>
                                   <p className="mt-1 text-sm text-gray-900">
                                        {new Date(
                                             tokens.expiry
                                        ).toLocaleString()}
                                   </p>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
};

export default function SafeDashboard() {
     return (
          <ErrorBoundary>
               <Dashboard />
          </ErrorBoundary>
     );
}
