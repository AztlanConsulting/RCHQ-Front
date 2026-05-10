import { useNavigate } from "react-router-dom";
import EmployeeTable      from "../components/organism/employeeTable";
import EmployeeFilters    from "../components/molecules/employeeFilters";
import Pagination         from "../components/molecules/pagination";
import TextField          from "../components/atoms/textField";
import SelectField        from "../components/atoms/selectField";
import Button             from "../components/atoms/button";
import Type               from "../components/atoms/type";
import EmployeeRow        from "../components/molecules/employeeRow";
import EmployeeAvatar     from "../components/atoms/employeeAvatar";
import AbsenceDetailModal from "../components/molecules/absenceDetailModal";
import { useAbsences }    from "../hooks/organism/useAbsences";

const API_URL = import.meta.env.VITE_API_URL;

const ABSENCE_COLUMNS = [
  "Foto", "Nombre completo", "Casa hogar",
  "Día de inicio", "Día de término",
  "Evidencia", "Tipo de ausencia", "Acciones",
];

const STATUS_OPTIONS = [
  { value: "con", label: "Con evidencia" },
  { value: "sin", label: "Sin evidencia" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

// ── Íconos inline ──────────────────────────────────────────────────
const IconDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconPDF = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
  </svg>
);
// ──────────────────────────────────────────────────────────────────

const AbsencesPage = () => {
  const navigate = useNavigate();
  const {
    absences, loading, error,
    page, totalPages, total,
    goNextPage, goPrevPage,
    filtersEnabled, toggleFilters,
    searchName,     setSearchName,
    filterStatus,   setFilterStatus,
    filterHouse,    setFilterHouse,
    filterEvidence, setFilterEvidence,
    filterStart,    setFilterStart,
    filterEnd,      setFilterEnd,
    selectedAbsence, openDetail, closeDetail,
  } = useAbsences();

  return (
    <div className="flex flex-col gap-4 text-black">

      {/* Título + botón */}
      <div className="flex items-center justify-between">
        <Type variant="page-title" as="h1">Ausencias de todas las casas</Type>
        <Button
          text="Mis ausencias"
          onClick={() => navigate("/app/ausencias/mis-ausencias")}
          bgColor="bg-[#24375e]" hoverColor="hover:bg-[#162d4a]"
          activeColor="active:bg-[#0f2035]" textColor="text-white"
          width="w-auto" height="h-[42px]" textSize="text-sm"
          fontWeight="font-semibold" className="px-5"
        />
      </div>

      {/* Filtros */}
      <EmployeeFilters
        searchQuery={searchName}     setSearchQuery={setSearchName}
        searchLabel="Buscar por Nombre" searchPlaceholder="Nombre del empleado"
        activeFilter={filterStatus}  setActiveFilter={setFilterStatus}
        statusLabel="Filtrar por  status" statusOptions={STATUS_OPTIONS}
      >
        <TextField
          id="filter-house" text="Filtrar por Casa Hogar"
          placeholder="Nombre de la casa" value={filterHouse}
          setValue={setFilterHouse} labelClassName="text-sm font-bold text-[#121212]"
        />
        <SelectField
          label="Filtrar por  evidencia" name="evidence"
          value={filterEvidence} onChange={(e) => setFilterEvidence(e.target.value)}
          options={STATUS_OPTIONS} labelColor="text-[#121212]"
        />
        <TextField
          id="filter-start" type="date" text="Filtrar por fecha de inicio"
          value={filterStart} setValue={setFilterStart}
          labelClassName="text-sm font-bold text-[#121212]"
        />
        <TextField
          id="filter-end" type="date" text="Filtrar por fecha de fin"
          value={filterEnd} setValue={setFilterEnd}
          labelClassName="text-sm font-bold text-[#121212]"
        />
        <div className="flex items-end gap-3 lg:col-span-2">
          <Button
            text="Aplicar filtros"
            bgColor="bg-[#24375e]" hoverColor="hover:bg-[#162d4a]"
            activeColor="active:bg-[#0f2035]" textColor="text-white"
            width="w-36" height="h-[42px]" textSize="text-sm" fontWeight="font-semibold"
          />
          <Button
            text={filtersEnabled ? "Deshabilitar filtros" : "Habilitar filtros"}
            onClick={toggleFilters}
            bgColor="bg-transparent" hoverColor="hover:bg-gray-100"
            activeColor="active:bg-gray-200" textColor="text-[#444]"
            width="w-auto" height="h-[42px]" textSize="text-sm"
            fontWeight="font-medium" className="px-4 border border-gray-300"
          />
        </div>
      </EmployeeFilters>

      {/* Tabla */}
      <EmployeeTable
        employees={absences}
        loading={loading}
        error={error}
        columns={ABSENCE_COLUMNS}
        emptyMessage="No hay ausencias registradas"
        loadingMessage="Cargando ausencias..."
        renderRow={(absence, i) => (
          <EmployeeRow
            key={absence.absence_id ?? i}
            cells={[
              {
                key: "avatar",
                content: (
                  <EmployeeAvatar
                    picture={absence.employee?.picture}
                    fullName={absence.employee?.name}
                  />
                ),
              },
              { key: "name",  content: absence.employee?.name ?? "—" },
              { key: "house", content: absence.employee?.house?.name ?? "—", className: "text-[#666666]" },
              { key: "start", content: formatDate(absence.start) },
              { key: "end",   content: formatDate(absence.end) },
              {
                key: "evidence",
                content: absence.url ? (
                  <a
                    href={`${API_URL}/${absence.url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#24375e] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
                  >
                    <IconPDF />
                    PDF
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">No tiene evidencia</span>
                ),
              },
              { key: "type", content: absence.absenceType ?? "—" },
            ]}
            actions={
              <>
                <button
                  onClick={() => {/* onDelete */}}
                  className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  aria-label="Eliminar" title="Eliminar"
                >
                  <IconDelete />
                </button>
                <button
                  onClick={() => {/* onEdit */}}
                  className="text-gray-500 hover:text-[#24375e] transition-colors p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Editar" title="Editar"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => openDetail(absence)}
                  className="text-gray-500 hover:text-[#24375e] transition-colors p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Ver detalles" title="Ver detalles"
                >
                  <IconEye />
                </button>
              </>
            }
          />
        )}
      />

      {/* Paginación */}
      <Pagination
        page={page} totalPages={totalPages} total={total}
        onPrevPage={goPrevPage} onNextPage={goNextPage}
        loading={loading} hasEmployees={absences.length > 0}
        itemLabel="ausencias"
      />

      {/* Modal */}
      <AbsenceDetailModal absence={selectedAbsence} onClose={closeDetail} />
    </div>
  );
};

export default AbsencesPage;