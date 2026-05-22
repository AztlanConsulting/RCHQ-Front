import { secureFetch } from "../utils/secureFetchWrapper";
import CalendarUtils from "../utils/calendar.utils";

const API_URL = import.meta.env.VITE_API_URL;

const parseJson = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const validationMessage = data.errors?.[0]?.message;
    throw new Error(
      validationMessage ||
      data.message ||
      "No se pudo completar la operación de vacaciones",
    );
  }

  if (data.success === false) {
    throw new Error(data.message || "Error en la respuesta del servidor");
  }

  return data;
};

class VacationService {
  static async getPending({ page = 1, limit = 6, search = "", startDate = "", endDate = "" }) {
    const query = CalendarUtils.buildVacationRequestQuery({ page, limit, search, startDate, endDate });
    const res = await secureFetch(`${API_URL}/vacation/requests/pending?${query}`, {
      method: "GET",
    });
    return CalendarUtils.parseVacationRequestsResponse(res);
  }

  static async getReviewed({ page = 1, limit = 6, search = "", startDate = "", endDate = "", status = "all" }) {
    const query = CalendarUtils.buildVacationRequestQuery({ page, limit, search, startDate, endDate, status });
    const res = await secureFetch(`${API_URL}/vacation/requests/reviewed?${query}`, {
      method: "GET",
    });
    return CalendarUtils.parseVacationRequestsResponse(res);
  }

  static async approve(vacationRequestId) {
    const res = await secureFetch(
      `${API_URL}/vacation/request/${vacationRequestId}/approve`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
    return CalendarUtils.parseVacationRequestActionResponse(res);
  }

  static async reject(vacationRequestId) {
    const res = await secureFetch(
      `${API_URL}/vacation/request/${vacationRequestId}/reject`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
    return CalendarUtils.parseVacationRequestActionResponse(res);
  }

  static async getVacationEmployees() {
    const res = await secureFetch(`${API_URL}/vacation/employees/eligible`, {
      method: "GET",
    });
    const data = await parseJson(res);
    return data?.data?.employees ?? [];
  }

  static async getRemainingVacations(employeeId) {
    const res = await secureFetch(`${API_URL}/vacation/remaining/${employeeId}`, {
      method: "GET",
    });
    const data = await parseJson(res);
    return {
      remainingVacations: data?.data?.remainingVacations ?? 0,
      startDate: data?.data?.startDate ?? "",
      endDate: data?.data?.endDate ?? "",
    };
  }

  static async registerEmployeeVacation({ employeeId, startDate, endDate }) {
    const res = await secureFetch(
      `${API_URL}/vacation/employees/${employeeId}/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      },
    );
    const data = await parseJson(res);
    return data?.data?.vacationRequest ?? null;
  }
}

export const getVacationEmployees = (...args) => VacationService.getVacationEmployees(...args);
export const getRemainingVacations = (...args) => VacationService.getRemainingVacations(...args);
export const registerEmployeeVacation = (...args) => VacationService.registerEmployeeVacation(...args);

export default VacationService;
