import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
     clearTokens,
     exchangeCodeForTokens,
     getStoredTokens,
     refreshAccessToken,
     startGoogleAuth,
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

     const location = useLocation();
     const navigate = useNavigate();

     const verifyAndRefreshToken = async (tokenData) => {
          if (!tokenData || !tokenData.access_token) {
               throw new Error("No hay datos de token disponibles");
          }

          try {
               const response = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${tokenData.access_token}`
               );

               if (response.data && !response.data.error) {
                    return tokenData;
               }
          } catch (error) {
               console.log(
                    "Token expirado o inválido, intentando refrescar..."
               );

               if (tokenData.refresh_token) {
                    try {
                         const newTokenData = await refreshAccessToken(
                              tokenData.refresh_token
                         );
                         const updatedTokens = {
                              ...tokenData,
                              ...newTokenData,
                              refresh_token: tokenData.refresh_token,
                         };
                         storeTokens(updatedTokens);
                         return updatedTokens;
                    } catch (refreshError) {
                         console.error(
                              "Error al refrescar token:",
                              refreshError
                         );
                         clearTokens();
                         throw refreshError;
                    }
               }

               clearTokens();
               throw new Error(
                    "Token expirado y no hay refresh token disponible"
               );
          }
     };

     const processAuthCode = async (code) => {
          try {
               setAuthState((prev) => ({ ...prev, loading: true }));
               const tokenData = await exchangeCodeForTokens(code);
               await fetchUserData(tokenData);

               const redirectAfter =
                    sessionStorage.getItem("auth_redirect_after") ||
                    "/dashboard";
               sessionStorage.removeItem("auth_redirect_after");
               navigate(redirectAfter, { replace: true });
          } catch (error) {
               console.error("Error procesando código de autorización:", error);
               await completeLogout();
               setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: "Error al procesar la autenticación",
               }));
               navigate("/", { replace: true });
          }
     };

     useEffect(() => {
          if (location.pathname === "/auth/callback") {
               const params = new URLSearchParams(location.search);
               const code = params.get("code");
               const state = params.get("state");
               const error = params.get("error");

               if (error) {
                    console.error("Error de autenticación de Google:", error);
                    setAuthState((prev) => ({
                         ...prev,
                         loading: false,
                         error: "Error en la autenticación de Google",
                    }));
                    navigate("/", { replace: true });
                    return;
               }

               const savedState = sessionStorage.getItem("auth_state");
               if (state !== savedState) {
                    console.error("Estado inválido, posible ataque CSRF");
                    setAuthState((prev) => ({
                         ...prev,
                         loading: false,
                         error: "Error de seguridad en la autenticación",
                    }));
                    navigate("/", { replace: true });
                    return;
               }

               if (code) {
                    processAuthCode(code);
               }
          } else {
               const loadAuthState = async () => {
                    const tokenData = getStoredTokens();
                    if (tokenData) {
                         try {
                              const validTokenData =
                                   await verifyAndRefreshToken(tokenData);
                              await fetchUserData(validTokenData);
                         } catch (error) {
                              console.error("Error de autenticación:", error);
                              await completeLogout();
                              setAuthState((prev) => ({
                                   ...prev,
                                   loading: false,
                              }));
                         }
                    } else {
                         setAuthState((prev) => ({ ...prev, loading: false }));
                    }
               };

               loadAuthState();
          }

          const checkTokenInterval = setInterval(() => {
               const tokens = getStoredTokens();
               if (tokens?.access_token) {
                    verifyAndRefreshToken(tokens).catch(() => {
                         logout();
                    });
               }
          }, 5 * 60 * 1000);

          return () => clearInterval(checkTokenInterval);
     }, [location.pathname]);

     const fetchUserData = async (tokenData) => {
          try {
               const userRes = await axios.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                         headers: {
                              Authorization: `Bearer ${tokenData.access_token}`,
                         },
                    }
               );

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
               await completeLogout();

               startGoogleAuth();
          } catch (error) {
               await completeLogout();
               setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error.message || "Error al iniciar sesión",
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
          navigate("/", { replace: true });
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
