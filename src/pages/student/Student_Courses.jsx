import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import Navbar from "../../components/Navbar";
import SidebarStudent from "../../components/student/SidebarStudent";
import { useAuth } from "../../context/AuthContext";

const StudentCourses = () => {
     const { profile } = useAuth();
     const [isLoading, setIsLoading] = useState(true);
     useEffect(() => {
          const timer = setTimeout(() => {
               setIsLoading(false);
          }, 500);

          return () => clearTimeout(timer);
     }, []);

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <div className="flex h-screen text-gray-100 bg-gray-950">
               <SidebarStudent />

               <div className="flex-1 p-4 md:p-6">
                    <Navbar />

                    <main className="max-w-7xl mx-auto mt-3">
                         <div className="text-center md:text-left mb-10">
                              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                   ¡Hola
                                   {profile?.name ? `, ${profile.name}` : ""}!
                                   👋
                              </h1>
                              <p className="text-gray-300 text-lg md:text-xl">
                                   Bienvenido/a al sistema de recuperación
                                   académica.
                              </p>
                         </div>
                    </main>
               </div>
          </div>
     );
};

export default StudentCourses;
