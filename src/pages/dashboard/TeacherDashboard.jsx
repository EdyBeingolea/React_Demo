import React from "react";
import { useAuth } from "../../context/AuthContext";

// Usando export default
const TeacherDashboard = () => {
     const { userData, currentUser } = useAuth();

     return (
          <div className="min-h-screen bg-gray-100">
               <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                         <h1 className="text-3xl font-bold text-gray-900">
                              Panel del Profesor
                         </h1>
                    </div>
               </header>

         <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                         <div className="px-4 py-6 sm:px-0">
                              <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
                                   <h2 className="text-xl font-semibold mb-4">
                                        Bienvenido, Profesor{" "}
                                        {userData?.name || currentUser?.email}
                                   </h2>

                     <div className="space-y-4">
                                        <GoogleApiButton service="drive" />
                                        <GoogleApiButton service="gmail" />
                                   </div>
                              </div>
                         </div>
                    </div>
               </main>
          </div>
     );
};

export default TeacherDashboard; // ← Esto es lo clave
