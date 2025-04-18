// Configuración de Google API
export const googleConfig = {
     clientId: import.meta.env.VITE_GCP_CLIENT_ID,
     scopes: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/gmail.send'
     ].join(' '),
     hostedDomain: "vallegrande.edu.pe"
};

// Inicializar cliente de Google con soporte para refresh token
export const initGoogleClient = (onSuccess, onError) => {
     if (!window.google) throw new Error("Google API client not loaded");

     return window.google.accounts.oauth2.initTokenClient({
          client_id: googleConfig.clientId,
          scope: googleConfig.scopes,
          callback: (tokenResponse) => {
               if (tokenResponse?.access_token) {
                    const tokenData = {
                         ...tokenResponse,
                         expiry: Date.now() + (tokenResponse.expires_in * 1000),
                         scopes: googleConfig.scopes.split(' '),
                         // Generar un ID único para esta sesión
                         sessionId: generateSessionId()
                    };
                    storeTokens(tokenData);
                    onSuccess(tokenData);
               }
          },
          error_callback: (error) => {
               console.error("Google Auth Error:", error);
               onError(error);
          },
          hosted_domain: googleConfig.hostedDomain,
          prompt: 'consent',
          // Forzar obtención de nuevo refresh token
          include_granted_scopes: false,
          // Solicitar offline access para obtener refresh token
          access_type: 'offline'
     });
};

// Generar un ID único para cada sesión
const generateSessionId = () => {
     return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Almacenar tokens con verificación de sesión
export const storeTokens = (tokenResponse) => {
     const tokenData = {
          ...tokenResponse,
          expiry: Date.now() + (tokenResponse.expires_in * 1000),
          storedAt: Date.now(),
          sessionId: tokenResponse.sessionId || generateSessionId()
     };

     // Eliminar tokens anteriores antes de almacenar los nuevos
     clearTokens();

     localStorage.setItem('google_token', JSON.stringify(tokenData));
     return tokenData;
};

// Obtener tokens almacenados con verificación de sesión
export const getStoredTokens = () => {
     const tokenData = localStorage.getItem('google_token');
     return tokenData ? JSON.parse(tokenData) : null;
};

// Función para refrescar el token de acceso
export const refreshAccessToken = async (refreshToken) => {
     try {
          const response = await axios.post('https://oauth2.googleapis.com/token', {
               client_id: googleConfig.clientId,
               client_secret: import.meta.env.VITE_GCP_CLIENT_SECRET,
               refresh_token: refreshToken,
               grant_type: 'refresh_token'
          });

          return {
               access_token: response.data.access_token,
               expires_in: response.data.expires_in,
               scope: response.data.scope,
               token_type: response.data.token_type,
               expiry: Date.now() + (response.data.expires_in * 1000)
          };
     } catch (error) {
          console.error("Error refreshing token:", error);
          throw error;
     }
};

// Limpiar todos los tokens
export const clearTokens = () => {
     localStorage.removeItem('google_token');
     sessionStorage.removeItem('google_token');
     document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
