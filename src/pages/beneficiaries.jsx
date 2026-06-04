import { useNavigate } from "react-router-dom";
import BigButton from "../components/atoms/bigButton";
// import EmployeeFilters from "../components/molecules/employeeFilters";
// import EmployeeTable from "../components/molecules/employeeTable";
import Pagination from "../components/molecules/pagination";
// import BlacklistModal from "../components/molecules/blacklistModal";
// import RemoveFromBlacklistModal from "../components/molecules/removeFromBlacklistModal";
import Alert from "../components/atoms/alerts";
// import usePersonal from "../hooks/pages/usePersonal";
import warningSvg from "/error.svg";

const Personal = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8 md:flex md:flex-col md:h-full">
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <h1 className="font-bold text-3xl md:text-4xl text-[#121212]">Beneficiarios</h1>
                <BigButton
                    text="Añadir"
                    onClick={() => navigate("/app/beneficiarios/nuevo")}
                    className="min-w-0"
                />
            </div>

            <EmployeeFilters
                searchQuery={activeSearchQuery}
                setSearchQuery={activeSetSearchQuery}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                isBlacklistMode={isBlacklistMode}
                onToggleBlacklistMode={handleToggleBlacklistMode}
                isBlacklistedFilter={isBlacklistedFilter}
                setIsBlacklistedFilter={setIsBlacklistedFilter}
            />

            {isBlacklistMode && (
                <BlacklistBanner
                    className="hidden md:flex mb-2"
                />
            )}

            {alert && (
                <div className="mb-2">
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        icon={warningSvg}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}

            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto">
                <EmployeeTable
                    employees={activeEmployees}
                    loading={activeLoading}
                    error={activeError}
                    isBlacklistMode={isBlacklistMode}
                    onAddToBlacklist={handleAddToBlacklist}
                    onRemoveFromBlacklist={handleRemoveFromBlacklist}
                />
            </div>

            <Pagination
                page={activePage}
                totalPages={activePagination.totalPages}
                total={activePagination.total}
                onPrevPage={activePrevPage}
                onNextPage={activeNextPage}
                loading={activeLoading}
                hasItems={activePagination.total > 0}
            />

            <BlacklistModal
                isOpen={isModalOpen}
                employeeName={selectedEmployee?.fullName ?? ""}
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
                isSubmitting={isSubmitting}
            />

            <RemoveFromBlacklistModal
                isOpen={isRemoveModalOpen}
                employeeName={selectedEmployee?.fullName ?? ""}
                onConfirm={handleRemoveModalConfirm}
                onCancel={handleRemoveModalCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default Personal;
