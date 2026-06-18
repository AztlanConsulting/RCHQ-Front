export const EMPLOYEE_CONTRACT_TYPES = [
  { value: "Nomina", label: "Nómina" },
  { value: "Asimilado a Salario", label: "Asimilado a Salario" },
  { value: "Honorarios", label: "Honorarios" },
  { value: "Voluntariado", label: "Voluntariado" },
  { value: "Servicio Social", label: "Servicio Social" },
  { value: "Patronato", label: "Patronato" },
  { value: "Proveedor", label: "Proveedor" },
];

export const EMPLOYEE_CONTRACT_TYPE_VALUES = EMPLOYEE_CONTRACT_TYPES.map(
  (t) => t.value,
);

export const NO_SALARY_CONTRACT_TYPES = [
  "Voluntariado",
  "Servicio Social",
  "Patronato",
  "Proveedor",
];

const CONTRACT_TYPE_BY_NORMALIZED = {
  nomina: "Nomina",
  asalariado: "Asimilado a Salario",
  "asimilado a salario": "Asimilado a Salario",
  asimilado: "Asimilado a Salario",
  honorarios: "Honorarios",
  honorario: "Honorarios",
  voluntariado: "Voluntariado",
  "servicio social": "Servicio Social",
  patronato: "Patronato",
  proveedor: "Proveedor",
};

export function normalizeEmployeeContractType(val) {
  if (val === null || val === undefined) return val;
  const s = String(val).trim();
  if (s === "") return val;
  const key = s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return CONTRACT_TYPE_BY_NORMALIZED[key] ?? s;
}

export function isNoSalaryContract(type) {
  return NO_SALARY_CONTRACT_TYPES.includes(type);
}

export function formatSalaryDisplay(salary) {
  if (salary == null || salary === "" || salary === "0") return "Sin salario";
  return `$${salary}`;
}

export function formatFrequencyDisplay(name) {
  if (name == null || name === "") return "Sin frecuencia";
  const normalized = String(name);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatContractTypeLabel(value) {
  if (!value) return "N/A";
  const matched = EMPLOYEE_CONTRACT_TYPES.find(
    (type) => type.value.toLowerCase() === String(value).toLowerCase(),
  );
  if (matched) return matched.label;
  const s = String(value);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
