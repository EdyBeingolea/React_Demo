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

// Inicializar cliente de Google
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
                         scopes: googleConfig.scopes.split(' ')
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
          prompt: 'consent'
     });
};

// Almacenar tokens
export const storeTokens = (tokenResponse) => {
     const tokenData = {
          ...tokenResponse,
          expiry: Date.now() + (tokenResponse.expires_in * 1000),
          storedAt: Date.now()
     };
     localStorage.setItem('google_token', JSON.stringify(tokenData));
     return tokenData;
};

// Obtener tokens almacenados
export const getStoredTokens = () => {
     const tokenData = localStorage.getItem('google_token');
     return tokenData ? JSON.parse(tokenData) : null;
};

// Limpiar todos los tokens
export const clearTokens = () => {
     // Limpiar todos los almacenamientos posibles
     localStorage.removeItem('google_token');
     sessionStorage.removeItem('google_token');
     document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
