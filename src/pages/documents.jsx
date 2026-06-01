import { useParams } from "react-router-dom";
import DocumentsSection from "../components/organism/documentsSection";
import TrainingsSection from "../components/organism/trainingsSection";
import { useDocuments } from "../hooks/organism/useDocuments";
import { useTrainings } from "../hooks/organism/useTrainings";

const Documents = () => {
  const { employeeId } = useParams();
  const documentsState = useDocuments(employeeId);
  const trainingsState = useTrainings(employeeId);

  return (
    <div className="flex flex-col gap-10">
      <DocumentsSection {...documentsState} />
      <TrainingsSection
        trainings={trainingsState.trainings}
        loadingTrainings={trainingsState.loadingTrainings}
        fetchError={trainingsState.fetchError}
        onFetchErrorClose={trainingsState.clearFetchError}
        selectedTraining={trainingsState.selectedTraining}
        onOpenTraining={trainingsState.openTrainingDetail}
        onCloseTraining={trainingsState.closeTrainingDetail}
        viewerRole={trainingsState.viewerRole}
        calendarTimeZone={trainingsState.calendarTimeZone}
        emptyMessage="Aun no tienes capacitaciones registradas."
      />
    </div>
  );
};

export default Documents;
