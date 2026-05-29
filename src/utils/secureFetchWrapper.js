import { getToken, clearAuthStorage } from "./authStorage";
import { refreshSessionService } from "../services/authService";

const LOGIN_PATH = "/iniciar-sesion";
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function secureFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  let token = getToken();

  const base = import.meta.env.VITE_API_URL ?? "";
  const url = typeof input === "string" && input.startsWith("/")
    ? `${base}${input}`
    : input;

  if (isRefreshing && !init.skipAuthRedirect) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((newToken) => {
      headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(url, { ...init, headers });
    });
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !init.skipAuthRedirect) {
    const currentToken = getToken();
    if (currentToken && currentToken !== token) {
      headers.set("Authorization", `Bearer ${currentToken}`);
      return fetch(url, { ...init, headers });
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshData = await refreshSessionService();
        token = refreshData?.data?.token;

        if (!token) {
          throw new Error("Token no recibido tras la renovación de la sesión.");
        }
        
        window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: token }));
        processQueue(null, token);
        
        headers.set("Authorization", `Bearer ${token}`);
        res = await fetch(url, { ...init, headers });
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.dispatchEvent(new Event("auth:forced-logout"));
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          headers.set("Authorization", `Bearer ${newToken}`);
          return fetch(url, { ...init, headers });
        })
        .catch((error) => {
          throw error;
        });
    }
  }

  return res;
}
