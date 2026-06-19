import {
    EMPLOYEE_CONTRACT_TYPES,
    EMPLOYEE_CONTRACT_TYPE_VALUES,
    normalizeEmployeeContractType,
} from "./employeeContractTypes";

export const PATRONATO_ROLE_NAMES = Object.freeze([
    "Presidente",
    "Vicepresidente",
    "Tesorero",
    "Vocal",
]);

export const ROLE_REQUIRED_CONTRACT_TYPE = Object.freeze({
    Proveedor: "Proveedor",
    Presidente: "Patronato",
    Vicepresidente: "Patronato",
    Tesorero: "Patronato",
    Vocal: "Patronato",
});

export const getRequiredContractTypeForRole = (roleName) =>
    ROLE_REQUIRED_CONTRACT_TYPE[roleName] ?? null;

export const isContractTypeAllowedForRole = (roleName, contractType) => {
    const requiredType = getRequiredContractTypeForRole(roleName);

    if (!requiredType) return true;

    const normalizedType = normalizeEmployeeContractType(contractType);
    return normalizedType === requiredType;
};

export const getAllowedContractTypesForRole = (roleName) => {
    const requiredType = getRequiredContractTypeForRole(roleName);

    if (!requiredType) {
        return EMPLOYEE_CONTRACT_TYPES;
    }

    return EMPLOYEE_CONTRACT_TYPES.filter(
        (contractType) => contractType.value === requiredType,
    );
};

export const resolveContractTypeForRole = (roleName, currentType) => {
    const requiredType = getRequiredContractTypeForRole(roleName);

    if (requiredType) {
        return requiredType;
    }

    if (currentType === null || currentType === undefined || currentType === "") {
        return currentType;
    }

    return normalizeEmployeeContractType(currentType);
};

export const buildRoleContractMismatchMessage = (roleName, requiredType) =>
    `El puesto ${roleName} requiere contrato ${requiredType}`;

export { EMPLOYEE_CONTRACT_TYPE_VALUES };
