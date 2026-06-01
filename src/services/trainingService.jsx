import { secureFetch } from "../utils/secureFetchWrapper";
import { calendarItemToDetail } from "../utils/calendarEventDetail";

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.field = data?.field;
  return errorMessage;
};

export const getTrainingsService = async (employeeId) => {
  const response = await secureFetch(`/event/trainings/${employeeId}`);
  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(
      response,
      data,
      "Error al obtener las capacitaciones",
    );
  }

  return {
    ...data,
    data: (data?.data?.trainings ?? []).map(calendarItemToDetail),
  };
};
