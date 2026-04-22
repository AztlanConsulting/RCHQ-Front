// apiFetch.js — concept only
import { getToken, clearAuthStorage } from "./authStorage";

const LOGIN_PATH = "/iniciar-sesion";

export async function secureFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && !init.skipAuthRedirect) {
    clearAuthStorage();
    if (window.location.pathname !== LOGIN_PATH) {
      window.location.replace(LOGIN_PATH);
    }
  }

  return res;
}