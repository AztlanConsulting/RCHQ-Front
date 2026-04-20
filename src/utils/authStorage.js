const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getStoredUser = () => {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
};

export const setStoredUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeStoredUser = () => {
    localStorage.removeItem(USER_KEY);
};

export const clearAuthStorage = () => {
    removeToken();
    removeStoredUser();
};

export const hasToken = () => Boolean(getToken());