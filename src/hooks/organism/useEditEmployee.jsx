import { useState, useCallback } from "react";
import {
  employeeBasicUpdateSchema,
  employeeContactUpdateSchema,
  employeeAdminUpdateSchema,
  normalizeEmployeeContractType,
} from "../../utils/schema/employee/update.schema";
import { isNoSalaryContract } from "../../utils/employeeContractTypes";
import {
  buildRoleContractMismatchMessage,
  getRequiredContractTypeForRole,
  isContractTypeAllowedForRole,
  resolveContractTypeForRole,
} from "../../utils/roleContractRules";
import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../../services/employeeUpdateService";
import {
  buildShiftPayload,
  createEmptyShift,
  mapShiftFromApi,
} from "../../utils/employeeShifts";

const mapZodFieldErrors = (issues = []) =>
  issues.reduce((fieldErrors, issue) => {
    const field = issue.path?.[0];
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
    return fieldErrors;
  }, {});

const VALIDATION_ALERTS = {
  basic: "Falta completar o corregir datos en la información básica.",
  contact: "Falta completar o corregir datos en la información de contacto.",
  admin: "Falta completar o corregir datos en la información administrativa.",
};

export const useEditEmployee = (employeeId, onSuccess) => {
  const [editSection, setEditSection] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [validationAlert, setValidationAlert] = useState(null);
  const [basicErrors, setBasicErrors] = useState({});
  const [contactErrors, setContactErrors] = useState({});
  const [adminErrors, setAdminErrors] = useState({});
  const [loadingCatalogues, setLoadingCatalogues] = useState(false);

  const [roles, setRoles]       = useState([]);
  const [allWorkdays, setAllWorkdays] = useState([]);
  const [frecuentPaymentTypes, setFrecuentPaymentTypes] = useState([]);

  const [basicForm, setBasicFormState] = useState({
    name: "", surname: "", curp: "", rfc: "",
    nss: "", bankAccount: "", birthDate: "",
  });
  const [basicPictureFile, setBasicPictureFile] = useState(null);
  const [basicPicturePreview, setBasicPicturePreview] = useState("");

  const [contactForm, setContactFormState] = useState({
    email: "", phoneNumber: "",
    street: "", municipio: "", city: "", postalCode: "",
  });

  const [adminForm, setAdminFormState] = useState({
    roleId: "", originalRoleId: "", type: "", salary: "",
    frequencyOfPaymentId: "",
    shifts: [],
  });

  const openBasicEdit = useCallback((employee) => {
    setSaveError(null);
    setValidationAlert(null);
    setBasicErrors({});
    setBasicPictureFile(null);
    setBasicPicturePreview("");
    setBasicFormState({
      name:        employee?.name ?? "",
      surname:     employee?.surname ?? "",
      curp:        employee?.curp ?? "",
      rfc:         employee?.rfc ?? "",
      nss:         employee?.nss ?? "",
      bankAccount: employee?.bankAccount && !isNaN(employee.bankAccount) ? String(employee.bankAccount) : "",
      birthDate:   employee?.birthDate ? String(employee.birthDate).slice(0, 10) : "",
    });
    setEditSection("basic");
  }, []);

  const openContactEdit = useCallback((employee, address) => {
    setSaveError(null);
    setValidationAlert(null);
    setContactErrors({});
    setContactFormState({
      email:       employee?.email ?? "",
      phoneNumber: employee?.phoneNumber ?? "",
      street:      address?.street ?? "",
      municipio:   address?.municipio ?? "",
      city:        address?.city ?? "",
      postalCode:  address?.postalCode ?? "",
    });
    setEditSection("contact");
  }, []);


  const openAdminEdit = useCallback(async (employee, currentShifts) => {
    setSaveError(null);
    setValidationAlert(null);
    setAdminErrors({});
    setEditSection("Administrador");
    setLoadingCatalogues(true);
    try {
      const formData = await getUpdateFormService();
      const workdayCatalog = formData?.workdays ?? [];
      setRoles(formData?.roles ?? []);
      setAllWorkdays(workdayCatalog);
      setFrecuentPaymentTypes(formData?.frecuencyOptions ?? []);

      const initialShifts = Array.isArray(currentShifts) && currentShifts.length > 0
        ? currentShifts.map((shift) => mapShiftFromApi(shift))
        : [createEmptyShift(workdayCatalog)];

      setAdminFormState({
        roleId:               employee?.roleId  ?? "",
        originalRoleId:       employee?.roleId  ?? "",
        type:                 resolveContractTypeForRole(
          (formData?.roles ?? []).find(
            (role) => String(role.roleId) === String(employee?.roleId),
          )?.name,
          normalizeEmployeeContractType(employee?.type) ?? "",
        ),
        salary:               employee?.salary  ?? "",
        frequencyOfPaymentId: employee?.frequencyOfPaymentId ?? "",
        shifts:               initialShifts,
      });
    } catch (err) {
      console.error("Error cargando catálogos:", err);
      setSaveError("Error cargando catálogos");
    } finally {
      setLoadingCatalogues(false);
    }
  }, []);

  const closeEdit = useCallback(() => {
    setBasicPictureFile(null);
    setBasicPicturePreview("");
    setEditSection(null);
    setSaveError(null);
    setValidationAlert(null);
    setBasicErrors({});
    setContactErrors({});
    setAdminErrors({});
  }, []);

  const setBasicField = useCallback((field, value) => {
    let finalValue = value;
    
    if (field === "name" || field === "surname") {
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }
    
    if (field === "curp") {
      finalValue = value
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase();
    }

    if (field === "rfc") {
      finalValue = value
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/[^A-Za-z0-9Ññ]/g, "")
        .toUpperCase();
    }
    
    if (field === "bankAccount" || field === "nss") {
      finalValue = value.replace(/\D/g, ""); 
    }

    if (field === "name" || field === "surname") finalValue = finalValue.slice(0, 50);
    if (field === "curp") finalValue = finalValue.slice(0, 18);
    if (field === "rfc")  finalValue = finalValue.slice(0, 13); 
    if (field === "nss")  finalValue = finalValue.slice(0, 11);
    if (field === "bankAccount") finalValue = finalValue.slice(0, 18);

    setBasicErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setBasicFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setBasicPicture = useCallback((file) => {
    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setSaveError("Solo se permiten imágenes JPG, JPEG o PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("La imagen no puede pesar más de 5MB.");
      return;
    }

    setSaveError(null);
    setBasicPictureFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBasicPicturePreview(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  }, []);

  const setContactField = useCallback((field, value) => {
    let finalValue = value;
    
    if (field === "email" || field === "street") {
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "");
    }

    if (field === "municipio" || field === "city") {
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "");
    }

    if (field === "email") {
      finalValue = finalValue.replace(/[^A-Za-z0-9._@-]/g, "");
    }

    if (field === "street") {
      finalValue = finalValue.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\-\s]/g, "");
    }

    if (field === "municipio" || field === "city") {
      finalValue = finalValue.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9.\-\s]/g, "");
    }

    if (field === "phoneNumber") {
      finalValue = value.replace(/\D/g, "");
    }

    if (field === "postalCode") {
      finalValue = value.replace(/\D/g, "");
    }
    
    if (field === "email") finalValue = finalValue.slice(0, 60);
    if (field === "phoneNumber") finalValue = finalValue.slice(0, 10);
    if (field === "street") finalValue = finalValue.slice(0, 70);
    if (field === "municipio") finalValue = finalValue.slice(0, 70);
    if (field === "city") finalValue = finalValue.slice(0, 70);
    if (field === "postalCode") finalValue = finalValue.slice(0, 5);

    setContactErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setContactFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setAdminField = useCallback((field, value) => {
    let finalValue = value;
    if (field === "salary") {
      const sanitized = value.replace(/[^\d.]/g, "");
      const [integerPart, ...decimalParts] = sanitized.split(".");
      const mergedDecimals = decimalParts.join("");
      finalValue =
        decimalParts.length > 0
          ? `${integerPart}.${mergedDecimals.slice(0, 2)}`
          : integerPart;

      if (finalValue !== "" && Number(finalValue) > 1_000_000) {
        return;
      }
    }
    setAdminErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setAdminFormState((prev) => {
      if (field === "type") {
        const roleName = roles.find(
          (role) => String(role.roleId) === String(prev.roleId),
        )?.name;

        if (!isContractTypeAllowedForRole(roleName, finalValue)) {
          return prev;
        }
      }

      const next = { ...prev, [field]: finalValue };

      if (field === "roleId") {
        const roleName = roles.find(
          (role) => String(role.roleId) === String(finalValue),
        )?.name;
        next.type = resolveContractTypeForRole(roleName, prev.type);
      }

      return next;
    });
  }, [roles]);

  const clearShiftErrors = useCallback(() => {
    setAdminErrors((prev) => {
      if (!prev.shifts) return prev;
      const next = { ...prev };
      delete next.shifts;
      return next;
    });
  }, []);

  const addShift = useCallback(() => {
    clearShiftErrors();
    setAdminFormState((prev) => ({
      ...prev,
      shifts: [...prev.shifts, createEmptyShift(allWorkdays)],
    }));
  }, [allWorkdays, clearShiftErrors]);

  const removeShift = useCallback((clientId) => {
    clearShiftErrors();
    setAdminFormState((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((shift) => shift.clientId !== clientId),
    }));
  }, [clearShiftErrors]);

  const updateShiftField = useCallback((clientId, field, value) => {
    clearShiftErrors();
    setAdminFormState((prev) => ({
      ...prev,
      shifts: prev.shifts.map((shift) => {
        if (shift.clientId !== clientId) return shift;

        if (field === "allDay") {
          return {
            ...shift,
            allDay: value,
            ...(value
              ? { start: "00:00", end: "00:00" }
              : shift.start === "00:00" && shift.end === "00:00"
                ? { start: "08:00", end: "17:00" }
                : {}),
          };
        }

        return { ...shift, [field]: value };
      }),
    }));
  }, [clearShiftErrors]);

  const submitBasic = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setValidationAlert(null);
    setBasicErrors({});
    try {
      const validation = employeeBasicUpdateSchema.safeParse(basicForm);
      if (!validation.success) {
        const issues = validation.error?.issues || validation.error?.errors || [];
        const fieldErrors = mapZodFieldErrors(issues);
        setBasicErrors(fieldErrors);
        setValidationAlert(VALIDATION_ALERTS.basic);
        if (Object.keys(fieldErrors).length === 0) {
          setSaveError(issues[0]?.message || "Por favor, llena todos los campos obligatorios correctamente.");
        }
        return;
      }

      const formData = new FormData();
      Object.entries(validation.data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (basicPictureFile) {
        formData.append("picture", basicPictureFile);
      }

      await updateBasicInfoService(employeeId, formData);
      closeEdit();
      onSuccess?.("Información básica actualizada con éxito");
    } catch (err) {
      setSaveError(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [basicForm, basicPictureFile, employeeId, closeEdit, onSuccess]);

  const submitContact = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setValidationAlert(null);
    setContactErrors({});
    try {
      const validation = employeeContactUpdateSchema.safeParse(contactForm);
      if (!validation.success) {
        const issues = validation.error?.issues || validation.error?.errors || [];
        const fieldErrors = mapZodFieldErrors(issues);
        setContactErrors(fieldErrors);
        setValidationAlert(VALIDATION_ALERTS.contact);
        if (Object.keys(fieldErrors).length === 0) {
          setSaveError(issues[0]?.message || "Es necesario completar todos los campos de contacto.");
        }
        return;
      }

      await updateContactInfoService(employeeId, validation.data);
      closeEdit();
      onSuccess?.("Información de contacto actualizada con éxito");
    } catch (err) {
      setSaveError(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [contactForm, employeeId, closeEdit, onSuccess]);

  const submitAdmin = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setValidationAlert(null);
    setAdminErrors({});
    try {
      const noSalaryRequired = isNoSalaryContract(adminForm.type);
      const requiredErrors = {};
      if (!adminForm.roleId) requiredErrors.roleId = "Selecciona un puesto";
      if (!adminForm.type) requiredErrors.type = "Selecciona un tipo de contrato";

      const selectedRoleName = roles.find(
        (role) => String(role.roleId) === String(adminForm.roleId),
      )?.name;

      if (
        selectedRoleName &&
        adminForm.type &&
        !isContractTypeAllowedForRole(selectedRoleName, adminForm.type)
      ) {
        const requiredType = getRequiredContractTypeForRole(selectedRoleName);
        requiredErrors.type = buildRoleContractMismatchMessage(
          selectedRoleName,
          requiredType,
        );
      }

      if (!noSalaryRequired && adminForm.salary === "") {
        requiredErrors.salary = "El salario es obligatorio";
      }
      if (Object.keys(requiredErrors).length > 0) {
        setAdminErrors(requiredErrors);
        setValidationAlert(VALIDATION_ALERTS.admin);
        return;
      }

      let resolvedSalary = null;
      if (adminForm.salary !== "") {
        const salaryNum = Number(adminForm.salary);
        if (isNaN(salaryNum) || salaryNum < 0) {
          setAdminErrors({ salary: "El salario debe ser un número válido." });
          setValidationAlert(VALIDATION_ALERTS.admin);
          return;
        }
        if (!noSalaryRequired && salaryNum === 0) {
          setAdminErrors({ salary: "El salario debe ser mayor a 0 para este tipo de contrato." });
          setValidationAlert(VALIDATION_ALERTS.admin);
          return;
        }
        resolvedSalary = adminForm.salary;
      } else if (!noSalaryRequired) {
        setAdminErrors({ salary: "El salario es obligatorio" });
        setValidationAlert(VALIDATION_ALERTS.admin);
        return;
      }

      const payload = {
        type: adminForm.type,
        salary: resolvedSalary,
        frequencyOfPaymentId: adminForm.frequencyOfPaymentId || null,
      };

      if (adminForm.roleId !== adminForm.originalRoleId) {
        payload.roleId = adminForm.roleId;
      }

      if (!Array.isArray(adminForm.shifts) || adminForm.shifts.length === 0) {
        setAdminErrors({ shifts: "Debes agregar al menos un turno de trabajo." });
        setValidationAlert(VALIDATION_ALERTS.admin);
        return;
      }

      let shiftsToSend;
      try {
        shiftsToSend = adminForm.shifts.map((shift) => buildShiftPayload(shift, allWorkdays));
      } catch (err) {
        setAdminErrors({ shifts: err.message });
        setValidationAlert(VALIDATION_ALERTS.admin);
        return;
      }

      payload.shifts = shiftsToSend;

      const validation = employeeAdminUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const issues = validation.error?.issues || [];
        const fieldErrors = mapZodFieldErrors(issues);
        setAdminErrors(fieldErrors);
        setValidationAlert(VALIDATION_ALERTS.admin);
        if (Object.keys(fieldErrors).length === 0) {
          setSaveError(issues[0]?.message || "Revisa los campos administrativos.");
        }
        return;
      }

      await updateAdminInfoService(employeeId, validation.data);
      closeEdit();
      onSuccess?.("Información administrativa actualizada con éxito");
    } catch (err) {
      if (err.message?.startsWith("Debes asignar") || err.message?.startsWith("El turno")) {
        setAdminErrors({ shifts: err.message });
        setValidationAlert(VALIDATION_ALERTS.admin);
      } else {
        setSaveError(err.message ?? "Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  }, [adminForm, allWorkdays, employeeId, closeEdit, onSuccess, roles]);

  return {
    editSection, saving, saveError, validationAlert, loadingCatalogues,
    basicErrors, contactErrors, adminErrors,
    basicForm, contactForm, adminForm,
    basicPicturePreview,
    roles, allWorkdays, frecuentPaymentTypes,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setBasicPicture, setContactField, setAdminField,
    addShift, removeShift, updateShiftField,
    submitBasic, submitContact, submitAdmin, setValidationAlert,
  };
};
