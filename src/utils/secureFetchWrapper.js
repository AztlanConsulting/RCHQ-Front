import { getToken, clearAuthStorage } from "./authStorage";

const LOGIN_PATH = "/iniciar-sesion";

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

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !init.skipAuthRedirect) {
    clearAuthStorage();
    if (window.location.pathname !== LOGIN_PATH) {
      window.location.replace(LOGIN_PATH);
    }
  }

  return res;
}
