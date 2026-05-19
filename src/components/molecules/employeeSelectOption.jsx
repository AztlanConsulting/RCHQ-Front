import EmployeeAvatar from "../atoms/employeeAvatar";

const EmployeeSelectOption = ({ option, isSelected = false }) => (
    <span className="flex min-w-0 items-center gap-3">
        <EmployeeAvatar
            picture={option.picture}
            fullName={option.label}
            className="h-8 w-8"
        />
        <span
            className={`truncate ${isSelected ? "text-[#222]" : "text-inherit"}`}
        >
            {option.label}
        </span>
    </span>
);

export default EmployeeSelectOption;
