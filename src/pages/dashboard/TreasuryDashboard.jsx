import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
     const { userData, currentUser } = useAuth();

     return (
          <div className="min-h-screen bg-gray-100">
               <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                         <h1 className="text-3xl font-bold text-gray-900">
                              Panel de Administrador
                         </h1>
                    </div>
               </header>

               <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                         <div className="px-4 py-6 sm:px-0">
                              <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
                                   <h2 className="text-xl font-semibold mb-4">
                                        Bienvenido, Administrador{" "}
                                        {userData?.name || currentUser?.email}
                                   </h2>

                                   <div className="space-y-4">
                                        <GoogleApiButton service="drive" />
                                        <GoogleApiButton service="gmail" />
                                   </div>

                                   <div className="mt-6 p-4 bg-gray-50 rounded">
                                        <h3 className="font-medium mb-2">
                                             Información de administrador:
                                        </h3>
                                        <pre className="text-xs mt-2 p-2 bg-gray-100 overflow-x-auto">
                                             {JSON.stringify(
                                                  {
                                                       user: currentUser,
                                                       userData,
                                                  },
                                                  null,
                                                  2
                                             )}
                                        </pre>
                                   </div>
                              </div>
                         </div>
                    </div>
               </main>
          </div>
     );
};

export default AdminDashboard;
