import { buildApiError } from "../utils/apiErrors";
import AuthUtils from "../utils/auth.utils";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

class UpdateEventService {
  static async updateHouseEvent(houseEventId, payload) {
    const token = AuthUtils.getToken();

    if (!token) {
      throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
      `${API_URL}/event/house/${houseEventId}`,
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

export default UpdateEventService;
