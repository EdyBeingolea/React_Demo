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

     useEffect(() => {
          if (isAuthenticated && !hasRedirected) {
               setHasRedirected(true);
          }
     }, [isAuthenticated, hasRedirected, navigate]);

     const handleLogin = async () => {
          await login();
     };

     return (
          <div className="min-h-screen w-full flex flex-col">
               <div className="md:hidden flex items-center p-4 bg-white shadow-sm">
                    <img
                         src={LOGO}
                         alt="Valle Grande Logo"
                         className="w-10 h-10 rounded-xl shadow-md"
                    />
                    <h2 className="text-lg font-semibold text-gray-800 ml-3">
                         Valle Grande
                    </h2>
               </div>

               <div className="flex flex-col md:flex-row flex-grow">
                    <div className="relative w-full md:w-1/2 h-52 md:min-h-screen bg-indigo-900">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 z-10" />
                         <img
                              src={BACKGROUND_IMAGE}
                              className="absolute inset-0 w-full h-full object-cover"
                              alt="Background"
                         />
                         <div className="relative z-20 p-6 md:p-12 flex flex-col h-full justify-center">
                              <h1 className="text-2xl md:text-4xl lg:text-5xl text-white font-bold mb-2 md:mb-4">
                                   Sistema de Recuperaciones
                              </h1>
                              <p className="text-lg md:text-xl lg:text-2xl text-white/90">
                                   Sistema de Valle Grande
                              </p>
                         </div>
                    </div>

                    <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-20 flex flex-col justify-between bg-white flex-grow">
                         <div className="hidden md:flex items-center gap-4">
                              <img
                                   src={LOGO}
                                   alt="Valle Grande Logo"
                                   className="w-16 h-16 rounded-xl shadow-lg"
                              />
                              <h2 className="text-xl font-semibold text-gray-800">
                                   Valle Grande
                              </h2>
                         </div>

                         <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full py-8 md:py-0">
                              <div className="space-y-6">
                                   <div className="text-center">
                                        <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                                             ¡Bienvenido de nuevo!
                                        </h3>
                                        <p className="text-gray-600">
                                             Inicia sesión con tu cuenta
                                             institucional
                                        </p>
                                   </div>
                                   <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                                   >
                                        <FcGoogle className="w-5 h-5" />
                                        {loading
                                             ? "Redirigiendo..."
                                             : "Continuar con Google"}
                                   </button>

                                   {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mt-4">
                                             {error}
                                             <button
                                                  onClick={handleLogin}
                                                  className="ml-2 text-red-700 underline"
                                             >
                                                  Intentar nuevamente
                                             </button>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default Login;
