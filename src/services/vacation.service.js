import { secureFetch } from "../utils/helpers/secureFetchWrapper";
import CalendarUtils from "../utils/calendar.utils";

const API_URL = import.meta.env.VITE_API_URL;

class VacationRequestService {
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
}

export default VacationRequestService;
