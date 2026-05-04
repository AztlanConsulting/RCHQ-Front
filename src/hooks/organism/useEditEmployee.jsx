import { useState, useCallback } from "react";
import { 
  employeeBasicUpdateSchema, 
  employeeContactUpdateSchema, 
  employeeAdminUpdateSchema 
} from "../../utils/schema/employee/update.schema";
import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../../services/employeeUpdateService";

export const useEditEmployee = (employeeId, onSuccess) => {
  const [editSection, setEditSection] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [loadingCatalogues, setLoadingCatalogues] = useState(false);

  const [roles, setRoles]       = useState([]);
  const [houses, setHouses]     = useState([]);
  const [allWorkdays, setAllWorkdays] = useState([]);

  const [basicForm, setBasicFormState] = useState({
    name: "", surname: "", curp: "", rfc: "",
    nss: "", bankAccount: "", birthDate: "",
  });

  const [contactForm, setContactFormState] = useState({
    email: "", phoneNumber: "",
    street: "", municipio: "", city: "", postalCode: "",
  });

  const [adminForm, setAdminFormState] = useState({
    houseId: "", roleId: "", type: "", salary: "",
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
    setEditSection("admin");
    setLoadingCatalogues(true);
    try {
      const formData     = await getUpdateFormService();
      setRoles(formData?.roles ?? []);
      setHouses(formData?.houses ?? []);
      setAllWorkdays(formData?.workdays ?? []);

      const preselected = (formData?.workdays ?? []).map((wd) => {
        const wdId    = wd.workdayId ?? wd.workday_id;
        const existing = currentWorkdays?.find((cw) => (cw.workdayId ?? cw.workday_id) === wdId);
        return {
          workdayId: wdId,
          name:      wd.name,
          selected:  !!existing,
          start:     existing ? String(existing.start).slice(11, 16) : "08:00",
          end:       existing ? String(existing.end).slice(11, 16) : "17:00",
        };
      });

      setAdminFormState({
        houseId: employee?.houseId ?? "",
        roleId:  employee?.roleId ?? "",
        type:    employee?.type ?? "",
        salary:  employee?.salary ?? "",
        selectedWorkdays: preselected,
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

  // ── Setters Interceptados (Validación en tiempo real) ────────────
  const setBasicField = useCallback((field, value) => {
    let finalValue = value;
    
    // 1. Campos que NO aceptan números ni emojis (solo letras y espacios)
    if (field === "name" || field === "surname") {
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }
    
    // 2. Campos que NO aceptan emojis (se mantienen mayúsculas para UX)
    if (field === "curp" || field === "rfc") {
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "").toUpperCase();
    }
    
    // 3. Campos que SOLO aceptan números
    if (field === "bankAccount" || field === "nss") {
      finalValue = value.replace(/\D/g, ""); 
    }

    setBasicFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setContactField = useCallback((field, value) => {
    let finalValue = value;
    
    // 1. Campos que NO aceptan números ni emojis (solo letras y espacios)
    if (field === "municipio" || field === "city") {
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }

    // 2. Campos que NO aceptan emojis
    if (field === "email" || field === "street") {
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "");
    }

    // 3. Campos que SOLO aceptan números
    if (field === "phoneNumber") {
      finalValue = value.replace(/\D/g, "");
    }
    
    setContactFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setAdminField = useCallback((field, value) => {
    let finalValue = value;
    // Evitar letras y emojis en salario, permitiendo solo puntos y números
    if (field === "salary") {
      finalValue = value.replace(/[^\d.]/g, ""); 
    }
    setAdminFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

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

  // ── Submits ────────────────────────────────────────────────────────
  const submitBasic = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(basicForm).filter(([, v]) => v !== "")
      );

      const validation = employeeBasicUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0] || validation.error?.errors?.[0];
        throw new Error(firstIssue?.message || "Revisa los campos, hay errores de validación.");
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
      const payload = Object.fromEntries(
        Object.entries(contactForm).filter(([, v]) => v !== "")
      );

      const validation = employeeContactUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0] || validation.error?.errors?.[0];
        throw new Error(firstIssue?.message || "Revisa los campos de contacto.");
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
      const payload = {};
      if (adminForm.houseId) payload.houseId = adminForm.houseId;
      if (adminForm.roleId)  payload.roleId  = adminForm.roleId;
      if (adminForm.type)    payload.type    = adminForm.type;
      if (adminForm.salary)  payload.salary  = Number(adminForm.salary);

      const workdaysToSend = adminForm.selectedWorkdays
        .filter((w) => w.selected)
        .map(({ workdayId, start, end }) => ({ workdayId, start, end }));

      if (workdaysToSend.length > 0) payload.workdays = workdaysToSend;

      const validation = employeeAdminUpdateSchema.safeParse(payload);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0] || validation.error?.errors?.[0];
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
    roles, houses, allWorkdays,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setContactField, setAdminField,
    toggleWorkday, setWorkdayTime,
    submitBasic, submitContact, submitAdmin,
  };
};