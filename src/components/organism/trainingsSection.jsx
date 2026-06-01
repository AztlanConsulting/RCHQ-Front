import Alert from "../atoms/alerts";
import Type from "../atoms/type";
import ModalShell from "./modalShell";
import EventDetail from "../molecules/calendarCards/eventDetail";

const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

const formatTrainingDate = (value) => {
  if (!value) return "";

  const matchedDate =
    typeof value === "string" ? value.trim().match(DATE_ONLY_PATTERN) : null;

  const safeDate = matchedDate?.[1]
    ? new Date(`${matchedDate[1]}T00:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(safeDate.getTime())) return "";

  return safeDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const TrainingIcon = () => (
  <svg
    width="40"
    height="48"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="40" height="48" rx="4" fill="#E5E7EB" />
    <path
      d="M8 7a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7Z"
      fill="white"
    />
    <path
      d="M13 15.5h14M13 20h10"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="28" r="5.5" fill="#FDE68A" />
    <path
      d="m20 23.8 1.33 2.7 2.98.43-2.16 2.1.51 2.97L20 30.6 17.34 32l.5-2.97-2.15-2.1 2.98-.43L20 23.8Z"
      fill="#111827"
    />
    <path
      d="M16.5 33.5 15 40l5-2.7L25 40l-1.5-6.5"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const TrainingCard = ({ training, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(training)}
    className="flex h-full w-full flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1F3664]/25"
  >
    <div className="flex h-[140px] w-full items-center justify-center bg-slate-100">
      <TrainingIcon />
    </div>

    <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
      <p className="line-clamp-2 text-sm font-semibold leading-tight text-slate-800">
        {training.title}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {formatTrainingDate(training.date || training.start)}
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-400">
        Impartido por:
      </p>
      <p className="line-clamp-3 text-sm font-medium leading-snug text-slate-500">
        {training.trainer || "Sin informacion"}
      </p>
    </div>
  </button>
);

const TrainingsSection = ({
  trainings,
  loadingTrainings,
  fetchError,
  onFetchErrorClose,
  selectedTraining,
  onOpenTraining,
  onCloseTraining,
  viewerRole,
  calendarTimeZone,
  emptyMessage = "Este empleado aun no tiene capacitaciones.",
}) => {
  return (
    <section className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Capacitaciones</h2>
      </div>

      {fetchError ? (
        <Alert
          type="error"
          message={fetchError}
          onClose={onFetchErrorClose}
        />
      ) : null}

      {loadingTrainings ? (
        <p className="text-sm text-slate-500">Cargando capacitaciones...</p>
      ) : trainings.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {trainings.map((training) => (
            <TrainingCard
              key={training.eventId ?? training.personalEventId}
              training={training}
              onOpen={onOpenTraining}
            />
          ))}
        </div>
      )}

      <ModalShell
        isOpen={Boolean(selectedTraining)}
        onClose={onCloseTraining}
        maxWidth="max-w-[28rem]"
      >
        <div className="flex flex-col gap-4">
          <Type variant="page-title" as="h2" className="text-[1.15rem]">
            Detalle del evento
          </Type>
          <EventDetail
            event={selectedTraining}
            viewerRole={viewerRole}
            calendarTimeZone={calendarTimeZone}
            hideActions
          />
        </div>
      </ModalShell>
    </section>
  );
};

export default TrainingsSection;
