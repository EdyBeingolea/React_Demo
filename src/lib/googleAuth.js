export const googleConfig = {
     clientId: import.meta.env.VITE_GCP_CLIENT_ID,
     scopes: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/gmail.send'
     ].join(' '),
     hostedDomain: "vallegrande.edu.pe",
     redirectUri: window.location.origin + "/auth/callback"
};

export const startGoogleAuth = () => {
     if (!window.google) throw new Error("Google API client not loaded");

     sessionStorage.setItem('auth_redirect_after', window.location.pathname);

     const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

     authUrl.searchParams.append('client_id', googleConfig.clientId);
     authUrl.searchParams.append('redirect_uri', googleConfig.redirectUri);
     authUrl.searchParams.append('response_type', 'code');
     authUrl.searchParams.append('scope', googleConfig.scopes);
     authUrl.searchParams.append('access_type', 'offline');
     authUrl.searchParams.append('prompt', 'consent');
     authUrl.searchParams.append('include_granted_scopes', 'false');
     authUrl.searchParams.append('hd', googleConfig.hostedDomain);

     const state = generateSessionId();
     sessionStorage.setItem('auth_state', state);
     authUrl.searchParams.append('state', state);

     window.location.href = authUrl.toString();
};

export const exchangeCodeForTokens = async (code) => {
     try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
               },
               body: new URLSearchParams({
                    code,
                    client_id: googleConfig.clientId,
                    client_secret: import.meta.env.VITE_GCP_CLIENT_SECRET,
                    redirect_uri: googleConfig.redirectUri,
                    grant_type: 'authorization_code'
               })
          });

          if (!response.ok) {
               throw new Error('Error exchanging code for tokens');
          }

          const tokenData = await response.json();

          const storedTokens = {
               ...tokenData,
               expiry: Date.now() + (tokenData.expires_in * 1000),
               scopes: googleConfig.scopes.split(' '),
               sessionId: generateSessionId(),
               storedAt: Date.now()
          };

          storeTokens(storedTokens);
          return storedTokens;
     } catch (error) {
          console.error("Error exchanging code for tokens:", error);
          throw error;
     }
};

const generateSessionId = () => {
     return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const storeTokens = (tokenResponse) => {
     const tokenData = {
          ...tokenResponse,
          expiry: Date.now() + (tokenResponse.expires_in * 1000),
          storedAt: Date.now(),
          sessionId: tokenResponse.sessionId || generateSessionId()
     };

     clearTokens();

     localStorage.setItem('google_token', JSON.stringify(tokenData));
     return tokenData;
};

export const getStoredTokens = () => {
     const tokenData = localStorage.getItem('google_token');
     return tokenData ? JSON.parse(tokenData) : null;
};

export const refreshAccessToken = async (refreshToken) => {
     try {
          console.log("Intentando refrescar token con:", {
               client_id: googleConfig.clientId,
               refresh_token: refreshToken ? refreshToken.substring(0, 5) + "..." : "no disponible"
          });

          if (!refreshToken) {
               throw new Error("No hay refresh token disponible");
          }

          const response = await fetch('https://oauth2.googleapis.com/token', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
               },
               body: new URLSearchParams({
                    client_id: googleConfig.clientId,
                    client_secret: import.meta.env.VITE_GCP_CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
               })
          });

          const responseData = await response.json();

          if (!response.ok) {
               console.error("Error en respuesta:", responseData);
               clearTokens();
               throw new Error(`Error refreshing token: ${responseData.error_description || responseData.error || 'Unknown error'}`);
          }

          return {
               access_token: responseData.access_token,
               expires_in: responseData.expires_in,
               scope: responseData.scope,
               token_type: responseData.token_type,
               expiry: Date.now() + (responseData.expires_in * 1000)
          };
     } catch (error) {
          console.error("Error al refrescar token:", error);
          clearTokens();
          throw error;
     }
};

export const clearTokens = () => {
     localStorage.removeItem('google_token');
     sessionStorage.removeItem('google_token');
     sessionStorage.removeItem('auth_state');
     sessionStorage.removeItem('auth_redirect_after');
     document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
