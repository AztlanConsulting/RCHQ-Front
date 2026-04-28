import EmployeeRow from "./EmployeeRow";

const EmployeeTable = ({ employees, loading, error }) => {
    if (loading) {
        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center text-gray-500">
                    Cargando empleados...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center text-red-500">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center text-gray-500">
                    No hay empleados disponibles
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-center font-bold text-sm text-[#121212]">
                            Foto
                        </th>
                        <th className="px-6 py-4 text-center font-bold text-sm text-[#121212]">
                            Nombre Completo
                        </th>
                        <th className="px-6 py-4 text-center font-bold text-sm text-[#121212]">
                            Puesto
                        </th>
                        <th className="px-6 py-4 text-center font-bold text-sm text-[#121212]">
                            Estado
                        </th>
                        <th className="px-6 py-4 text-center font-bold text-sm text-[#121212]">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee, index) => (
                        <EmployeeRow key={index} employee={employee} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;
