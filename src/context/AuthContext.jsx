import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    clearAuthStorage,
    getStoredUser,
    getToken,
    setStoredUser,
    setToken,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(() => getToken());
    const [user, setUserState] = useState(() => getStoredUser());

    useEffect(() => {
        setTokenState(getToken());
        setUserState(getStoredUser());
    }, []);

    const login = ({ token: newToken, user: newUser = null }) => {
        setToken(newToken);
        setTokenState(newToken);

        if (newUser) {
            setStoredUser(newUser);
            setUserState(newUser);
        }
    };

    const logout = () => {
        clearAuthStorage();
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
        [token, user]
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