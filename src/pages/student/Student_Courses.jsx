import axios from "axios";
import { useEffect, useState } from "react";
import {
     FiArrowRight,
     FiFileText,
     FiSearch,
     FiTrash2,
     FiX,
} from "react-icons/fi";
import LoadingSpinner from "../../components/animations/LoadingSpinner";
import Navbar from "../../components/Navbar";
import SidebarStudent from "../../components/student/SidebarStudent";
import { useAuth } from "../../context/AuthContext";

const Notification = ({ message, type = "success", onClose }) => {
     const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

     return (
          <div
               className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in z-50`}
          >
               <span>{message}</span>
               <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200"
               >
                    <FiX />
               </button>
          </div>
     );
};

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
     const { profile, tokens } = useAuth();
     const [isLoading, setIsLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState("");
     const [courses, setCourses] = useState([]);
     const [error, setError] = useState(null);
     const [activeButton, setActiveButton] = useState(null);
     const [selectedCourses, setSelectedCourses] = useState([]);
     const [remainingCredits, setRemainingCredits] = useState(4);
     const [showModal, setShowModal] = useState(false);
     const [message, setMessage] = useState("");
     const [messageError, setMessageError] = useState("");
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [submitSuccess, setSubmitSuccess] = useState(false);
     const [notification, setNotification] = useState(null);

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
                         year: unit.periods.year,
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

     useEffect(() => {
          const usedCredits = selectedCourses.reduce(
               (sum, course) => sum + course.credits,
               0
          );
          setRemainingCredits(maxCredits - usedCredits);
     }, [selectedCourses]);

     const totalCredits = courses.length > 5 ? 26 : 4;
     const maxCredits = 4;

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

     const handleRecoverCourse = (course) => {
          handleButtonClick(`recover-${course.id}`);

          if (selectedCourses.some((c) => c.id === course.id)) {
               return;
          }

          if (selectedCourses.length === 0 && course.credits === 4.5) {
               setSelectedCourses([course]);
               return;
          }

          if (
               selectedCourses.reduce((sum, c) => sum + c.credits, 0) +
                    course.credits >
               maxCredits
          ) {
               return;
          }

          setSelectedCourses([...selectedCourses, course]);
     };

     const handleOpenModal = () => {
          handleButtonClick("solicitud");
          if (selectedCourses.length === 0) {
               setError("Debes seleccionar al menos un curso para recuperar.");
               setTimeout(() => setError(null), 3000);
               return;
          }
          setShowModal(true);
     };

     const handleRemoveCourse = (courseId) => {
          setSelectedCourses(
               selectedCourses.filter((course) => course.id !== courseId)
          );
     };

     const handleCancel = () => {
          setSelectedCourses([]);
          setShowModal(false);
          setMessage("");
          setMessageError("");
     };

     const handleSubmit = async () => {
          if (isSubmitting) return;

          const documentNumber = profile?.document_number;
          if (!message.trim()) {
               setMessageError("El mensaje es obligatorio.");
               return;
          }

          if (selectedCourses.length === 0) {
               setError("Debe seleccionar al menos un curso.");
               return;
          }

          setIsSubmitting(true);
          setError(null);

          try {
               const currentYear = new Date().getFullYear();
               const lastNumber = parseInt(
                    localStorage.getItem("lastCorrelativoNumber") || "0",
                    10
               );
               const nextNumber = lastNumber + 1;
               const paddedNumber = nextNumber.toString().padStart(5, "0");
               const correlativo = `N°${paddedNumber}-${currentYear}`;
               localStorage.setItem(
                    "lastCorrelativoNumber",
                    nextNumber.toString()
               );
               const codePeriod =
                    selectedCourses[0]?.codePeriod || "PERIODO_NO_DISPONIBLE";

               const requestData = {
                    type: "studentRequest",
                    accessToken: tokens?.access_token || "",
                    studentEmail: profile?.email,
                    studentName: profile?.name,
                    message: message,
                    codePeriod: codePeriod,
                    documentNumber: documentNumber,
                    courses: selectedCourses.map((course) => ({
                         unidadDidactica: course.name,
                         creditos: course.credits,
                         costo: course.cost.toFixed(2),
                         grade: course.grade,
                    })),
                    totalCost: selectedCourses
                         .reduce((sum, course) => sum + course.cost, 0)
                         .toFixed(2),
                    correlativo: correlativo,
               };

               console.log(
                    "Enviando solicitud a través de la API Flask:",
                    requestData
               );

               const API_URL = import.meta.env.VITE_BACKEND_URL;

               const response = await axios.post(
                    `${API_URL}/api/send-recovery-request`,
                    requestData,
                    {
                         headers: {
                              "Content-Type": "application/json",
                              Charset: "UTF-8",
                         },
                         timeout: 10000,
                    }
               );

               console.log("Respuesta recibida:", response.data);

               if (response.data.success) {
                    setSubmitSuccess(true);
                    localStorage.setItem("lastCorrelativo", correlativo);

                    setNotification({
                         message: "Solicitud enviada con éxito",
                         type: "success",
                    });

                    setTimeout(() => {
                         setNotification(null);
                         setSelectedCourses([]);
                         setShowModal(false);
                         setMessage("");
                         setSubmitSuccess(false);
                    }, 3000);
               } else {
                    throw new Error(
                         response.data.error ||
                              "Error desconocido en la respuesta"
                    );
               }
          } catch (error) {
               console.error("Error al enviar la solicitud:", error);

               setNotification({
                    message: "Error al enviar la solicitud",
                    type: "error",
               });

               let errorMessage = "Error al enviar la solicitud.";

               if (error.response) {
                    errorMessage += ` ${
                         error.response.data?.error ||
                         `Código: ${error.response.status}`
                    }`;
               } else if (error.request) {
                    errorMessage +=
                         " No se recibió respuesta del servidor. Verifique su conexión a internet.";
               } else {
                    errorMessage += ` ${error.message}`;
               }

               setError(errorMessage);
          } finally {
               setIsSubmitting(false);
          }
     };

     const isCourseSelectable = (course) => {
          if (selectedCourses.some((c) => c.id === course.id)) {
               return true;
          }

          const totalSelectedCredits = selectedCourses.reduce(
               (sum, c) => sum + c.credits,
               0
          );

          if (selectedCourses.length === 0 && course.credits === 4.5) {
               return true;
          }

          return totalSelectedCredits + course.credits <= maxCredits;
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
                                                  <div className="flex items-center justify-between">
                                                       <p className="text-3xl font-bold text-white mt-2">
                                                            {Math.max(
                                                                 0,
                                                                 totalCredits -
                                                                      selectedCourses.reduce(
                                                                           (
                                                                                sum,
                                                                                c
                                                                           ) =>
                                                                                sum +
                                                                                c.credits,
                                                                           0
                                                                      )
                                                            )}
                                                       </p>
                                                       {selectedCourses.length >
                                                            0 && (
                                                            <p className="text-sm font-medium text-green-400 mt-2">
                                                                 Seleccionados:{" "}
                                                                 {selectedCourses.reduce(
                                                                      (
                                                                           sum,
                                                                           c
                                                                      ) =>
                                                                           sum +
                                                                           c.credits,
                                                                      0
                                                                 )}{" "}
                                                                 / {maxCredits}
                                                            </p>
                                                       )}
                                                  </div>
                                             </div>
                                             <div className="flex items-center justify-center">
                                                  <button
                                                       className={`flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg transform ${
                                                            activeButton ===
                                                            "solicitud"
                                                                 ? "scale-95 bg-blue-800"
                                                                 : "hover:scale-105"
                                                       } hover:shadow-blue-500/20 hover:shadow-lg ${
                                                            selectedCourses.length ===
                                                            0
                                                                 ? "opacity-70 cursor-not-allowed"
                                                                 : ""
                                                       }`}
                                                       onClick={handleOpenModal}
                                                       disabled={
                                                            selectedCourses.length ===
                                                            0
                                                       }
                                                  >
                                                       <FiFileText className="mr-2" />
                                                       Ver solicitud
                                                       {selectedCourses.length >
                                                            0 && (
                                                            <span className="ml-2 bg-white text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                                                                 {
                                                                      selectedCourses.length
                                                                 }
                                                            </span>
                                                       )}
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
                                                                                className={`hover:bg-gray-700/50 transition-colors duration-200 ${
                                                                                     !isCourseSelectable(
                                                                                          course
                                                                                     ) &&
                                                                                     !selectedCourses.some(
                                                                                          (
                                                                                               c
                                                                                          ) =>
                                                                                               c.id ===
                                                                                               course.id
                                                                                     )
                                                                                          ? "opacity-50"
                                                                                          : ""
                                                                                }`}
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
                                                                                     {selectedCourses.some(
                                                                                          (
                                                                                               c
                                                                                          ) =>
                                                                                               c.id ===
                                                                                               course.id
                                                                                     ) ? (
                                                                                          <button
                                                                                               className="flex items-center bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 px-3 py-1 rounded-lg transition-all duration-300"
                                                                                               onClick={() =>
                                                                                                    handleRemoveCourse(
                                                                                                         course.id
                                                                                                    )
                                                                                               }
                                                                                          >
                                                                                               <FiX className="mr-1" />
                                                                                               Quitar
                                                                                          </button>
                                                                                     ) : (
                                                                                          <button
                                                                                               className={`flex items-center ${
                                                                                                    isCourseSelectable(
                                                                                                         course
                                                                                                    )
                                                                                                         ? "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300"
                                                                                                         : "bg-gray-600/10 text-gray-400 cursor-not-allowed"
                                                                                               } px-3 py-1 rounded-lg transition-all duration-300 ${
                                                                                                    activeButton ===
                                                                                                    `recover-${course.id}`
                                                                                                         ? "scale-95 bg-blue-600/30"
                                                                                                         : "hover:translate-x-1"
                                                                                               }`}
                                                                                               onClick={() =>
                                                                                                    isCourseSelectable(
                                                                                                         course
                                                                                                    ) &&
                                                                                                    handleRecoverCourse(
                                                                                                         course
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
                                                                                     )}
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
                                                                 className={`bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-300 ${
                                                                      !isCourseSelectable(
                                                                           course
                                                                      ) &&
                                                                      !selectedCourses.some(
                                                                           (
                                                                                c
                                                                           ) =>
                                                                                c.id ===
                                                                                course.id
                                                                      )
                                                                           ? "opacity-50"
                                                                           : ""
                                                                 }`}
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
                                                                 {selectedCourses.some(
                                                                      (c) =>
                                                                           c.id ===
                                                                           course.id
                                                                 ) ? (
                                                                      <button
                                                                           className="w-full flex items-center justify-center bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-300"
                                                                           onClick={() =>
                                                                                handleRemoveCourse(
                                                                                     course.id
                                                                                )
                                                                           }
                                                                      >
                                                                           <FiX className="mr-2" />
                                                                           Quitar
                                                                           selección
                                                                      </button>
                                                                 ) : (
                                                                      <button
                                                                           className={`w-full flex items-center justify-center ${
                                                                                isCourseSelectable(
                                                                                     course
                                                                                )
                                                                                     ? "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300"
                                                                                     : "bg-gray-600/10 text-gray-400 cursor-not-allowed"
                                                                           } px-3 py-2 rounded-lg transition-all duration-300 ${
                                                                                activeButton ===
                                                                                `recover-mobile-${course.id}`
                                                                                     ? "scale-95 bg-blue-600/30"
                                                                                     : ""
                                                                           }`}
                                                                           onClick={() =>
                                                                                isCourseSelectable(
                                                                                     course
                                                                                ) &&
                                                                                handleRecoverCourse(
                                                                                     course
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
                                                                 )}
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

               {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                         <div
                              className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                         >
                              <div className="p-6 md:p-8">
                                   <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl md:text-2xl font-bold text-white">
                                             Solicitud de Recuperación
                                        </h2>
                                        <button
                                             onClick={() => setShowModal(false)}
                                             className="text-gray-400 hover:text-white transition-colors"
                                        >
                                             <FiX size={24} />
                                        </button>
                                   </div>

                                   <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                             <div className="bg-gray-800 rounded-lg p-6 mb-6">
                                                  <h3 className="text-lg font-medium text-white mb-4">
                                                       Información del
                                                       Estudiante
                                                  </h3>
                                                  <div className="space-y-3">
                                                       <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                 Nombre completo
                                                            </label>
                                                            <div className="bg-gray-700 p-3 rounded-lg text-white">
                                                                 {profile?.name ||
                                                                      "No disponible"}
                                                            </div>
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                 Correo
                                                                 electrónico
                                                            </label>
                                                            <div className="bg-gray-700 p-3 rounded-lg text-white">
                                                                 {profile?.email ||
                                                                      "No disponible"}
                                                            </div>
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                 Correo
                                                                 destinatario
                                                            </label>
                                                            <div className="bg-gray-700 p-3 rounded-lg text-white">
                                                                 lmanzo@vallegrande.edu.pe
                                                            </div>
                                                       </div>
                                                       <div>
                                                            <label className="block text-sm text-gray-400 mb-1">
                                                                 Periodo
                                                                 académico
                                                            </label>
                                                            <div className="bg-gray-700 p-3 rounded-lg text-white">
                                                                 {selectedCourses[0]
                                                                      ?.codePeriod ||
                                                                      "No disponible"}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>

                                             <div className="bg-gray-800 rounded-lg p-6">
                                                  <h3 className="text-lg font-medium text-white mb-4">
                                                       Mensaje
                                                  </h3>
                                                  <div>
                                                       <label className="block text-sm text-gray-400 mb-1">
                                                            Mensaje para el
                                                            profesor{" "}
                                                            <span className="text-red-400">
                                                                 *
                                                            </span>
                                                       </label>
                                                       <textarea
                                                            className={`bg-gray-700 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 h-32 ${
                                                                 messageError
                                                                      ? "border border-red-500"
                                                                      : ""
                                                            }`}
                                                            placeholder="Escribe un mensaje detallando el motivo de tu solicitud..."
                                                            value={message}
                                                            onChange={(e) => {
                                                                 setMessage(
                                                                      e.target
                                                                           .value
                                                                 );
                                                                 if (
                                                                      e.target.value.trim()
                                                                 )
                                                                      setMessageError(
                                                                           ""
                                                                      );
                                                            }}
                                                       ></textarea>
                                                       {messageError && (
                                                            <p className="text-red-400 text-xs mt-1">
                                                                 {messageError}
                                                            </p>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>

                                        <div>
                                             <div className="bg-gray-800 rounded-lg p-6">
                                                  <h3 className="text-lg font-medium text-white mb-4">
                                                       Cursos a Recuperar
                                                  </h3>

                                                  {selectedCourses.length >
                                                  0 ? (
                                                       <div className="space-y-4">
                                                            {selectedCourses.map(
                                                                 (
                                                                      course,
                                                                      idx
                                                                 ) => (
                                                                      <div
                                                                           key={`modal-course-${course.id}`}
                                                                           className="bg-gray-700 rounded-lg p-4 relative"
                                                                      >
                                                                           <div className="flex justify-between mb-2">
                                                                                <span className="font-mono text-sm bg-gray-600 px-2 py-1 rounded text-gray-300">
                                                                                     {
                                                                                          course.shortName
                                                                                     }
                                                                                </span>
                                                                                <button
                                                                                     onClick={() =>
                                                                                          handleRemoveCourse(
                                                                                               course.id
                                                                                          )
                                                                                     }
                                                                                     className="text-gray-400 hover:text-red-400 transition-colors"
                                                                                >
                                                                                     <FiTrash2
                                                                                          size={
                                                                                               18
                                                                                          }
                                                                                     />
                                                                                </button>
                                                                           </div>
                                                                           <h4 className="font-medium text-white mb-3">
                                                                                {
                                                                                     course.name
                                                                                }
                                                                           </h4>
                                                                           <div className="grid grid-cols-3 gap-2 text-sm">
                                                                                <div>
                                                                                     <span className="text-gray-400 block">
                                                                                          Semestre
                                                                                     </span>
                                                                                     <span className="text-emerald-400">
                                                                                          {toRoman(
                                                                                               course.semester
                                                                                          )}
                                                                                     </span>
                                                                                </div>
                                                                                <div>
                                                                                     <span className="text-gray-400 block">
                                                                                          Créditos
                                                                                     </span>
                                                                                     <span className="text-blue-400">
                                                                                          {
                                                                                               course.credits
                                                                                          }
                                                                                     </span>
                                                                                </div>
                                                                                <div>
                                                                                     <span className="text-gray-400 block">
                                                                                          Costo
                                                                                     </span>
                                                                                     <span className="text-white">
                                                                                          S/.{" "}
                                                                                          {course.cost.toFixed(
                                                                                               2
                                                                                          )}
                                                                                     </span>
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 )
                                                            )}

                                                            <div className="border-t border-gray-700 mt-6 pt-4">
                                                                 <div className="flex justify-between text-sm mb-2">
                                                                      <span className="text-gray-400">
                                                                           Total
                                                                           de
                                                                           créditos:
                                                                      </span>
                                                                      <span className="text-blue-400 font-medium">
                                                                           {selectedCourses.reduce(
                                                                                (
                                                                                     sum,
                                                                                     course
                                                                                ) =>
                                                                                     sum +
                                                                                     course.credits,
                                                                                0
                                                                           )}
                                                                      </span>
                                                                 </div>
                                                                 <div className="flex justify-between font-medium">
                                                                      <span className="text-gray-300">
                                                                           Costo
                                                                           total:
                                                                      </span>
                                                                      <span className="text-white">
                                                                           S/.{" "}
                                                                           {selectedCourses
                                                                                .reduce(
                                                                                     (
                                                                                          sum,
                                                                                          course
                                                                                     ) =>
                                                                                          sum +
                                                                                          course.cost,
                                                                                     0
                                                                                )
                                                                                .toFixed(
                                                                                     2
                                                                                )}
                                                                      </span>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  ) : (
                                                       <div className="text-center p-6 text-gray-400">
                                                            No hay cursos
                                                            seleccionados
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   </div>

                                   <div className="mt-8 flex justify-end space-x-4">
                                        <button
                                             onClick={handleCancel}
                                             className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                             Cancelar
                                        </button>
                                        <button
                                             onClick={handleSubmit}
                                             disabled={
                                                  isSubmitting ||
                                                  selectedCourses.length === 0
                                             }
                                             className={`px-6 py-3 ${
                                                  isSubmitting
                                                       ? "bg-blue-700 cursor-not-allowed"
                                                       : "bg-blue-600 hover:bg-blue-700"
                                             } text-white rounded-lg transition-colors flex items-center justify-center min-w-32`}
                                        >
                                             {isSubmitting ? (
                                                  <>
                                                       <svg
                                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                       >
                                                            <circle
                                                                 className="opacity-25"
                                                                 cx="12"
                                                                 cy="12"
                                                                 r="10"
                                                                 stroke="currentColor"
                                                                 strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                 className="opacity-75"
                                                                 fill="currentColor"
                                                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                       </svg>
                                                       Enviando...
                                                  </>
                                             ) : (
                                                  <>
                                                       Enviar solicitud
                                                       <FiArrowRight className="ml-2" />
                                                  </>
                                             )}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
               {notification && (
                    <Notification
                         message={notification.message}
                         type={notification.type}
                         onClose={() => setNotification(null)}
                    />
               )}
          </div>
     );
};

export default StudentCourses;
