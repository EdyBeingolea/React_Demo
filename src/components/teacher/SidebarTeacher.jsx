import { color, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AiOutlineFileSearch } from "react-icons/ai";
import { IoLogOutOutline } from "react-icons/io5";
import LOGO from "../../assets/img/logoVG.jpg";
// * React icons
import { AiOutlineAppstore } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { MdMenu } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SidebarTeacher = () => {
     let isTabletMid = useMediaQuery({ query: "(max-width: 768px)" });
     const [open, setOpen] = useState(isTabletMid ? false : true);
     const sidebarRef = useRef();
     const { pathname } = useLocation();
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
               : profile?.role === "admin"
               ? "Administrador"
               : "No definido";
     const displayName = formatName(user?.name);

     useEffect(() => {
          if (isTabletMid) {
               setOpen(false);
          } else {
               setOpen(true);
          }
     }, [isTabletMid]);

     useEffect(() => {
          isTabletMid && setOpen(false);
     }, [pathname]);

     const Nav_animation = isTabletMid
          ? {
                 open: {
                      x: 0,
                      width: "16rem",
                      transition: {
                           damping: 40,
                      },
                 },
                 closed: {
                      x: -250,
                      width: 0,
                      transition: {
                           damping: 40,
                           delay: 0.15,
                      },
                 },
            }
          : {
                 open: {
                      width: "16rem",
                      transition: {
                           damping: 40,
                      },
                 },
                 closed: {
                      width: "4rem",
                      transition: {
                           damping: 40,
                      },
                 },
            };

     return (
          <div>
               <div
                    onClick={() => setOpen(false)}
                    className={`md:hidden fixed inset-0 max-h-screen z-[998] bg-black/50 ${
                         open ? "block" : "hidden"
                    } `}
               ></div>

               <motion.div
                    ref={sidebarRef}
                    variants={Nav_animation}
                    initial={{ x: isTabletMid ? -250 : 0 }}
                    animate={open ? "open" : "closed"}
                    className="bg-gray-900 text-white shadow-xl z-[999] max-w-[16rem] w-[16rem]
     overflow-hidden md:relative fixed h-screen
     border-r-0 after:content-[''] after:absolute after:top-0 after:right-0 after:w-[1px] after:h-full
     after:bg-gradient-to-b after:from-slate-700/20 after:via-white/30 after:to-slate-700/20"
               >
                    <div className="flex items-center gap-2.5 font-medium border-b py-3 border-slate-300 mx-3">
                         <img
                              src={LOGO}
                              width={45}
                              alt=""
                              className="rounded-full"
                         />
                         <div className="ml-1 flex flex-col text-sm md:text-base lg:text-lg leading-tight">
                              <span>Sistema de</span>
                              <span>Recuperaciones</span>
                         </div>
                    </div>

                    <div className="flex flex-col text-sm h-full">
                         <ul className="whitespace-pre px-2.5 text-[0.9rem] py-5 flex flex-col gap-1  font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100  md:h-[68%] h-[70%]">
                              <li className="text-sm font-extrabold text-gray-600 dark:text-gray-400 hover:bg-gray-800 rounded-2xl">
                                   <NavLink to={"/student"} className="link">
                                        <AiOutlineAppstore
                                             size={23}
                                             className="min-w-max"
                                        />
                                        U.D. a recuperar
                                   </NavLink>
                              </li>
                              <li className="text-sm font-extrabold text-gray-600 dark:text-gray-400 hover:bg-gray-800 rounded-2xl">
                                   <NavLink
                                        to={"/student/authentication"}
                                        className="link"
                                   >
                                        <AiOutlineFileSearch
                                             size={23}
                                             className="min-w-max"
                                        />
                                        Solicitudes
                                   </NavLink>
                              </li>
                         </ul>

                         {open && (
                              <div className="flex flex-col border-t border-slate-300 p-4 gap-4">
                                   <div className="flex items-center justify-between">
                                        <div>
                                             <p className="font-semibold">
                                                  {displayName}
                                             </p>
                                             <p className="text-gray-500">
                                                  Rol: {displayRole}
                                             </p>
                                             <p className="text-gray-500">
                                                  Dni:{" "}
                                                  {profile?.document_number}
                                             </p>
                                        </div>
                                   </div>

                                   <motion.button
                                        onClick={logout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors duration-200 w-full justify-center"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                   >
                                        <IoLogOutOutline size={18} />
                                        <span>Cerrar sesión</span>
                                   </motion.button>
                              </div>
                         )}
                    </div>

                    <motion.div
                         onClick={() => {
                              setOpen(!open);
                         }}
                         animate={
                              open
                                   ? {
                                          x: 0,
                                          y: 0,
                                          rotate: 0,
                                     }
                                   : {
                                          x: -10,
                                          y: -200,
                                          rotate: 180,
                                     }
                         }
                         transition={{ duration: 0 }}
                         className="absolute w-fit h-fit md:block z-50 hidden right-2 bottom-3 cursor-pointer"
                    >
                         <IoIosArrowBack size={25} />
                    </motion.div>
               </motion.div>
               <div className="m-3 md:hidden" onClick={() => setOpen(true)}>
                    <MdMenu size={25} className="text-white" />
               </div>
          </div>
     );
};

export default SidebarTeacher;
