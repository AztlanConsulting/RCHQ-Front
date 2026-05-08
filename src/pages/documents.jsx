import { useParams } from "react-router-dom";
import DocumentsSection from "../components/organism/documentsSection";
import { useDocuments } from "../hooks/organism/useDocuments";

const Documents = () => {
  const { employeeId } = useParams();
  const documentsState = useDocuments(employeeId);

  return <DocumentsSection {...documentsState} />;
};

export default Documents;