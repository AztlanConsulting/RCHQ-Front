import { secureFetch } from "../utils/secureFetchWrapper";

const TRAINING_COLOR = "#D58936";

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.field = data?.field;
  return errorMessage;
};

const mapTrainingToDetail = (training) => ({
  ...training,
  eventId: training.eventId ?? training.personalEventId,
  title: training.title ?? training.name,
  eventType: training.eventType ?? training.type ?? "Capacitaciones",
  focus: training.focus ?? "eventos",
  focusLabel: training.focusLabel ?? "Eventos",
  scope: training.scope ?? "personal",
  scopeLabel: training.scopeLabel ?? "Personal",
  backgroundColor: training.backgroundColor ?? training.color ?? TRAINING_COLOR,
  borderColor: training.borderColor ?? training.color ?? TRAINING_COLOR,
  peopleInsideEvent: training.peopleInsideEvent ?? [],
});

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
    data: (data?.data?.trainings ?? []).map(mapTrainingToDetail),
  };
};
