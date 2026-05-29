import { getToken } from "./authStorage";
import { refreshSessionService } from "../services/authService";

const REFRESH_LOCK_NAME = "auth-refresh-lock";
const FALLBACK_LOCK_KEY = "auth-refresh-lock:fallback";
const FALLBACK_LOCK_TTL_MS = 10000;
const FALLBACK_LOCK_POLL_MS = 50;
let isRefreshing = false;
let failedQueue = [];
let fallbackRefreshPromise = null;
let fallbackStorageUsable = true;

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isActiveFallbackLock = (lock) =>
  Boolean(lock?.owner && lock.expiresAt > Date.now());

const readFallbackLock = () => {
  try {
    const rawLock = globalThis.localStorage?.getItem(FALLBACK_LOCK_KEY);
    return rawLock ? JSON.parse(rawLock) : null;
  } catch {
    return null;
  }
};

const hasFallbackStorage = () => {
  try {
    return fallbackStorageUsable && Boolean(globalThis.localStorage);
  } catch {
    return false;
  }
};

const waitForFallbackSignal = (timeoutMs) =>
  new Promise((resolve) => {
    let timeoutId;

    const cleanup = () => {
      clearTimeout(timeoutId);
      globalThis.window?.removeEventListener?.("storage", handleSignal);
      globalThis.window?.removeEventListener?.(
        "auth:token-refreshed",
        handleSignal,
      );
    };

    const handleSignal = () => {
      cleanup();
      resolve();
    };

    timeoutId = setTimeout(handleSignal, timeoutMs);
    globalThis.window?.addEventListener?.("storage", handleSignal);
    globalThis.window?.addEventListener?.(
      "auth:token-refreshed",
      handleSignal,
    );
  });

const waitForTokenFromActiveFallbackLock = async (previousToken) => {
  while (isActiveFallbackLock(readFallbackLock())) {
    const nextToken = getToken();
    if (nextToken && nextToken !== previousToken) return nextToken;

    await waitForFallbackSignal(FALLBACK_LOCK_POLL_MS);
  }

  const nextToken = getToken();
  return nextToken && nextToken !== previousToken ? nextToken : null;
};

const tryAcquireFallbackLock = (owner) => {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return true;

    const now = Date.now();
    const currentLock = readFallbackLock();

    if (isActiveFallbackLock(currentLock) && currentLock.owner !== owner) {
      return false;
    }

    storage.setItem(
      FALLBACK_LOCK_KEY,
      JSON.stringify({ owner, expiresAt: now + FALLBACK_LOCK_TTL_MS }),
    );

    return readFallbackLock()?.owner === owner;
  } catch {
    fallbackStorageUsable = false;
    return true;
  }
};

const releaseFallbackLock = (owner) => {
  try {
    if (readFallbackLock()?.owner === owner) {
      globalThis.localStorage?.removeItem(FALLBACK_LOCK_KEY);
    }
  } catch {
  }
};

const runWithFallbackRefreshLock = async (callback) => {
  if (fallbackRefreshPromise) return fallbackRefreshPromise;

  const previousToken = getToken();
  const tokenFromOtherTab =
    await waitForTokenFromActiveFallbackLock(previousToken);
  if (tokenFromOtherTab) return tokenFromOtherTab;

  const owner = `${Date.now()}-${Math.random()}`;
  let hasLock = false;

  fallbackRefreshPromise = (async () => {
    try {
      while (true) {
        const refreshedToken =
          await waitForTokenFromActiveFallbackLock(previousToken);
        if (refreshedToken) return refreshedToken;

        hasLock = tryAcquireFallbackLock(owner);
        if (!hasLock) {
          await sleep(FALLBACK_LOCK_POLL_MS);
          continue;
        }

        await sleep(FALLBACK_LOCK_POLL_MS);

        if (hasFallbackStorage() && readFallbackLock()?.owner !== owner) {
          hasLock = false;
          continue;
        }

        return await callback();
      }
    } finally {
      if (hasLock) releaseFallbackLock(owner);
      fallbackRefreshPromise = null;
    }
  })();

  return fallbackRefreshPromise;
};

const runWithRefreshLock = async (callback) => {
  const locks = globalThis.navigator?.locks;

  if (typeof locks?.request === "function") {
    return locks.request(REFRESH_LOCK_NAME, callback);
  }

  return runWithFallbackRefreshLock(callback);
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
    }).catch(() => {
      return new Response(JSON.stringify({ message: "Sesión expirada" }), { status: 401 });
    });
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !init.skipAuthRedirect) {
    const currentToken = getToken();
    if (!currentToken) {
      return res;
    }

    if (currentToken && currentToken !== token) {
      headers.set("Authorization", `Bearer ${currentToken}`);
      return fetch(url, { ...init, headers });
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        token = await runWithRefreshLock(async () => {
          const doubleCheckToken = getToken();
          if (doubleCheckToken && doubleCheckToken !== token) return doubleCheckToken;

          const refreshData = await refreshSessionService();
          const newToken = refreshData?.data?.token;
          if (!newToken) throw new Error("Token no recibido tras la renovación de la sesión.");
          
          window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: newToken }));
          return newToken;
        });

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
          return new Response(JSON.stringify({ message: "Sesión expirada" }), { status: 401 });
        });
    }
  }

  return res;
}
