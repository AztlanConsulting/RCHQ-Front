const TOKEN_KEYS = {
  session: "token",
  firstLogin: "FIRST_LOGIN",
  pre2fa: "PRE_2FA",
};

const USER_KEY = "user";

// Tokens de sesión
export const getToken = () => localStorage.getItem(TOKEN_KEYS.session);
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEYS.session, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
};

// Tokens de primer login
export const getFirstLoginToken = () =>
  localStorage.getItem(TOKEN_KEYS.firstLogin);
export const setFirstLoginToken = (token) => {
  localStorage.setItem(TOKEN_KEYS.firstLogin, token);
};

export const removeFirstLoginToken = () => {
  localStorage.removeItem(TOKEN_KEYS.firstLogin);
};

// Tokens de pre-2fa
export const getPre2faToken = () => localStorage.getItem(TOKEN_KEYS.pre2fa);
export const setPre2faToken = (token) => {
  localStorage.setItem(TOKEN_KEYS.pre2fa, token);
};

export const removePre2faToken = () => {
  localStorage.removeItem(TOKEN_KEYS.pre2fa);
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
  removeFirstLoginToken();
  removePre2faToken();
  removeStoredUser();
};

export const hasToken = () => Boolean(getToken());
