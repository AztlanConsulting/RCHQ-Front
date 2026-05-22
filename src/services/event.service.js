import { secureFetch } from "../utils/secureFetchWrapper";
import AuthUtils from "../utils/auth.utils";
import { buildApiError } from "../utils/apiErrors";

const BASE_URL = import.meta.env.VITE_API_URL;

export class APIError extends Error {
  constructor(message, status, body = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.body = body;
  }
}

class EventService {
  static async createHouseEvent(payload) {
    const token = AuthUtils.getToken();

    const response = await secureFetch(`${BASE_URL}/event/house/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok && response.status !== 409) {
      throw new APIError(
        json?.message ?? "Error al registrar el evento",
        response.status,
        json,
      );
    }

    return json;
  }

  static async getEventTypes() {
    const token = AuthUtils.getToken();

    const response = await secureFetch(`${BASE_URL}/event/getAllTypes`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new APIError("Error al cargar tipos de evento", response.status);
    }

    const json = await response.json();
    return json?.data?.eventTypes ?? [];
  }

  static async getEmployeesForSelector(params = {}) {
    const token = AuthUtils.getToken();

    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/event/personal/employees${query ? `?${query}` : ""}`;

    const response = await secureFetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new APIError(
        json?.message ?? "Error al cargar empleados",
        response.status,
        json,
      );
    }

    return json?.data?.employees ?? [];
  }

  static async createPersonalEvent(payload) {
    const token = AuthUtils.getToken();

    const response = await secureFetch(`${BASE_URL}/event/personal/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok && response.status !== 409) {
      throw new APIError(
        json?.message ?? "Error al registrar el evento personal",
        response.status,
        json,
      );
    }

    return json;
  }
  static async updatePersonalEvent(personalEventId, payload) {
    const token = AuthUtils.getToken();

    if (!token) {
      throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
      `${BASE_URL}/event/personal/${personalEventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok && rawResponse.status !== 409) {
      throw buildApiError(
        rawResponse,
        response,
        "No se pudo modificar el evento personal",
      );
    }

    return response;
  }

  static async updateHouseEvent(houseEventId, payload) {
    const token = AuthUtils.getToken();

    if (!token) {
      throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
      `${BASE_URL}/event/house/${houseEventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok && rawResponse.status !== 409) {
      throw buildApiError(
        rawResponse,
        response,
        "No se pudo modificar el evento de casa",
      );
    }

    return response;
  }
}

export default EventService;
