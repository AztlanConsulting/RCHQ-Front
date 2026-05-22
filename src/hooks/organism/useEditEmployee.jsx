import { useState, useCallback, useMemo } from "react";
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

export const useEditEmployee = (employeeId, onSuccess) => {
  const getMinutesFromTime = (timeValue) => {
    const [hours = 0, minutes = 0] = String(timeValue).split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getTimeValue = (value, fallback) => {
    if (!value) return fallback;
    const normalized = String(value);
    return normalized.length >= 16 ? normalized.slice(11, 16) : normalized.slice(0, 5);
  };

  const getDefaultVisibleReferenceIds = (schedules, roleId) =>
    schedules
      .filter((schedule) =>
        String(schedule.roleId) === String(roleId) &&
        Array.isArray(schedule.workdays) &&
        schedule.workdays.length > 0,
      )
      .slice(0, 2)
      .map((schedule) => schedule.employeeId);

  const [editSection, setEditSection] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [loadingCatalogues, setLoadingCatalogues] = useState(false);

  const [roles, setRoles]       = useState([]);
  const [allWorkdays, setAllWorkdays] = useState([]);
  const [frecuentPaymentTypes, setFrecuentPaymentTypes] = useState([]);
  const [referenceSchedules, setReferenceSchedules] = useState([]);
  const [visibleReferenceEmployeeIds, setVisibleReferenceEmployeeIds] = useState([]);

  const [basicForm, setBasicFormState] = useState({
    name: "", surname: "", curp: "", rfc: "",
    nss: "", bankAccount: "", birthDate: "",
  });

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
    setEditSection("Administrador");
    setLoadingCatalogues(true);
    try {
      const formData = await getUpdateFormService();
      setRoles(formData?.roles ?? []);
      setAllWorkdays(formData?.workdays ?? []);
      setFrecuentPaymentTypes(formData?.frecuencyOptions ?? []);
      const nextReferenceSchedules = (formData?.referenceSchedules ?? []).filter(
        (schedule) => String(schedule.employeeId) !== String(employee?.employeeId),
      );
      setReferenceSchedules(nextReferenceSchedules);
      setVisibleReferenceEmployeeIds(
        getDefaultVisibleReferenceIds(nextReferenceSchedules, employee?.roleId),
      );

      const preselected = (formData?.workdays ?? []).map((wd) => {
        const wdId    = wd.workdayId ?? wd.workday_id;
        const existing = currentWorkdays?.find((cw) => (cw.workdayId ?? cw.workday_id) === wdId);
        return {
          workdayId: wdId,
          name:      wd.name,
          selected:  !!existing,
          start:     getTimeValue(existing?.start, "08:00"),
          end:       getTimeValue(existing?.end, "17:00"),
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
    setEditSection(null);
    setSaveError(null);
  }, []);

  const setBasicField = useCallback((field, value) => {
    let finalValue = value;
    
    if (field === "name" || field === "surname") {
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }
    
    if (field === "curp" || field === "rfc") {
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "").toUpperCase();
    }
    
    if (field === "bankAccount" || field === "nss") {
      finalValue = value.replace(/\D/g, ""); 
    }

    if (field === "name" || field === "surname") finalValue = finalValue.slice(0, 50);
    if (field === "curp") finalValue = finalValue.slice(0, 18);
    if (field === "rfc")  finalValue = finalValue.slice(0, 13); 
    if (field === "nss")  finalValue = finalValue.slice(0, 11);
    if (field === "bankAccount") finalValue = finalValue.slice(0, 18);

    setBasicFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setContactField = useCallback((field, value) => {
    let finalValue = value;
    
    if (field === "municipio" || field === "city") {
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s?¡¿!]/g, "");
    }

    if (field === "email" || field === "street") {
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "");
    }

    if (field === "email") {
      finalValue = finalValue.replace(/[^A-Za-z0-9._@-]/g, "");
    }

    if (field === "street") {
      finalValue = finalValue.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s?¡¿!]/g, "");
    }

    if (field === "phoneNumber") {
      finalValue = value.replace(/\D/g, "");
    }

    if (field === "postalCode") {
      finalValue = value.replace(/\D/g, "");
    }
    
    if (field === "email") finalValue = finalValue.slice(0, 60);
    if (field === "phoneNumber") finalValue = finalValue.slice(0, 10);
    if (field === "street") finalValue = finalValue.slice(0, 50);
    if (field === "municipio") finalValue = finalValue.slice(0, 50);
    if (field === "city") finalValue = finalValue.slice(0, 50);
    if (field === "postalCode") finalValue = finalValue.slice(0, 5);

    setContactFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setAdminField = useCallback((field, value) => {
    let finalValue = value;
    if (field === "salary") {
      finalValue = value.replace(/[^\d.]/g, ""); 
    }
    if (field === "roleId") {
      setVisibleReferenceEmployeeIds(
        getDefaultVisibleReferenceIds(referenceSchedules, finalValue),
      );
    }
    setAdminFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, [referenceSchedules]);

  const toggleWorkday = useCallback((workdayId) => {
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((w) =>
        w.workdayId === workdayId ? { ...w, selected: !w.selected } : w
      ),
    }));
  }, []);

  const setWorkdayTime = useCallback((workdayId, timeField, value) => {
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((w) =>
        w.workdayId === workdayId ? { ...w, [timeField]: value } : w
      ),
    }));
  }, []);

  const filteredReferenceSchedules = useMemo(
    () =>
      referenceSchedules.filter(
        (schedule) => String(schedule.roleId) === String(adminForm.roleId),
      ),
    [adminForm.roleId, referenceSchedules],
  );

  const toggleReferenceSchedule = useCallback((referenceEmployeeId) => {
    setVisibleReferenceEmployeeIds((prev) =>
      prev.includes(referenceEmployeeId)
        ? prev.filter((employeeId) => employeeId !== referenceEmployeeId)
        : [...prev, referenceEmployeeId],
    );
  }, []);

  const copyReferenceSchedule = useCallback((referenceEmployeeId) => {
    const sourceSchedule = filteredReferenceSchedules.find(
      (schedule) => String(schedule.employeeId) === String(referenceEmployeeId),
    );

    if (!sourceSchedule) return;

    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((workday) => {
        const matchingWorkday = sourceSchedule.workdays.find(
          (referenceWorkday) =>
            String(referenceWorkday.workdayId) === String(workday.workdayId),
        );

        if (!matchingWorkday) {
          return {
            ...workday,
            selected: false,
          };
        }

        return {
          ...workday,
          selected: true,
          start: getTimeValue(matchingWorkday.start, workday.start),
          end: getTimeValue(matchingWorkday.end, workday.end),
        };
      }),
    }));
  }, [filteredReferenceSchedules]);

  const applyScheduleSelection = useCallback((workdayName, start, end) => {
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((workday) =>
        workday.name === workdayName
          ? {
              ...workday,
              selected: true,
              start,
              end,
            }
          : workday,
      ),
    }));
  }, []);

  const clearScheduleSelection = useCallback((workdayName) => {
    setAdminFormState((prev) => ({
      ...prev,
      selectedWorkdays: prev.selectedWorkdays.map((workday) =>
        workday.name === workdayName
          ? {
              ...workday,
              selected: false,
            }
          : workday,
      ),
    }));
  }, []);

  const submitBasic = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const validation = employeeBasicUpdateSchema.safeParse(basicForm);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0] || validation.error?.errors?.[0];
        throw new Error(firstIssue?.message || "Por favor, llena todos los campos obligatorios correctamente.");
      }

      await updateBasicInfoService(employeeId, validation.data);
      closeEdit();
      onSuccess?.("Información básica actualizada con éxito");
    } catch (err) {
      setSaveError(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [basicForm, employeeId, closeEdit, onSuccess]);

  const submitContact = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const validation = employeeContactUpdateSchema.safeParse(contactForm);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0] || validation.error?.errors?.[0];
        throw new Error(firstIssue?.message || "Es necesario completar todos los campos de contacto.");
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
    try {
      if (!adminForm.roleId || !adminForm.type || adminForm.salary === "") {
        throw new Error("Debes llenar todos los campos administrativos (Puesto, Tipo y Salario).");
      }

      const salaryNum = Number(adminForm.salary);
      if (isNaN(salaryNum) || salaryNum < 0) {
        throw new Error("El salario debe ser un número válido.");
      }
      if (adminForm.type !== "Voluntariado" && salaryNum === 0) {
        throw new Error("El salario debe ser mayor a 0 para este tipo de contrato.");
      }

      const payload = {
        type:                 adminForm.type,
        salary:               Number(adminForm.salary),
        frequencyOfPaymentId: adminForm.frequencyOfPaymentId || null,
      };

      if (adminForm.roleId !== adminForm.originalRoleId) {
        payload.roleId = adminForm.roleId;
      }

      const selectedWorkdays = adminForm.selectedWorkdays.filter((w) => w.selected);
      if (selectedWorkdays.length === 0) {
        throw new Error("Debes seleccionar al menos un día de trabajo.");
      }

      const workdaysToSend = selectedWorkdays.map(({ workdayId, name, start, end }) => {
        if (!start || !end) {
          throw new Error(`Debes asignar un horario completo para el día ${name}.`);
        }

        const startMinutes = getMinutesFromTime(start);
        const endMinutes = getMinutesFromTime(end);
        const isOvernight = endMinutes <= startMinutes;
        const durationMinutes = isOvernight
          ? (24 * 60 - startMinutes) + endMinutes
          : endMinutes - startMinutes;

        if (durationMinutes < 60) {
          throw new Error(`El turno del ${name} debe durar al menos 1 hora.`);
        }
        if (durationMinutes > 24 * 60) {
          throw new Error(`El turno del ${name} no puede durar más de 24 horas.`);
        }

        return { workdayId, start, end };
      });

      payload.workdays = workdaysToSend;

      const validation = employeeAdminUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0];
        throw new Error(firstIssue?.message || "Revisa los campos administrativos.");
      }

      await updateAdminInfoService(employeeId, validation.data);
      closeEdit();
      onSuccess?.("Información administrativa actualizada con éxito");
    } catch (err) {
      setSaveError(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [adminForm, employeeId, closeEdit, onSuccess]);

  return {
    editSection, saving, saveError, loadingCatalogues,
    basicForm, contactForm, adminForm,
    roles, allWorkdays, frecuentPaymentTypes,
    referenceSchedules: filteredReferenceSchedules,
    visibleReferenceEmployeeIds,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setContactField, setAdminField,
    toggleWorkday, setWorkdayTime,
    toggleReferenceSchedule,
    copyReferenceSchedule,
    applyScheduleSelection,
    clearScheduleSelection,
    submitBasic, submitContact, submitAdmin,
  };
};
