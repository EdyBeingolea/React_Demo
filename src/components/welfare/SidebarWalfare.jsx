import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AiOutlineFileSearch } from "react-icons/ai";
import { FaFolder } from "react-icons/fa";
import LOGO from "../../assets/img/logoVG.jpg";
import { AiOutlineAppstore } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { MdMenu } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const SidebarWelfare = () => {
     let isTabletMid = useMediaQuery({ query: "(max-width: 768px)" });
     const [open, setOpen] = useState(isTabletMid ? false : true);
     const [activeLink, setActiveLink] = useState("");
     const sidebarRef = useRef();
     const { pathname } = useLocation();
     const navigate = useNavigate();

     useEffect(() => {
          if (isTabletMid) {
               setOpen(false);
          } else {
               setOpen(true);
          }
     }, [isTabletMid]);

     useEffect(() => {
          isTabletMid && setOpen(false);
          setActiveLink(pathname);
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

     const handleNavigation = (path) => {
          if (pathname !== path) {
               navigate(path);
          }
     };

     return (
          <div className="h-screen">
               <div
                    onClick={() => setOpen(false)}
                    className={`md:hidden fixed inset-0 max-h-screen z-[50] bg-black/50 ${
                         open ? "block" : "hidden"
                    }`}
               ></div>

               <motion.div
                    ref={sidebarRef}
                    variants={Nav_animation}
                    initial={{ x: isTabletMid ? -250 : 0 }}
                    animate={open ? "open" : "closed"}
                    className="bg-gray-900 text-white shadow-xl z-[50] max-w-[16rem] w-[16rem]
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
                              <li 
                                   className={`text-sm font-extrabold hover:bg-gray-800 rounded-2xl ${
                                        activeLink === "/welfare" ? "bg-gray-800 text-white" : "text-gray-400"
                                   }`}
                                   onClick={() => handleNavigation("/welfare")}
                              >
                                   <div className="link cursor-pointer">
                                        <AiOutlineAppstore
                                             size={23}
                                             className="min-w-max"
                                        />
                                        Dashboard
                                   </div>
                              </li>
                             
                              <li 
                                   className={`text-sm font-extrabold hover:bg-gray-800 rounded-2xl ${
                                        activeLink === "/welfare/solicitudes" ? "bg-gray-800 text-white" : "text-gray-400"
                                   }`}
                                   onClick={() => handleNavigation("/welfare/solicitudes")}
                              >
                                   <div className="link cursor-pointer">
                                        <FaFolder
                                             size={23}
                                             className="min-w-max"
                                        />
                                        Solicitudes
                                   </div>
                              </li>
                              <li 
                                   className={`text-sm font-extrabold hover:bg-gray-800 rounded-2xl ${
                                        activeLink === "/welfare/solicitudesAceptadas" ? "bg-gray-800 text-white" : "text-gray-400"
                                   }`}
                                   onClick={() => handleNavigation("/welfare/solicitudesAceptadas")}
                              >
                                   <div className="link cursor-pointer">
                                        <FaFolder
                                             size={23}
                                             className="min-w-max"
                                        />
                                        Solicitudes Aprobadas
                                   </div>
                              </li>
                              <li 
                                   className={`text-sm font-extrabold hover:bg-gray-800 rounded-2xl ${
                                        activeLink === "/welfare/solicitudesRechazadas" ? "bg-gray-800 text-white" : "text-gray-400"
                                   }`}
                                   onClick={() => handleNavigation("/welfare/solicitudesRechazadas")}
                              >
                                   <div className="link cursor-pointer">
                                        <FaFolder
                                             size={23}
                                             className="min-w-max"
                                        />
                                        Solicitudes Rechazadas
                                   </div>
                              </li>
                         </ul>
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

export default SidebarWelfare;