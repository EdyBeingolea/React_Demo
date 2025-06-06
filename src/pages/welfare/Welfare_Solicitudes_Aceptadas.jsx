import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch, FiArrowRight, FiCheck, FiX } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import SidebarWalfare from "../../components/welfare/SidebarWalfare";
import LoadingSpinner from "../../components/animations/LoadingSpinner";

const Notification = ({ message, type = "success", onClose }) => {
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in z-50`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <FiX />
      </button>
    </div>
  );
};

const WalfareSolicitudesAceptadas = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Cargar solo las solicitudes autorizados
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/recovery-requests/filtered?status=autorizado`
        );
        console.log("Respuesta solicitudes:", response.data); // <-- Agrega esto

        // Ajusta según la estructura real de la respuesta
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setRequests(data);
        setFilteredRequests(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError(
          "Error al cargar las solicitudes autorizados. Intente nuevamente."
        );
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Filtrar solicitudes por término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = requests.filter(
        (request) =>
          request.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.document_number.includes(searchTerm) ||
          request.correlative.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchTerm, requests]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleProcessRequest = async (action, requestId) => {
    try {
      let endpoint = "";
      let successMessage = "";

      if (action === "approve") {
        endpoint = `${
          import.meta.env.VITE_BACKEND_URL
        }/recovery-requests/${requestId}/authorize`;
        successMessage = "Solicitud aprobada exitosamente";
      } else {
        endpoint = `${
          import.meta.env.VITE_BACKEND_URL
        }/recovery-requests/${requestId}/reject`;
        successMessage = "Solicitud rechazada exitosamente";
      }

      const response = await axios.post(endpoint);

      if (response.data.success) {
        // Eliminar la solicitud procesada de la lista
        setRequests(requests.filter((req) => req.id !== requestId));

        setNotification({
          message: successMessage,
          type: "success",
        });

        setShowModal(false);
      } else {
        throw new Error(
          response.data.error || "Error al procesar la solicitud"
        );
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setNotification({
        message:
          error.response?.data?.error || "Error al procesar la solicitud",
        type: "error",
      });
    } finally {
      setNotification({ message: successMessage, type: "success" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      autorizado: "bg-green-500/20 text-green-400",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          statusClasses[status] || "bg-gray-500/20 text-gray-400"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen text-gray-100 bg-gray-950">
      <SidebarWalfare />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <main className="max-w-7xl mx-auto">
            <div className="text-center md:text-left mb-10">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Solicitudes Autorizadas
              </h1>
              <p className="text-gray-300 text-lg md:text-xl">
                Revisión y aprobación de solicitudes de recuperación autorizas
              </p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar por estudiante o correlativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Correlativo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-700/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                            {request.correlative}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {request.student_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {request.document_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            S/ {request.total_cost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="text-blue-400 hover:text-blue-300 flex items-center justify-end w-full"
                            >
                              Ver <FiArrowRight className="ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-sm text-gray-400"
                        >
                          No se encontraron solicitudes autorizados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Detalles de Solicitud
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Información del Estudiante
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Nombre
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg text-white">
                          {selectedRequest.student_name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Documento
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg text-white">
                          {selectedRequest.document_number}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Email
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg text-white">
                          {selectedRequest.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Información de la Solicitud
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Correlativo
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg text-white font-mono">
                          {selectedRequest.correlative}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Estado
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg">
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Monto Total
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg text-white">
                          S/ {selectedRequest.total_cost.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Mensaje
                        </label>
                        <div className="bg-gray-700 p-3 rounded-lg text-white min-h-[100px]">
                          {selectedRequest.message || "Sin mensaje"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-gray-800 rounded-lg p-6 h-full">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Unidades Didácticas (
                      {selectedRequest.didactic_units?.length || 0})
                    </h3>

                    {selectedRequest.didactic_units?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedRequest.didactic_units.map((unit, index) => (
                          <div
                            key={index}
                            className="bg-gray-700 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">
                                {unit.unit_name || "Unidad no disponible"}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-400">Semestre:</span>
                                <span className="block text-emerald-400">
                                  {unit.semester}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 text-gray-400">
                        No se encontraron unidades didácticas en esta solicitud
                      </div>
                    )}
                  </div>
                </div>
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
export default WalfareSolicitudesAceptadas;
