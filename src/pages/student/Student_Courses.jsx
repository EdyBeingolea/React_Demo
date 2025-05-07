import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowRight, FiFileText, FiSearch } from "react-icons/fi";
import LoadingSpinner from "../../components/animations/LoadingSpinner";
import Navbar from "../../components/Navbar";
import SidebarStudent from "../../components/student/SidebarStudent";
import { useAuth } from "../../context/AuthContext";

const toRoman = (num) => {
     if (num === undefined || num === null) return "-";
     const romanNumerals = {
          1: "I",
          2: "II",
          3: "III",
          4: "IV",
          5: "V",
          6: "VI",
          7: "VII",
          8: "VIII",
          9: "IX",
          10: "X",
          11: "XI",
          12: "XII",
     };
     if (typeof num === "string" && num.includes("Semestre")) {
          const semesterNumber = num.match(/\d+/);
          return semesterNumber ? romanNumerals[semesterNumber[0]] || num : num;
     }
     if (typeof num === "string" && !isNaN(Number(num))) {
          return romanNumerals[Number(num)] || num;
     }
     return romanNumerals[num] || String(num);
};

const StudentCourses = () => {
     const { profile } = useAuth();
     const [isLoading, setIsLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState("");
     const [courses, setCourses] = useState([]);
     const [error, setError] = useState(null);
     const [activeButton, setActiveButton] = useState(null);

     useEffect(() => {
          const fetchRecoverableUnits = async () => {
               try {
                    setIsLoading(true);
                    const documentNumber = profile?.document_number;
                    if (!documentNumber) {
                         throw new Error("Número de documento no disponible");
                    }
                    const response = await axios.get(
                         `${
                              import.meta.env.VITE_BACKEND_URL
                         }/users/recoverable-units/by-dni?document_number=${documentNumber}`
                    );

                    const mappedCourses = response.data.map((unit) => ({
                         id: unit.didactic_unit_id,
                         name: unit.didactic_units.unit_name,
                         cost: unit.didactic_units.cost,
                         credits: unit.didactic_units.credits,
                         semester: unit.didactic_units.semester,
                         grade: unit.original_grade,
                         shortName: unit.didactic_units.short_name,
                         isApproved: unit.is_approved,
                         codePeriod: unit.periods.code,
                    }));

                    setCourses(mappedCourses);
                    setError(null);
               } catch (err) {
                    console.error(
                         "Error al obtener unidades recuperables:",
                         err
                    );
                    setError(
                         "Error al cargar los cursos. Intente nuevamente más tarde."
                    );
                    setCourses([]);
               } finally {
                    setIsLoading(false);
               }
          };
          fetchRecoverableUnits();
     }, [profile]);

     const totalCredits = courses.length > 5 ? 26 : 4;

     const safeCompare = (value, searchTerm) => {
          return String(value || "")
               .toLowerCase()
               .includes(searchTerm.toLowerCase());
     };

     const filteredCourses = courses.filter(
          (course) =>
               safeCompare(course.name, searchTerm) ||
               safeCompare(course.semester, searchTerm) ||
               safeCompare(course.shortName, searchTerm)
     );

     const getGradeBackground = (grade) => {
          const numGrade = Number(grade);
          if (isNaN(numGrade)) return "bg-gray-600 text-white";
          if (numGrade < 8) return "bg-red-700 text-white";
          if (numGrade < 11) return "bg-red-500 text-white";
          if (numGrade < 14) return "bg-blue-600 text-white";
          return "bg-green-600 text-white";
     };

     const handleButtonClick = (buttonId) => {
          setActiveButton(buttonId);
          setTimeout(() => setActiveButton(null), 300);
     };

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <div className="flex h-screen text-gray-100 bg-gray-950">
               <SidebarStudent />
               <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="sticky top-0 z-40">
                         <Navbar />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                         <main className="max-w-7xl mx-auto">
                              <div className="text-center md:text-left mb-10">
                                   <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        ¡Hola
                                        {profile?.name
                                             ? `, ${profile.name}`
                                             : ""}
                                        ! 👋
                                   </h1>
                                   <p className="text-sm md:text-lg text-gray-300 pt-2">
                                        Visualiza tus unidades a recuperar
                                   </p>
                              </div>
                              {error ? (
                                   <div className="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
                                        {error}
                                   </div>
                              ) : (
                                   <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
                                                  <h3 className="text-gray-400 text-sm font-medium">
                                                       Total de cursos
                                                  </h3>
                                                  <p className="text-3xl font-bold text-white mt-2">
                                                       {courses.length}
                                                  </p>
                                             </div>
                                             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
                                                  <h3 className="text-gray-400 text-sm font-medium">
                                                       Créditos disponibles
                                                  </h3>
                                                  <p className="text-3xl font-bold text-white mt-2">
                                                       {totalCredits}
                                                  </p>
                                             </div>
                                             <div className="flex items-center justify-center">
                                                  <button
                                                       className={`flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg transform ${
                                                            activeButton ===
                                                            "solicitud"
                                                                 ? "scale-95 bg-blue-800"
                                                                 : "hover:scale-105"
                                                       } hover:shadow-blue-500/20 hover:shadow-lg`}
                                                       onClick={() =>
                                                            handleButtonClick(
                                                                 "solicitud"
                                                            )
                                                       }
                                                  >
                                                       <FiFileText className="mr-2" />
                                                       Ver solicitud
                                                       <span className="ml-2 w-1 h-6 bg-blue-400/30 rounded-full"></span>
                                                  </button>
                                             </div>
                                        </div>
                                        <div className="relative mb-6">
                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                  <FiSearch className="text-gray-400" />
                                             </div>
                                             <input
                                                  type="text"
                                                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                                  placeholder="Buscar por nombre o código..."
                                                  value={searchTerm}
                                                  onChange={(e) =>
                                                       setSearchTerm(
                                                            e.target.value
                                                       )
                                                  }
                                             />
                                        </div>

                                        <div className="hidden md:block rounded-lg overflow-hidden shadow-xl bg-gray-800/50 backdrop-blur-sm">
                                             <div className="overflow-x-auto">
                                                  <table className="min-w-full divide-y divide-gray-700">
                                                       <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                                                            <tr>
                                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      N°
                                                                 </th>
                                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Código
                                                                 </th>
                                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Nombre de
                                                                      la unidad
                                                                 </th>
                                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Costo
                                                                      (S/.)
                                                                 </th>
                                                                 <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Créditos
                                                                 </th>
                                                                 <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Semestre
                                                                 </th>
                                                                 <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Nota
                                                                 </th>
                                                                 <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                                      Acción
                                                                 </th>
                                                            </tr>
                                                       </thead>
                                                       <tbody className="divide-y divide-gray-700">
                                                            {filteredCourses.length >
                                                            0 ? (
                                                                 filteredCourses.map(
                                                                      (
                                                                           course,
                                                                           index
                                                                      ) => (
                                                                           <tr
                                                                                key={
                                                                                     course.id
                                                                                }
                                                                                className="hover:bg-gray-700/50 transition-colors duration-200"
                                                                           >
                                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                                     <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs">
                                                                                          {index +
                                                                                               1}
                                                                                     </span>
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                                                                                     <span className="px-2 py-1 rounded bg-gray-700/50">
                                                                                          {
                                                                                               course.shortName
                                                                                          }
                                                                                     </span>
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                                                     {
                                                                                          course.name
                                                                                     }
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                                     <span className="font-medium">
                                                                                          S/.{" "}
                                                                                          {course.cost.toFixed(
                                                                                               2
                                                                                          )}
                                                                                     </span>
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                                                                     <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-900/30 text-blue-300">
                                                                                          {
                                                                                               course.credits
                                                                                          }
                                                                                     </span>
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-center  text-sm">
                                                                                     <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 font-semibold">
                                                                                          {toRoman(
                                                                                               course.semester
                                                                                          )}
                                                                                     </span>
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                                                                     <span
                                                                                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getGradeBackground(
                                                                                               course.grade
                                                                                          )} font-medium`}
                                                                                     >
                                                                                          {
                                                                                               course.grade
                                                                                          }
                                                                                     </span>
                                                                                </td>
                                                                                <td className="px-4 py-4 whitespace-nowrap text-sm font text-center -medium">
                                                                                     <button
                                                                                          className={`flex items-center bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 px-3 py-1 rounded-lg transition-all duration-300 ${
                                                                                               activeButton ===
                                                                                               `recover-${course.id}`
                                                                                                    ? "scale-95 bg-blue-600/30"
                                                                                                    : "hover:translate-x-1"
                                                                                          }`}
                                                                                          onClick={() =>
                                                                                               handleButtonClick(
                                                                                                    `recover-${course.id}`
                                                                                               )
                                                                                          }
                                                                                     >
                                                                                          Recuperar{" "}
                                                                                          <FiArrowRight
                                                                                               className={`ml-1 transition-transform duration-300 ${
                                                                                                    activeButton ===
                                                                                                    `recover-${course.id}`
                                                                                                         ? "translate-x-1"
                                                                                                         : ""
                                                                                               }`}
                                                                                          />
                                                                                     </button>
                                                                                </td>
                                                                           </tr>
                                                                      )
                                                                 )
                                                            ) : (
                                                                 <tr>
                                                                      <td
                                                                           colSpan="8"
                                                                           className="px-6 py-8 text-center text-sm text-gray-400 bg-gray-800/30"
                                                                      >
                                                                           No
                                                                           tienes
                                                                           cursos
                                                                           para
                                                                           recuperar.
                                                                      </td>
                                                                 </tr>
                                                            )}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>

                                        <div className="mt-6 md:hidden space-y-4">
                                             {filteredCourses.length > 0 ? (
                                                  filteredCourses.map(
                                                       (course, index) => (
                                                            <div
                                                                 key={course.id}
                                                                 className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300"
                                                            >
                                                                 <div className="flex justify-between items-start mb-3">
                                                                      <div>
                                                                           <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs mr-2">
                                                                                {index +
                                                                                     1}
                                                                           </span>
                                                                           <span className="px-2 py-1 rounded bg-gray-700/50 font-mono">
                                                                                {
                                                                                     course.shortName
                                                                                }
                                                                           </span>
                                                                      </div>
                                                                      <span
                                                                           className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getGradeBackground(
                                                                                course.grade
                                                                           )} font-medium`}
                                                                      >
                                                                           {
                                                                                course.grade
                                                                           }
                                                                      </span>
                                                                 </div>
                                                                 <h3 className="text-white font-medium mb-3">
                                                                      {
                                                                           course.name
                                                                      }
                                                                 </h3>
                                                                 <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                                                      <div>
                                                                           <span className="text-gray-400">
                                                                                Costo:
                                                                           </span>
                                                                           <span className="block font-medium text-white">
                                                                                S/.{" "}
                                                                                {course.cost.toFixed(
                                                                                     2
                                                                                )}
                                                                           </span>
                                                                      </div>
                                                                      <div>
                                                                           <span className="text-gray-400">
                                                                                Créditos:
                                                                           </span>
                                                                           <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-900/30 text-blue-300 mt-1">
                                                                                {
                                                                                     course.credits
                                                                                }
                                                                           </span>
                                                                      </div>
                                                                      <div>
                                                                           <span className="text-gray-400">
                                                                                Semestre:
                                                                           </span>
                                                                           <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 font-semibold mt-1">
                                                                                {toRoman(
                                                                                     course.semester
                                                                                )}
                                                                           </span>
                                                                      </div>
                                                                 </div>
                                                                 <button
                                                                      className={`w-full flex items-center justify-center bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg transition-all duration-300 ${
                                                                           activeButton ===
                                                                           `recover-mobile-${course.id}`
                                                                                ? "scale-95 bg-blue-600/30"
                                                                                : ""
                                                                      }`}
                                                                      onClick={() =>
                                                                           handleButtonClick(
                                                                                `recover-mobile-${course.id}`
                                                                           )
                                                                      }
                                                                 >
                                                                      Recuperar{" "}
                                                                      <FiArrowRight
                                                                           className={`ml-1 transition-transform duration-300 ${
                                                                                activeButton ===
                                                                                `recover-mobile-${course.id}`
                                                                                     ? "translate-x-1"
                                                                                     : ""
                                                                           }`}
                                                                      />
                                                                 </button>
                                                            </div>
                                                       )
                                                  )
                                             ) : (
                                                  <div className="bg-gray-800/30 p-6 rounded-lg text-center text-gray-400">
                                                       No tienes cursos para
                                                       recuperar.
                                                  </div>
                                             )}
                                        </div>
                                   </>
                              )}
                         </main>
                    </div>
               </div>
          </div>
     );
};

export default StudentCourses;
