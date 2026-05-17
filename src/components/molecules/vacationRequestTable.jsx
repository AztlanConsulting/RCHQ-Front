import VacationRequestRow from "./vacationRequestRow";

const VacationRequestTable = ({
    requests,
    view,
    loading,
    onViewDetail,
}) => {
    if (loading && !requests.length) {
        return (
            <section className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                Cargando solicitudes...
            </section>
        );
    }

    if (!requests.length) {
        return (
            <section className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                No hay solicitudes de vacaciones para mostrar
            </section>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[920px]">
                <thead className="border-b border-gray-200 bg-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            Foto
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            Nombre Completo
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            CURP
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            Inicio
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            Término
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            Días hábiles
                        </th>
                        {view === "reviewed" && (
                            <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                                Estado
                            </th>
                        )}
                        <th className="px-6 py-4 text-center text-sm font-bold text-[#121212]">
                            Acciones
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {requests.map((request) => (
                        <VacationRequestRow
                            key={request.vacationRequestId}
                            request={request}
                            view={view}
                            onViewDetail={onViewDetail}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VacationRequestTable;
