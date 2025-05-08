// googleAuth.js - Versión segura

import CryptoJS from 'crypto-js';

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

// Clave de encriptación derivada del dominio y otros factores
const getEncryptionKey = () => {
     const domain = window.location.hostname;
     const browserInfo = navigator.userAgent;
     const baseKey = `${domain}-${browserInfo.substring(0, 10)}`;
     return CryptoJS.SHA256(baseKey).toString();
};

// Encripta los datos del token antes de almacenarlos
const encryptData = (data) => {
     const key = getEncryptionKey();
     return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

// Desencripta los datos del token
const decryptData = (encryptedData) => {
     try {
          const key = getEncryptionKey();
          const bytes = CryptoJS.AES.decrypt(encryptedData, key);
          return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
     } catch (error) {
          console.error("Error al desencriptar datos", error);
          return null;
     }
};

// Almacena tokens en IndexedDB de forma encriptada
export const storeTokens = async (tokenResponse) => {
     const tokenData = {
          ...tokenResponse,
          expiry: Date.now() + (tokenResponse.expires_in * 1000),
          storedAt: Date.now(),
          sessionId: tokenResponse.sessionId || generateSessionId(),
          refreshScheduled: Date.now() + (55 * 60 * 1000) // Programar refresh 5 min antes de expiración
     };

     await clearTokens();

     // Encriptar datos
     const encryptedData = encryptData(tokenData);

     // Almacenar en IndexedDB
     return new Promise((resolve, reject) => {
          const request = indexedDB.open("secureAuthStorage", 1);

          request.onupgradeneeded = (event) => {
               const db = event.target.result;
               if (!db.objectStoreNames.contains("tokens")) {
                    db.createObjectStore("tokens", { keyPath: "id" });
               }
          };

          request.onsuccess = (event) => {
               const db = event.target.result;
               const transaction = db.transaction(["tokens"], "readwrite");
               const store = transaction.objectStore("tokens");

               const storeRequest = store.put({
                    id: "google_token",
                    value: encryptedData,
                    timestamp: Date.now()
               });

               storeRequest.onsuccess = () => resolve(tokenData);
               storeRequest.onerror = (e) => reject(e.target.error);
          };

          request.onerror = (event) => reject(event.target.error);
     });
};

// Obtiene los tokens almacenados
export const getStoredTokens = async () => {
     return new Promise((resolve, reject) => {
          const request = indexedDB.open("secureAuthStorage", 1);

          request.onupgradeneeded = (event) => {
               const db = event.target.result;
               if (!db.objectStoreNames.contains("tokens")) {
                    db.createObjectStore("tokens", { keyPath: "id" });
               }
          };

          request.onsuccess = (event) => {
               const db = event.target.result;
               const transaction = db.transaction(["tokens"], "readonly");
               const store = transaction.objectStore("tokens");

               const getRequest = store.get("google_token");

               getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    if (result && result.value) {
                         try {
                              const decryptedData = decryptData(result.value);
                              resolve(decryptedData);
                         } catch (error) {
                              console.error("Error al desencriptar tokens", error);
                              clearTokens().then(() => resolve(null));
                         }
                    } else {
                         resolve(null);
                    }
               };

               getRequest.onerror = () => resolve(null);
          };

          request.onerror = () => resolve(null);
     });
};

export const clearTokens = async () => {
     return new Promise((resolve) => {
          document.cookie = 'google_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

          sessionStorage.removeItem('google_token');
          sessionStorage.removeItem('auth_state');
          sessionStorage.removeItem('auth_redirect_after');

          localStorage.removeItem('google_token');

          const request = indexedDB.open("secureAuthStorage", 1);

          request.onsuccess = (event) => {
               const db = event.target.result;
               if (db.objectStoreNames.contains("tokens")) {
                    const transaction = db.transaction(["tokens"], "readwrite");
                    const store = transaction.objectStore("tokens");

                    const deleteRequest = store.delete("google_token");
                    deleteRequest.onsuccess = () => resolve();
                    deleteRequest.onerror = () => resolve();
               } else {
                    resolve();
               }
          };

          request.onerror = () => resolve();
     });
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

          await storeTokens(storedTokens);
          return storedTokens;
     } catch (error) {
          console.error("Error exchanging code for tokens:", error);
          throw error;
     }
};

const generateSessionId = () => {
     return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
               await clearTokens();
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
          await clearTokens();
          throw error;
     }
};
