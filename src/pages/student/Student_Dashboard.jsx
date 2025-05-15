import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/animations/LoadingSpinner";
import LogoutAnimation from "../../components/animations/LogoutAnimation";
import Navbar from "../../components/Navbar";
import SidebarStudent from "../../components/student/SidebarStudent";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
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
               <SidebarStudent />
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
                                        académica.
                                   </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                                   <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-700">
                                        <AcademicCapIcon className="h-8 w-8 text-indigo-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                             Cursos en Recuperación
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                             Revisa tus unidades activas
                                        </p>
                                   </div>

                                   <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-700">
                                        <BookOpenIcon className="h-8 w-8 text-orange-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                             Material de Estudio
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                             Revisa tus actividades en el
                                             Classroom y Q10
                                        </p>
                                   </div>
                              </div>

                              <div className="bg-gray-800 rounded-2xl p-6 md:p-8 mb-8">
                                   <div className="max-w-3xl mx-auto text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                             ¡Estás a un paso de lograrlo!
                                        </h2>
                                        <p className="text-gray-300 md:text-lg mb-4">
                                             Cada unidad que completas te acerca
                                             más a tu meta.
                                        </p>
                                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors" onClick={() => navigate("/courses")}>
                                             Ver mis cursos de recuperación
                                        </button>
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   {[
                                        {
                                             title: "💡 Consejo útil",
                                             text: "Establece un plan de estudio semanal y cúmplelo con constancia.",
                                        },
                                        {
                                             title: "📆 Recordatorio",
                                             text: "Revisa la plataforma frecuentemente para ver el estado de tu solicitud.",
                                        },
                                        {
                                             title: "✅ Objetivo claro",
                                             text: "Superar cada unidad es una meta cumplida.",
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

export default StudentDashboard;
