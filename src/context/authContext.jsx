import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../utils/authStorage";
import { logoutService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getStoredUser());

  useEffect(() => {
    setTokenState(getToken());
    setUserState(getStoredUser());
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => logout();
    window.addEventListener("auth:forced-logout", handleForcedLogout);
    return () =>
      window.removeEventListener("auth:forced-logout", handleForcedLogout);
  }, [logout]);

  useEffect(() => {
    const handleTokenRefreshed = (e) => setTokenState(e.detail);
    const handleStorageChange = (e) => {
      if (e.key === "token") setTokenState(e.newValue);
    };

    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback(({ token: newToken, user: newUser = null }) => {
    setToken(newToken);
    setTokenState(newToken);

    if (newUser) {
      setStoredUser(newUser);
      setUserState(newUser);
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }

  return context;
};
