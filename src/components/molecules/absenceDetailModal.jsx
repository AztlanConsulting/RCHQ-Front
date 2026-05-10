import DetailModal    from "../molecules/detailModal";
import EmployeeAvatar from "../atoms/employeeAvatar";

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const AbsenceDetailModal = ({ absence, onClose }) => {
  const employee = absence?.employee ?? {};

  return (
    <DetailModal
      isOpen={!!absence}
      onClose={onClose}
      avatar={
        <EmployeeAvatar
          picture={employee.picture}
          fullName={employee.name}
          className="w-16 h-16"
        />
      }
      title={employee.name}
      subtitle={employee.house?.name}
      fields={[
        { label: "Tipo de ausencia", value: absence?.absenceType },
        { label: "Día de inicio",    value: formatDate(absence?.start) },
        { label: "Día de término",   value: formatDate(absence?.end) },
        { label: "Casa hogar",       value: employee.house?.name },
      ]}
      action={
        absence?.url ? (
          <a
            href={`${API_URL}/${absence.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#24375e] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
            </svg>
            Ver PDF
          </a>
        ) : (
          <span className="text-sm text-gray-400">No tiene evidencia</span>
        )
      }
    />
  );
};

export default AbsenceDetailModal;