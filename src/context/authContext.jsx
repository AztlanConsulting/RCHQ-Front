import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AuthUtils from "../utils/auth.utils";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => AuthUtils.getToken());
  const [user, setUserState] = useState(() => AuthUtils.getStoredUser());

  useEffect(() => {
    setTokenState(AuthUtils.getToken());
    setUserState(AuthUtils.getStoredUser());
  }, []);

  const login = ({ token: newToken, user: newUser = null }) => {
    AuthUtils.setToken(newToken);
    setTokenState(newToken);

    if (newUser) {
      AuthUtils.setStoredUser(newUser);
      setUserState(newUser);
    }
  };

  const logout = () => {
    AuthUtils.clearAuthStorage();
    setTokenState(null);
    setUserState(null);
  };

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
