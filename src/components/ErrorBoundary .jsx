import { Component } from "react";

class ErrorBoundary extends Component {
     constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
     }

     static getDerivedStateFromError(error) {
          return { hasError: true, error };
     }

     componentDidCatch(error, errorInfo) {
          console.error("Error Boundary capturó:", error, errorInfo);
     }

     handleRetry = () => {
          this.setState({ hasError: false, error: null });
          window.location.reload();
     };

     render() {
          if (this.state.hasError) {
               return (
                    <div className="p-6 text-red-600">
                         <h2 className="text-xl font-bold mb-2">
                              Algo salió mal
                         </h2>
                         <p className="mb-4">{this.state.error.message}</p>
                         <button
                              onClick={this.handleRetry}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                         >
                              Reintentar
                         </button>
                    </div>
               );
          }

          return this.props.children;
     }
}

export default ErrorBoundary;
