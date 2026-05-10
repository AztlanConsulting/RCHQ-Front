import { useNavigate } from "react-router-dom";
import Button          from "../components/atoms/button";
import EmployeeFilters from "../components/molecules/employeeFilters";
import EmployeeTable   from "../components/organism/employeeTable";
import Pagination      from "../components/molecules/pagination";
import EmployeeRow     from "../components/molecules/employeeRow";
import EmployeeAvatar  from "../components/atoms/employeeAvatar";
import StatusBadge     from "../components/atoms/statusBadge";
import showEyeIcon     from "/showEye.svg";
import { useEmployees } from "../hooks/pages/useGetAllEmployees";

const EMPLOYEE_COLUMNS = ["Foto", "Nombre Completo", "Puesto", "Estado", "Acciones"];

const Personal = () => {
  const navigate = useNavigate();
  const {
    employees, pagination, loading, error,
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    page, handleNextPage, handlePrevPage,
  } = useEmployees();

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-bold text-4xl text-[#121212]">Usuarios de la casa</h1>
        <Button
          text="Añadir nuevo usuario"
          onClick={() => navigate("/app/personal/nuevo")}
          bgColor="bg-[#24375e]"
          hoverColor="hover:bg-[#162d4a]"
          activeColor="active:bg-[#0f2035]"
          textColor="text-white"
          width="w-auto"
          className="px-6"
        />
      </div>

      <EmployeeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <EmployeeTable
        employees={employees}
        loading={loading}
        error={error}
        columns={EMPLOYEE_COLUMNS}
        renderRow={(employee, i) => (
          <EmployeeRow
            key={employee.employeeId ?? i}
            cells={[
              {
                key: "avatar",
                content: <EmployeeAvatar picture={employee.picture} fullName={employee.fullName} />,
              },
              { key: "name",   content: <p className="font-medium text-[#121212]">{employee.fullName}</p> },
              { key: "role",   content: employee.role,   className: "text-[#666666]" },
              { key: "status", content: <StatusBadge isActive={employee.status} /> },
            ]}
            actions={
              <button
                onClick={() => navigate(`/app/personal/ver/${employee.employeeId}`)}
                className="text-gray-600 hover:text-[#24375e] transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                aria-label="Ver empleado" title="Ver detalles"
              >
                <img src={showEyeIcon} alt="Ver" className="w-5 h-5" />
              </button>
            }
          />
        )}
      />

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        loading={loading}
        hasEmployees={employees.length > 0}
      />
    </div>
  );
};

export default Personal;