import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowRight, FiFileText, FiSearch } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import Navbar from "../../components/Navbar";
import SidebarStudent from "../../components/student/SidebarStudent";
import { useAuth } from "../../context/AuthContext";

const StudentCourses = () => {
     const { profile } = useAuth();
     const [isLoading, setIsLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState("");
     const [courses, setCourses] = useState([]);
     const [error, setError] = useState(null);

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
                         semester: `${unit.periods.year}-${unit.periods.period}`,
                         grade: unit.original_grade,
                         shortName: unit.didactic_units.short_name,
                         isApproved: unit.is_approved,
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

     const filteredCourses = courses.filter(
          (course) =>
               course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               course.semester
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
               course.shortName.toLowerCase().includes(searchTerm.toLowerCase())
     );

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <div className="flex h-screen text-gray-100 bg-gray-950">
               <SidebarStudent />

               <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <Navbar />

                    <main className="max-w-7xl mx-auto mt-3">
                         <div className="text-center md:text-left mb-10">
                              <h1 className="text-2xl md:text-2xl font-bold text-white mb-2">
                                   ¡Hola
                                   {profile?.name ? `, ${profile.name}` : ""}!
                                   👋
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
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                             <h3 className="text-gray-400 text-sm">
                                                  Total de cursos
                                             </h3>
                                             <p className="text-2xl font-bold text-white">
                                                  {courses.length}
                                             </p>
                                        </div>
                                        <div className="bg-gray-800 p-4 rounded-lg">
                                             <h3 className="text-gray-400 text-sm">
                                                  Créditos disponibles
                                             </h3>
                                             <p className="text-2xl font-bold text-white">
                                                  {totalCredits}
                                             </p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                             <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
                                                  <FiFileText className="mr-2" />
                                                  Ver solicitud
                                             </button>
                                        </div>
                                   </div>

                                   <div className="relative mb-6">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <FiSearch className="text-gray-400" />
                                        </div>
                                        <input
                                             type="text"
                                             className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                             placeholder="Buscar por nombre, código o semestre..."
                                             value={searchTerm}
                                             onChange={(e) =>
                                                  setSearchTerm(e.target.value)
                                             }
                                        />
                                   </div>

                                   <div className="overflow-x-auto">
                                        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                                             <thead className="bg-gray-700">
                                                  <tr>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            N°
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Código
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Nombre de la unidad
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Costo (S/.)
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Créditos
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Semestre
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Nota
                                                       </th>
                                                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                            Acción
                                                       </th>
                                                  </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-700">
                                                  {filteredCourses.length >
                                                  0 ? (
                                                       filteredCourses.map(
                                                            (course, index) => (
                                                                 <tr
                                                                      key={
                                                                           course.id
                                                                      }
                                                                      className="hover:bg-gray-700"
                                                                 >
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                           {index +
                                                                                1}
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                           {
                                                                                course.shortName
                                                                           }
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                                           {
                                                                                course.name
                                                                           }
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                           S/.{" "}
                                                                           {course.cost.toFixed(
                                                                                2
                                                                           )}
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                           {
                                                                                course.credits
                                                                           }
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                           {
                                                                                course.semester
                                                                           }
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                                           {
                                                                                course.grade
                                                                           }
                                                                      </td>
                                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                           <button className="flex items-center text-blue-400 hover:text-blue-300">
                                                                                Recuperar{" "}
                                                                                <FiArrowRight className="ml-1" />
                                                                           </button>
                                                                      </td>
                                                                 </tr>
                                                            )
                                                       )
                                                  ) : (
                                                       <tr>
                                                            <td
                                                                 colSpan="8"
                                                                 className="px-6 py-4 text-center text-sm text-gray-400"
                                                            >
                                                                 No se
                                                                 encontraron
                                                                 cursos que
                                                                 coincidan con
                                                                 tu búsqueda
                                                            </td>
                                                       </tr>
                                                  )}
                                             </tbody>
                                        </table>
                                   </div>
                              </>
                         )}
                    </main>
               </div>
          </div>
     );
};

export default StudentCourses;
