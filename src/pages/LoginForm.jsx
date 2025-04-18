import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import BACKGROUND_IMAGE from "../assets/img/background.jpg";
import LOGO from "../assets/img/logoVG.jpg";

export const Login = () => {
     const { login, loading, error, isAuthenticated } = useAuth();
     const navigate = useNavigate();
     const [hasRedirected, setHasRedirected] = useState(false);

     // Efecto para manejar la redirección
     useEffect(() => {
          if (isAuthenticated && !hasRedirected) {
               setHasRedirected(true);
               navigate("/dashboard", { replace: true });
          }
     }, [isAuthenticated, hasRedirected, navigate]);

     return (
          <div className="min-h-screen w-full flex flex-col md:flex-row">
               <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-screen bg-indigo-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 z-10" />
                    <img
                         src={BACKGROUND_IMAGE}
                         className="absolute inset-0 w-full h-full object-cover"
                         alt="Background"
                    />
                    <div className="relative z-20 p-8 md:p-12 flex flex-col h-full justify-center">
                         <h1 className="text-4xl md:text-5xl text-white font-bold mb-4 animate-fade-in">
                              Sistema de Recuperaciones
                         </h1>
                         <p className="text-xl md:text-2xl text-white/90">
                              Sistema de Valle Grande
                         </p>
                    </div>
               </div>

               <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-between bg-white">
                    <div className="flex items-center gap-4">
                         <img
                              src={LOGO}
                              alt="Valle Grande Logo"
                              className="w-12 h-12 md:w-16 md:h-16 rounded-xl shadow-lg"
                         />
                         <h2 className="text-xl font-semibold text-gray-800">
                              Valle Grande
                         </h2>
                    </div>

                    <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
                         <div className="space-y-6">
                              <div className="text-center">
                                   <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        ¡Bienvenido de nuevo!
                                   </h3>
                                   <p className="text-gray-600">
                                        Inicia sesión con tu cuenta
                                        institucional
                                   </p>
                              </div>
                              <button
                                   onClick={login}
                                   disabled={loading}
                                   className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                              >
                                   <FcGoogle className="w-5 h-5" />
                                   {loading
                                        ? "Cargando..."
                                        : "Continuar con Google"}
                              </button>

                              {error && (
                                   <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mt-4">
                                        {error}
                                        <button
                                             onClick={login}
                                             className="ml-2 text-red-700 underline"
                                        >
                                             Intentar nuevamente
                                        </button>
                                        {error.includes("bloqueó") && (
                                             <div className="mt-2 text-sm">
                                                  <p>
                                                       ¿Cómo permitir ventanas
                                                       emergentes?
                                                  </p>
                                                  <ul className="list-disc pl-5 mt-1">
                                                       <li>
                                                            Chrome: Haz clic en
                                                            el ícono de candado
                                                            en la barra de
                                                            direcciones
                                                       </li>
                                                       <li>
                                                            Firefox: Ve a
                                                            Configuración →
                                                            Privacidad y
                                                            Seguridad → Permisos
                                                       </li>
                                                  </ul>
                                             </div>
                                        )}
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default Login;

