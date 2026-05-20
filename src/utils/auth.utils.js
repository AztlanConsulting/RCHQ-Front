const TOKEN_KEYS = {
  session: "token",
  firstLogin: "FIRST_LOGIN",
  preTwoFactorAuth: "preTwoFactorAuth",
};

const USER_KEY = "user";

class AuthUtils {
  static parseJwtPayload(token) {
    if (!token) return null;

    try {
      const [, payload] = token.split(".");
      if (!payload) return null;

      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "=",
      );
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  static getToken() {
    return localStorage.getItem(TOKEN_KEYS.session);
  }

  static setToken(token) {
    localStorage.setItem(TOKEN_KEYS.session, token);
  }

  static removeToken() {
    localStorage.removeItem(TOKEN_KEYS.session);
  }

  static getFirstLoginToken() {
    return localStorage.getItem(TOKEN_KEYS.firstLogin);
  }

  static setFirstLoginToken(token) {
    localStorage.setItem(TOKEN_KEYS.firstLogin, token);
  }

  static removeFirstLoginToken() {
    localStorage.removeItem(TOKEN_KEYS.firstLogin);
  }

  static getPreTwoFactorAuthToken() {
    return localStorage.getItem(TOKEN_KEYS.preTwoFactorAuth);
  }

  static setPreTwoFactorAuthToken(token) {
    localStorage.setItem(TOKEN_KEYS.preTwoFactorAuth, token);
  }

  static removePreTwoFactorAuthToken() {
    localStorage.removeItem(TOKEN_KEYS.preTwoFactorAuth);
  }

  static getStoredUser() {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  }

  static setStoredUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static removeStoredUser() {
    localStorage.removeItem(USER_KEY);
  }

  static clearAuthStorage() {
    AuthUtils.removeToken();
    AuthUtils.removeFirstLoginToken();
    AuthUtils.removePreTwoFactorAuthToken();
    AuthUtils.removeStoredUser();
  }

  static hasToken() {
    return Boolean(AuthUtils.getToken());
  }

  static getOwnEmployeeId() {
    const userData = AuthUtils.getStoredUser();
    const tokenPayload = AuthUtils.parseJwtPayload(AuthUtils.getToken());
    return userData?.employeeId ?? tokenPayload?.id ?? "";
  }

  static getCalendarViewerRole() {
    const userData = AuthUtils.getStoredUser();
    const tokenPayload = AuthUtils.parseJwtPayload(AuthUtils.getToken());
    return userData?.role ?? userData?.roleName ?? tokenPayload?.role ?? "";
  }
}

export const parseJwtPayload = (token) => AuthUtils.parseJwtPayload(token);
export const getToken = () => AuthUtils.getToken();
export const setToken = (token) => AuthUtils.setToken(token);
export const removeToken = () => AuthUtils.removeToken();
export const getFirstLoginToken = () => AuthUtils.getFirstLoginToken();
export const setFirstLoginToken = (token) => AuthUtils.setFirstLoginToken(token);
export const removeFirstLoginToken = () => AuthUtils.removeFirstLoginToken();
export const getPreTwoFactorAuthToken = () =>
  AuthUtils.getPreTwoFactorAuthToken();
export const setPreTwoFactorAuthToken = (token) =>
  AuthUtils.setPreTwoFactorAuthToken(token);
export const removePreTwoFactorAuthToken = () =>
  AuthUtils.removePreTwoFactorAuthToken();
export const getStoredUser = () => AuthUtils.getStoredUser();
export const setStoredUser = (user) => AuthUtils.setStoredUser(user);
export const removeStoredUser = () => AuthUtils.removeStoredUser();
export const clearAuthStorage = () => AuthUtils.clearAuthStorage();
export const hasToken = () => AuthUtils.hasToken();
export const getOwnEmployeeId = () => AuthUtils.getOwnEmployeeId();
export const getCalendarViewerRole = () => AuthUtils.getCalendarViewerRole();

export default AuthUtils;
