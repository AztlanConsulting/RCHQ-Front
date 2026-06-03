import { useState, useCallback } from "react";
import { 
  employeeBasicUpdateSchema, 
  employeeContactUpdateSchema, 
  employeeAdminUpdateSchema,
  normalizeEmployeeContractType,
} from "../../utils/schema/employee/update.schema";
import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../../services/employeeUpdateService";

const mapZodFieldErrors = (issues = []) =>
  issues.reduce((fieldErrors, issue) => {
    const field = issue.path?.[0];
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
    return fieldErrors;
  }, {});

export const useEditEmployee = (employeeId, onSuccess) => {
  const [editSection, setEditSection] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
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
    selectedWorkdays: [],
  });

  const openBasicEdit = useCallback((employee) => {
    setSaveError(null);
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


  const openAdminEdit = useCallback(async (employee, currentWorkdays) => {
    setSaveError(null);
    setAdminErrors({});
    setEditSection("Administrador");
    setLoadingCatalogues(true);
    try {
      const formData = await getUpdateFormService();
      setRoles(formData?.roles ?? []);
      setAllWorkdays(formData?.workdays ?? []);
      setFrecuentPaymentTypes(formData?.frecuencyOptions ?? []);

      const preselected = (formData?.workdays ?? []).map((wd) => {
        const wdId    = wd.workdayId ?? wd.workday_id;
        const existing = currentWorkdays?.find((cw) => (cw.workdayId ?? cw.workday_id) === wdId);
        const isAllDay = existing
          ? (() => {
              const startDate = new Date(existing.start);
              const endDate = new Date(existing.end);
              if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                return false;
              }

              const diffMs = endDate.getTime() - startDate.getTime();
              const sameUtcClock =
                startDate.getUTCHours() === endDate.getUTCHours() &&
                startDate.getUTCMinutes() === endDate.getUTCMinutes();

              return diffMs === 24 * 60 * 60 * 1000 || sameUtcClock;
            })()
          : false;
        return {
          workdayId: wdId,
          name:      wd.name,
          selected:  !!existing,
          start:     existing ? String(existing.start).slice(11, 16) : "08:00",
          end:       existing ? String(existing.end).slice(11, 16)   : "17:00",
          allDay:    isAllDay,
        };
      });

      setAdminFormState({
        roleId:               employee?.roleId  ?? "",
        originalRoleId:       employee?.roleId  ?? "",
        type:                 normalizeEmployeeContractType(employee?.type) ?? "",
        salary:               employee?.salary  ?? "",
        frequencyOfPaymentId: employee?.frequencyOfPaymentId ?? "",
        selectedWorkdays:     preselected,
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
    setAdminFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const toggleWorkday = useCallback((workdayId) => {
    setAdminErrors((prev) => {
      if (!prev.workdays) return prev;
      const next = { ...prev };
      delete next.workdays;
      return next;
    });
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((w) =>
        w.workdayId === workdayId ? { ...w, selected: !w.selected } : w
      ),
    }));
  }, []);

  const setWorkdayTime = useCallback((workdayId, timeField, value) => {
    setAdminErrors((prev) => {
      if (!prev.workdays) return prev;
      const next = { ...prev };
      delete next.workdays;
      return next;
    });
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((w) =>
        w.workdayId === workdayId
          ? {
              ...w,
              [timeField]: value,
              ...(w.allDay ? { end: value } : {}),
            }
          : w
      ),
    }));
  }, []);

  const setWorkdayAllDay = useCallback((workdayId, checked) => {
    setAdminErrors((prev) => {
      if (!prev.workdays) return prev;
      const next = { ...prev };
      delete next.workdays;
      return next;
    });
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((w) =>
        w.workdayId === workdayId
          ? {
              ...w,
              allDay: checked,
              ...(checked
                ? { start: "00:00", end: "00:00" }
                : w.start === "00:00" && w.end === "00:00"
                  ? { start: "08:00", end: "17:00" }
                  : {}),
            }
          : w
      ),
    }));
  }, []);

  const submitBasic = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setBasicErrors({});
    try {
      const validation = employeeBasicUpdateSchema.safeParse(basicForm);
      if (!validation.success) {
        const issues = validation.error?.issues || validation.error?.errors || [];
        const fieldErrors = mapZodFieldErrors(issues);
        setBasicErrors(fieldErrors);
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
    setContactErrors({});
    try {
      const validation = employeeContactUpdateSchema.safeParse(contactForm);
      if (!validation.success) {
        const issues = validation.error?.issues || validation.error?.errors || [];
        const fieldErrors = mapZodFieldErrors(issues);
        setContactErrors(fieldErrors);
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
    setAdminErrors({});
    try {
      const requiredErrors = {};
      if (!adminForm.roleId) requiredErrors.roleId = "Selecciona un puesto";
      if (!adminForm.type) requiredErrors.type = "Selecciona un tipo de contrato";
      if (adminForm.salary === "") requiredErrors.salary = "El salario es obligatorio";
      if (Object.keys(requiredErrors).length > 0) {
        setAdminErrors(requiredErrors);
        return;
      }

      const salaryNum = Number(adminForm.salary);
      if (isNaN(salaryNum) || salaryNum < 0) {
        setAdminErrors({ salary: "El salario debe ser un número válido." });
        return;
      }
      if (adminForm.type !== "Voluntariado" && salaryNum === 0) {
        setAdminErrors({ salary: "El salario debe ser mayor a 0 para este tipo de contrato." });
        return;
      }

      const payload = {
        type:                 adminForm.type,
        salary:               adminForm.salary,
        frequencyOfPaymentId: adminForm.frequencyOfPaymentId || null,
      };

      if (adminForm.roleId !== adminForm.originalRoleId) {
        payload.roleId = adminForm.roleId;
      }

      const selectedWorkdays = adminForm.selectedWorkdays.filter((w) => w.selected);
      if (selectedWorkdays.length === 0) {
        setAdminErrors({ workdays: "Debes seleccionar al menos un día de trabajo." });
        return;
      }

      const workdaysToSend = selectedWorkdays.map(({ workdayId, name, start, end, allDay }) => {
        if (!start || !end) {
          throw new Error(`Debes asignar un horario completo para el día ${name}.`);
        }

        const normalizedStart = allDay ? "00:00" : start;
        const normalizedEnd = allDay ? "00:00" : end;
        const [sh, sm] = normalizedStart.split(":").map(Number);
        const [eh, em] = normalizedEnd.split(":").map(Number);
        const startMinutes = (sh * 60) + sm;
        const endMinutes = (eh * 60) + em;
        const durationMinutes = allDay
          ? 24 * 60
          : normalizedEnd <= normalizedStart
            ? (24 * 60 - startMinutes) + endMinutes
            : endMinutes - startMinutes;

        if (durationMinutes < 60) {
          throw new Error(`El turno del ${name} debe durar al menos 1 hora.`);
        }
        if (durationMinutes > 24 * 60) {
          throw new Error(`El turno del ${name} no puede durar más de 24 horas.`);
        }

        return {
          workdayId,
          start: normalizedStart,
          end: normalizedEnd,
          allDay: Boolean(allDay),
        };
      });

      payload.workdays = workdaysToSend;

      const validation = employeeAdminUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const issues = validation.error?.issues || [];
        const fieldErrors = mapZodFieldErrors(issues);
        setAdminErrors(fieldErrors);
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
        setAdminErrors({ workdays: err.message });
      } else {
        setSaveError(err.message ?? "Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  }, [adminForm, employeeId, closeEdit, onSuccess]);

  return {
    editSection, saving, saveError, loadingCatalogues,
    basicErrors, contactErrors, adminErrors,
    basicForm, contactForm, adminForm,
    basicPicturePreview,
    roles, allWorkdays, frecuentPaymentTypes,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setBasicPicture, setContactField, setAdminField,
    toggleWorkday, setWorkdayTime, setWorkdayAllDay,
    submitBasic, submitContact, submitAdmin,
  };
};
