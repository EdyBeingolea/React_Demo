import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
     const { logout } = useAuth();

     useEffect(() => {
          return () => {};
     }, []);

     const handleGoBack = async () => {
          await logout();
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-indigo-50 p-4">
               <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-center p-8 md:p-12 bg-white rounded-3xl shadow-2xl max-w-lg w-full border-t-4 border-red-500 relative overflow-hidden"
               >
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-50 rounded-full opacity-70"></div>
                    <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-50 rounded-full opacity-70"></div>

                    <div className="relative">
                         <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="flex justify-center mb-6"
                         >
                              <div className="p-4 bg-red-50 rounded-full">
                                   <AlertTriangle className="text-red-500 w-12 h-12" />
                              </div>
                         </motion.div>

                         <motion.h1
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                              className="text-5xl font-black text-red-600 mb-2"
                         >
                              403
                         </motion.h1>

                         <motion.h2
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="text-2xl font-bold text-gray-800 mb-4"
                         >
                              Acceso no autorizado
                         </motion.h2>

                         <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                         >
                              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                   Lo sentimos, no tienes permisos suficientes
                                   para acceder a esta sección. Verifica tus
                                   credenciales e intenta nuevamente.
                              </p>

                              <button
                                   onClick={handleGoBack}
                                   className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl w-full md:w-auto mx-auto"
                              >
                                   <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                   <span>Volver al inicio de sesión</span>
                              </button>
                         </motion.div>
                    </div>
               </motion.div>
          </div>
     );
};

export default Unauthorized;
