import { createPortal } from "react-dom";
import EmployeeAvatar from "./employeeAvatar";
import { useEmployeeSearchSelect } from "../../hooks/atoms/useEmployeeSearchSelect";

const searchIcon = "/search.svg";
const closeIcon = "/close.svg";

const EmployeeSearchSelect = ({
    employees = [],
    selected = [],
    onSelect,
    onRemove,
    onSearch,
    placeholder = "Buscar empleado...",
    label = "Empleados",
}) => {
    const {
        query,
        isOpen,
        dropdownPos,
        containerRef,
        dropdownRef,
        filteredEmployees,
        handleInputChange,
        openDropdown,
        handleSelect,
    } = useEmployeeSearchSelect({
        employees,
        selected,
        onSearch,
        onSelect,
    });

    return (
        <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-bold text-[#374151]">{label}</label>

            <div ref={containerRef} className="relative">
                <div className="h-[50px] flex items-center bg-neutral-50 rounded-lg shadow-[inset_0px_4px_4px_#00000040]">
                    <img
                        src={searchIcon}
                        alt=""
                        aria-hidden="true"
                        className="ml-3 w-4 h-4 flex-shrink-0 opacity-50"
                    />

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={openDropdown}
                        onClick={openDropdown}
                        placeholder={placeholder}
                        className="flex-1 h-full ml-2 mr-3 bg-transparent border-0 outline-none text-sm font-medium text-[#222] placeholder-[#aaaaaa]"
                    />
                </div>

                {isOpen &&
                    createPortal(
                        <div
                            ref={dropdownRef}
                            style={{
                                position: "fixed",
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                                width: dropdownPos.width,
                                zIndex: 9999,
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                overflow: "hidden",
                            }}
                        >
                            {filteredEmployees.length > 0 ? (
                                <div
                                    style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {filteredEmployees.map((emp) => (
                                        <button
                                            key={emp.employeeId}
                                            type="button"
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onClick={() => handleSelect(emp)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f3f4f6] text-left transition-colors"
                                        >
                                            <EmployeeAvatar
                                                picture={emp.picture}
                                                fullName={emp.fullName}
                                                className="w-8 h-8"
                                            />
                                            <span className="text-sm font-medium text-[#121212] truncate">
                                                {emp.fullName}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : query.length > 0 ? (
                                <div className="px-3 py-3">
                                    <span className="text-sm text-[#9ca3af]">
                                        No se encontraron empleados
                                    </span>
                                </div>
                            ) : null}
                        </div>,
                        document.body,
                    )}
            </div>

            {selected.length > 0 && (
                <div
                    className="flex flex-col gap-1.5"
                    style={
                        selected.length > 3
                            ? { maxHeight: "162px", overflowY: "auto" }
                            : undefined
                    }
                >
                    {selected.map((emp) => (
                        <div
                            key={emp.employeeId}
                            className="flex items-center gap-3 px-3 bg-neutral-50 rounded-lg shadow-[inset_0px_4px_4px_#00000040]"
                            style={{ height: "50px", flexShrink: 0 }}
                        >
                            <EmployeeAvatar
                                picture={emp.picture}
                                fullName={emp.fullName}
                                className="w-8 h-8"
                            />

                            <span className="text-sm font-medium text-[#121212] truncate flex-1">
                                {emp.fullName}
                            </span>

                            <button
                                type="button"
                                onClick={() => onRemove(emp.employeeId)}
                                aria-label={`Remover a ${emp.fullName}`}
                                className="w-5 h-5 rounded-full bg-[#d1d5db] hover:bg-[#9ca3af] flex-shrink-0 transition-colors ml-auto flex items-center justify-center p-0"
                            >
                                <img
                                    src={closeIcon}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-3 h-3"
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeSearchSelect;
