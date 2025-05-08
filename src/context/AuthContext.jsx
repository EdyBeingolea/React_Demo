import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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

const PUBLIC_ROUTES = [
     "/",
     "/login",
     "/auth/callback",
     "/register",
     "/contact",
     "/about",
];

export const AuthProvider = ({ children }) => {
     const [authState, setAuthState] = useState({
          user: null,
          profile: null,
          tokens: null,
          loading: true,
          error: null,
          isAuthenticated: false,
          isLoggingOut: false,
     });

     const location = useLocation();
     const navigate = useNavigate();
     const tokenRefreshTimerRef = useRef(null);

     const verifyAndRefreshToken = async (tokenData) => {
          if (!tokenData || !tokenData.access_token) {
               throw new Error("No hay datos de token disponibles");
          }

          try {
               const response = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${tokenData.access_token}`
               );

               if (response.data && !response.data.error) {
                    scheduleTokenRefresh(tokenData);
                    return tokenData;
               }
          } catch (error) {
               console.log(
                    "Token expirado o inválido, intentando refrescar...",
                    error
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
                         await storeTokens(updatedTokens);

                         scheduleTokenRefresh(updatedTokens);
                         return updatedTokens;
                    } catch (refreshError) {
                         console.error(
                              "Error al refrescar token:",
                              refreshError
                         );
                         await clearTokens();
                         throw refreshError;
                    }
               }

               await clearTokens();
               throw new Error(
                    "Token expirado y no hay refresh token disponible"
               );
          }
     };

     const scheduleTokenRefresh = (tokenData) => {
          if (tokenRefreshTimerRef.current) {
               clearTimeout(tokenRefreshTimerRef.current);
          }

          const hourInMs = 60 * 60 * 1000;
          const timeUntilExpiry = tokenData.expiry - Date.now() - 5 * 60 * 1000;
          const refreshTime = Math.min(
               hourInMs,
               Math.max(30000, timeUntilExpiry)
          );

          console.log(
               `Programando refresh de token en ${Math.round(
                    refreshTime / 60000
               )} minutos`
          );

          tokenRefreshTimerRef.current = setTimeout(async () => {
               try {
                    if (tokenData.refresh_token) {
                         console.log("Ejecutando refresh programado de token");
                         const newTokenData = await refreshAccessToken(
                              tokenData.refresh_token
                         );
                         const updatedTokens = {
                              ...tokenData,
                              ...newTokenData,
                              refresh_token: tokenData.refresh_token,
                         };
                         await storeTokens(updatedTokens);

                         setAuthState((prev) => ({
                              ...prev,
                              tokens: updatedTokens,
                         }));

                         scheduleTokenRefresh(updatedTokens);
                    }
               } catch (error) {
                    console.error("Error en refresh programado:", error);
                    logout();
               }
          }, refreshTime);
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

     const checkRouteAccess = () => {
          const currentPath = location.pathname;
          const isPublicRoute = PUBLIC_ROUTES.some(
               (route) =>
                    currentPath === route || currentPath.startsWith(route + "/")
          );

          if (
               !isPublicRoute &&
               !authState.isAuthenticated &&
               !authState.loading
          ) {
               console.log(
                    "Redirigiendo a login - ruta protegida:",
                    currentPath
               );
               sessionStorage.setItem("auth_redirect_after", currentPath);
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
                    try {
                         const tokenData = await getStoredTokens();
                         if (tokenData) {
                              try {
                                   const validTokenData =
                                        await verifyAndRefreshToken(tokenData);
                                   await fetchUserData(validTokenData);
                              } catch (error) {
                                   console.error(
                                        "Error de autenticación:",
                                        error
                                   );
                                   await completeLogout();
                                   setAuthState((prev) => ({
                                        ...prev,
                                        loading: false,
                                   }));
                              }
                         } else {
                              setAuthState((prev) => ({
                                   ...prev,
                                   loading: false,
                              }));
                         }
                    } catch (error) {
                         console.error(
                              "Error al cargar estado de autenticación:",
                              error
                         );
                         setAuthState((prev) => ({ ...prev, loading: false }));
                    }
               };

               loadAuthState();
          }

          return () => {
               if (tokenRefreshTimerRef.current) {
                    clearTimeout(tokenRefreshTimerRef.current);
               }
          };
     }, [location.pathname]);

     useEffect(() => {
          checkRouteAccess();
     }, [location.pathname, authState.isAuthenticated, authState.loading]);

     useEffect(() => {
          const handleAppReload = async () => {
               const tokenData = await getStoredTokens();
               if (!tokenData) {
                    const currentPath = window.location.pathname;
                    const isPublicRoute = PUBLIC_ROUTES.some(
                         (route) =>
                              currentPath === route ||
                              currentPath.startsWith(route + "/")
                    );

                    if (!isPublicRoute) {
                         console.log(
                              "Sesión inválida en recarga, redirigiendo a login"
                         );
                         sessionStorage.setItem(
                              "auth_redirect_after",
                              currentPath
                         );
                         window.location.href = "/";
                    }
               }
          };

          window.addEventListener("load", handleAppReload);
          return () => window.removeEventListener("load", handleAppReload);
     }, []);

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
          try {
               const tokenData = await getStoredTokens();
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

               if (tokenRefreshTimerRef.current) {
                    clearTimeout(tokenRefreshTimerRef.current);
                    tokenRefreshTimerRef.current = null;
               }

               await clearTokens();
          } catch (error) {
               console.error("Error en completeLogout:", error);
          }
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
          setAuthState((prev) => ({
               ...prev,
               isLoggingOut: true,
          }));

          try {
               await completeLogout();
               setAuthState({
                    user: null,
                    profile: null,
                    tokens: null,
                    loading: false,
                    error: null,
                    isAuthenticated: false,
                    isLoggingOut: false,
               });
               navigate("/", { replace: true });
          } catch (error) {
               console.error("Error during logout:", error);
               setAuthState((prev) => ({
                    ...prev,
                    isLoggingOut: false,
               }));
          }
     };

     return (
          <AuthContext.Provider
               value={{
                    ...authState,
                    login,
                    logout,
                    isLoggingOut: authState.isLoggingOut,
               }}
          >
               {children}
          </AuthContext.Provider>
     );
};

export function useAuth() {
     return useContext(AuthContext);
}
