import React from "react";

const LogoutAnimation = () => {
     return (
          <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-100">
               <div className="text-center">
                    <div className="text-white text-4xl font-bold mb-6 animate-pulse">
                         Cerrando sesión...
                    </div>
                    <div className="flex justify-center">
                         {[...Array(3)].map((_, i) => (
                              <div
                                   key={i}
                                   className="w-4 h-4 bg-white rounded-full mx-2"
                                   style={{
                                        animation: `pulse 1.5s infinite ${
                                             i * 0.2
                                        }s`,
                                   }}
                              />
                         ))}
                    </div>
               </div>
          </div>
     );
};
export default LogoutAnimation;
