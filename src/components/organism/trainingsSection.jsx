import Alert from "../atoms/alerts";
import Type from "../atoms/type";
import ModalShell from "./modalShell";
import EventDetail from "../molecules/calendarCards/eventDetail";
import TrainingCard from "../molecules/trainingCard";

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
