const TOKEN_KEYS = {
  session: "token",
  firstLogin: "FIRST_LOGIN",
  preTwoFactorAuth: "preTwoFactorAuth",
};

const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEYS.session);
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEYS.session, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
};

export const getFirstLoginToken = () =>
  localStorage.getItem(TOKEN_KEYS.firstLogin);
export const setFirstLoginToken = (token) => {
  localStorage.setItem(TOKEN_KEYS.firstLogin, token);
};

export const removeFirstLoginToken = () => {
  localStorage.removeItem(TOKEN_KEYS.firstLogin);
};

export const getPreTwoFactorAuthToken = () =>
  localStorage.getItem(TOKEN_KEYS.preTwoFactorAuth);
export const setPreTwoFactorAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEYS.preTwoFactorAuth, token);
};

export const removePreTwoFactorAuthToken = () => {
  localStorage.removeItem(TOKEN_KEYS.preTwoFactorAuth);
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
  removePreTwoFactorAuthToken();
  removeStoredUser();
};

export const hasToken = () => Boolean(getToken());
