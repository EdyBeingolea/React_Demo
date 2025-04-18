import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import {
     clearTokens,
     getStoredTokens,
     initGoogleClient,
     storeTokens,
} from "../lib/googleAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
     const [authState, setAuthState] = useState({
          user: null,
          profile: null,
          tokens: null,
          loading: true,
          error: null,
          isAuthenticated: false,
     });

     const verifyToken = async (accessToken) => {
          try {
               const response = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
               );
               return response.data && !response.data.error;
          } catch (error) {
               return false;
          }
     };

     useEffect(() => {
          const loadAuthState = async () => {
               const tokenData = getStoredTokens();
               if (tokenData) {
                    const isValid = await verifyToken(tokenData.access_token);
                    if (isValid) {
                         await fetchUserData(tokenData);
                    } else {
                         await completeLogout();
                    }
               } else {
                    setAuthState((prev) => ({ ...prev, loading: false }));
               }
          };

          loadAuthState();
     }, []);

     const fetchUserData = async (tokenData) => {
          try {
               // Obtener datos de usuario de Google
               const userRes = await axios.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                         headers: {
                              Authorization: `Bearer ${tokenData.access_token}`,
                         },
                    }
               );

               // Obtener datos del backend
               const backendRes = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/users/by-email`,
                    {
                         params: { email: userRes.data.email },
                         headers: {
                              Authorization: `Bearer ${tokenData.access_token}`,
                         },
                    }
               );

               setAuthState({
                    user: {
                         ...userRes.data,
                         accessToken: tokenData.access_token,
                    },
                    profile: backendRes.data,
                    tokens: tokenData,
                    loading: false,
                    error: null,
                    isAuthenticated: true,
               });
          } catch (error) {
               await completeLogout();
               setAuthState((prev) => ({
                    ...prev,
                    error: error.message,
                    loading: false,
               }));
          }
     };

     const completeLogout = async () => {
          const tokenData = getStoredTokens();
          if (tokenData?.access_token) {
               try {
                    // Revocar token de Google
                    await axios.post(
                         "https://oauth2.googleapis.com/revoke",
                         null,
                         {
                              params: { token: tokenData.access_token },
                              headers: {
                                   "Content-Type":
                                        "application/x-www-form-urlencoded",
                              },
                         }
                    );
               } catch (error) {
                    console.error("Error al revocar token:", error);
               }
          }
          clearTokens();
     };

     const login = async () => {
          setAuthState((prev) => ({ ...prev, loading: true, error: null }));

          try {
               const client = initGoogleClient(
                    async (tokenResponse) => {
                         const tokenData = storeTokens(tokenResponse);
                         await fetchUserData(tokenData);
                    },
                    (error) => {
                         throw new Error(
                              error.message || "Error en autenticación"
                         );
                    }
               );
               client.requestAccessToken();
          } catch (error) {
               await completeLogout();
               setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error.message,
               }));
          }
     };

     const logout = async () => {
          await completeLogout();
          setAuthState({
               user: null,
               profile: null,
               tokens: null,
               loading: false,
               error: null,
               isAuthenticated: false,
          });
          window.location.href = "/";
     };

     return (
          <AuthContext.Provider value={{ ...authState, login, logout }}>
               {children}
          </AuthContext.Provider>
     );
};

export function useAuth() {
     return useContext(AuthContext);
}
