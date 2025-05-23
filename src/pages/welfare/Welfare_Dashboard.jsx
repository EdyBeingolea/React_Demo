import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/animations/LoadingSpinner";
import LogoutAnimation from "../../components/animations/LogoutAnimation";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SidebarWalfare from "../../components/welfare/SidebarWalfare";

const WelfareDashboard = () => {
     const navigate = useNavigate();
     const { profile, isLoggingOut } = useAuth();
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          const timer = setTimeout(() => {
               setIsLoading(false);
          }, 200);

          return () => clearTimeout(timer);
     }, []);

     if (isLoggingOut) {
          return <LogoutAnimation />;
     }

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <div className="flex h-screen text-gray-100 bg-gray-950">
               <SidebarWalfare />
               <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="sticky top-0 z-40">
                         <Navbar />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                         <main className="max-w-7xl mx-auto">
                              <div className="text-center md:text-left mb-10">
                                   <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        ¡Hola
                                        {profile?.name
                                             ? `, ${profile.name}`
                                             : ""}
                                        ! 👋
                                   </h1>
                                   <p className="text-gray-300 text-lg md:text-xl">
                                        Bienvenido/a al sistema de recuperación
                                        académica para bienestar del estudiante.
                                   </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                                   <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-700">
                                        <AcademicCapIcon className="h-8 w-8 text-indigo-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                             Solicitudes de estudiantes en Recuperacion
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                             Revisa las solicitudes pendientes
                                        </p>
                                   </div>

                                   <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-700">
                                        <BookOpenIcon className="h-8 w-8 text-orange-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                             Revisa con precicion los mensajes
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                             Cada solicitud biene con un mensaje importante
                                        </p>
                                   </div>
                              </div>

                              <div className="bg-gray-800 rounded-2xl p-6 md:p-8 mb-8">
                                   <div className="max-w-3xl mx-auto text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                             ¡Revisar Solicitudes Pendientes Ahora!
                                        </h2>
                                        <p className="text-gray-300 md:text-lg mb-4">
                                             Cada solicitud revisada detalladamente es un 
                                             alivio para cada estudiante
                                        </p>
                                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors" onClick={() => navigate("/welfare/solicitudes")}>
                                             Ver las solicitudes 
                                        </button>
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   {[
                                        {
                                             title: "💡 Consejo útil",
                                             text: "Lee detalladamente cada solicitud enviada",
                                        },
                                        {
                                             title: "📆 Recordatorio",
                                             text: "Revisa la plataforma frecuentemente para ver las solicitudes",
                                        },
                                        {
                                             title: "✅ Objetivo claro",
                                             text: "Que cada estudiante aprenda de sus errores",
                                        },
                                   ].map((item, idx) => (
                                        <div
                                             key={idx}
                                             className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-700"
                                        >
                                             <h3 className="font-semibold text-white mb-2">
                                                  {item.title}
                                             </h3>
                                             <p className="text-gray-400 text-sm">
                                                  {item.text}
                                             </p>
                                        </div>
                                   ))}
                              </div>
                         </main>
                    </div>
               </div>
          </div>
     );
};

export default WelfareDashboard;
