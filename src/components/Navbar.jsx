import React, { useEffect, useState } from "react";

const Navbar = () => {
     const [scrolled, setScrolled] = useState(false);

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

     return (
          <div
               className={`w-full sticky top-0 z-50 flex justify-between items-center h-11 px-3
               ${scrolled ? "bg-gray-950 shadow-lg" : "bg-gray-950"}
               transition-all duration-300 border-b border-slate-700`}
          >
               <div className="flex-1 flex items-center justify-center">
                    <span className="text-white font-medium text-base">
                         Sección Estudiante
                    </span>
               </div>
          </div>
     );
};

export default Navbar;
