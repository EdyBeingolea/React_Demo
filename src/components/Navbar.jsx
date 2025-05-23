import React, { useEffect, useState } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import LogoutAnimation from "./animations/LogoutAnimation";

const Navbar = () => {
     const [scrolled, setScrolled] = useState(false);
     const [showProfileMenu, setShowProfileMenu] = useState(false);
     const [isLoggingOut, setIsLoggingOut] = useState(false);
     const { user, profile, logout } = useAuth();

     const formatName = (fullName) => {
          if (!fullName) return "";
          const nameParts = fullName.trim().split(" ");
          if (nameParts.length === 3) {
               return `${nameParts[0]} ${nameParts[1]}`;
          } else if (nameParts.length >= 4) {
               return `${nameParts[0]} ${nameParts[nameParts.length - 2]}`;
          } else {
               return fullName;
          }
     };

        const displayRole =
          profile?.role === "student"
               ? "Estudiante"
               : profile?.role === "teacher"
               ? "Profesor"
               : profile?.role === "treasury"
               ? "Tesorería"
               : profile?.role === "secretary"
               ? "Secretaría"
               : profile?.role === "welfare"
               ? "Bienestar del Estudiante"
               : profile?.role === "admin"
               ? "Administrador"
               : "No definido";

     const displayName = formatName(user?.name);

     useEffect(() => {
          const handleScroll = () => {
               const isScrolled = window.scrollY > 10;
               if (isScrolled !== scrolled) {
                    setScrolled(isScrolled);
               }
          };

          window.addEventListener("scroll", handleScroll);
          return () => {
               window.removeEventListener("scroll", handleScroll);
          };
     }, [scrolled]);

     useEffect(() => {
          const handleClickOutside = (event) => {
               if (
                    showProfileMenu &&
                    !event.target.closest(".profile-menu-container")
               ) {
                    setShowProfileMenu(false);
               }
          };

          document.addEventListener("mousedown", handleClickOutside);
          return () => {
               document.removeEventListener("mousedown", handleClickOutside);
          };
     }, [showProfileMenu]);

     const handleLogout = () => {
          setIsLoggingOut(true);
          setTimeout(() => {
               logout();
          }, 2000);
     };

     if (isLoggingOut) {
          return <LogoutAnimation />;
     }

     return (
          <div
               className={`w-full sticky top-0 z-50 flex justify-between items-center h-11 px-3
      ${scrolled ? "bg-gray-950 shadow-lg" : "bg-gray-950"}
      transition-all duration-300 border-b border-slate-700`}
          >
               <div className="flex-1 flex items-center justify-center">
                    <span className="text-white font-medium text-base">
                         Sección {displayRole}
                    </span>
               </div>

               <div className="profile-menu-container relative">
                    <div
                         className="flex items-center gap-2 cursor-pointer"
                         onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                         <div className="bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center text-white">
                              {displayName.charAt(0)}
                         </div>
                         <span className="text-white text-sm hidden md:block">
                              {displayName}
                         </span>
                    </div>

                    {showProfileMenu && (
                         <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-md shadow-lg overflow-hidden z-50">
                              <div className="p-4 border-b border-gray-800">
                                   <p className="text-white font-medium">
                                        {displayName}
                                   </p>
                                   <p className="text-gray-400 text-sm">
                                        Rol: {displayRole}
                                   </p>
                                   <p className="text-gray-400 text-sm">
                                        Dni: {profile?.document_number}
                                   </p>
                              </div>
                              <div className="p-2">
                                   <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-800 rounded-md flex items-center gap-2"
                                   >
                                        <IoLogOutOutline size={18} />
                                        <span>Cerrar sesión</span>
                                   </button>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default Navbar;
