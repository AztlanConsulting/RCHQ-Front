import { getToken } from "./authStorage";
import { refreshSessionService } from "../services/sessionService";

let refreshPromise = null;

const SESSION_EXPIRED_RESPONSE = () =>
  new Response(JSON.stringify({ message: "Sesion expirada" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });

const buildUrl = (input) => {
  const base = import.meta.env.VITE_API_URL ?? "";

  return typeof input === "string" && input.startsWith("/")
    ? `${base}${input}`
    : input;
};

const buildRequestInit = (init, headers) => ({
  ...init,
  headers,
  credentials: init.credentials ?? "include",
});

const getSharedRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshSessionService()
      .then((refreshData) => {
        const newToken = refreshData?.data?.token;
        if (!newToken) {
          throw new Error("Token no recibido tras la renovacion de la sesion.");
        }

        window.dispatchEvent(
          new CustomEvent("auth:token-refreshed", { detail: newToken }),
        );

        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const retryWithToken = (url, init, headers, token) => {
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, buildRequestInit(init, headers));
};

export async function secureFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const url = buildUrl(input);
  const initialToken = getToken();

  if (initialToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${initialToken}`);
  }

  let response = await fetch(url, buildRequestInit(init, headers));

  if (response.status !== 401 || init.skipAuthRedirect) {
    return response;
  }

  const currentToken = getToken();
  if (!currentToken) {
    return response;
  }

  if (currentToken !== initialToken) {
    return retryWithToken(url, init, headers, currentToken);
  }

  try {
    const refreshedToken = await getSharedRefreshPromise();
    response = await retryWithToken(url, init, headers, refreshedToken);
  } catch {
    window.dispatchEvent(new Event("auth:forced-logout"));
    return SESSION_EXPIRED_RESPONSE();
  }

  return response;
}
