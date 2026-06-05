import Alert from "../atoms/alerts";
import Type from "../atoms/type";
import ModalShell from "./modalShell";
import EventDetail from "../molecules/calendarCards/eventDetail";
import TrainingCard from "../molecules/trainingCard";
import ConfirmDeleteModal from "../molecules/confirmDeleteModal";

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
  canRemove = false,
  trainingToRemove,
  isRemoving,
  removeError,
  onOpenRemoveConfirm,
  onCloseRemoveConfirm,
  onConfirmRemove,
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
              onRemove={canRemove ? () => onOpenRemoveConfirm(training) : undefined}
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

      {trainingToRemove ? (
        <ConfirmDeleteModal
          label={trainingToRemove.title ?? "esta capacitación"}
          mode="delete"
          loading={isRemoving}
          title="Quitar de capacitación"
          body={
            <>
              ¿Seguro que quieres quitar a este empleado de{" "}
              <span className="font-semibold text-slate-700">
                {trainingToRemove.title ?? "esta capacitación"}
              </span>
              ? Solo se eliminará la asignación; la capacitación y los demás
              empleados no se verán afectados.
              {removeError ? (
                <span className="mt-2 block rounded-md bg-red-50 px-3 py-2 text-red-600">
                  {removeError}
                </span>
              ) : null}
            </>
          }
          onCancel={onCloseRemoveConfirm}
          onConfirm={onConfirmRemove}
        />
      ) : null}
    </section>
  );
};

export default TrainingsSection;
