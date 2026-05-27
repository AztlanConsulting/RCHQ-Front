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
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const base = import.meta.env.VITE_API_URL ?? "";
  const url = typeof input === "string" && input.startsWith("/")
    ? `${base}${input}`
    : input;

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !init.skipAuthRedirect) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshData = await refreshSessionService();
        token = refreshData?.data?.token;
        
        processQueue(null, token);
        
        headers.set("Authorization", `Bearer ${token}`);
        res = await fetch(url, { ...init, headers });
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        window.dispatchEvent(new Event("auth:forced-logout"));
        
        if (window.location.pathname !== LOGIN_PATH) {
          window.location.replace(LOGIN_PATH);
        }
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
        .catch((err) => {
          return res;
        });
    }
  }

  return res;
}
