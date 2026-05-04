import { useState, useCallback } from "react";
import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../../services/employeeUpdateService";

export const useEditEmployee = (employeeId, onSuccess) => {
  const [editSection, setEditSection] = useState(null); // "basic" | "contact" | "admin" | null
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

  // ── Abrir sección básica ─────────────────────────────────────────────────────
  const openBasicEdit = useCallback((employee) => {
    setSaveError(null);
    setBasicFormState({
      name:        employee?.name        ?? "",
      surname:     employee?.surname     ?? "",
      curp:        employee?.curp        ?? "",
      rfc:         employee?.rfc         ?? "",
      nss:         employee?.nss         ?? "",
      bankAccount: employee?.bankAccount ?? "",
      birthDate:   employee?.birthDate
        ? String(employee.birthDate).slice(0, 10)
        : "",
    });
    setEditSection("basic");
  }, []);

  // ── Abrir sección contacto ───────────────────────────────────────────────────
  const openContactEdit = useCallback((employee, address) => {
    setSaveError(null);
    setContactFormState({
      email:       employee?.email       ?? "",
      phoneNumber: employee?.phoneNumber ?? "",
      street:      address?.street       ?? "",
      municipio:   address?.municipio    ?? "",
      city:        address?.city         ?? "",
      postalCode:  address?.postalCode   ?? "",
    });
    setEditSection("contact");
  }, []);

  // ── Abrir sección admin ──────────────────────────────────────────────────────
  const openAdminEdit = useCallback(async (employee, currentWorkdays) => {
    setSaveError(null);
    setEditSection("admin");
    setLoadingCatalogues(true);
    try {
      const formData     = await getUpdateFormService();
      const rolesData    = formData?.roles    ?? [];
      const housesData   = formData?.houses   ?? [];
      const workdaysData = formData?.workdays ?? [];

      setRoles(rolesData);
      setHouses(housesData);
      setAllWorkdays(workdaysData);

      const preselected = workdaysData.map((wd) => {
        const wdId    = wd.workdayId ?? wd.workday_id;
        const existing = currentWorkdays?.find(
          (cw) => (cw.workdayId ?? cw.workday_id) === wdId
        );
        return {
          workdayId: wdId,
          name:      wd.name,
          selected:  !!existing,
          start:     existing
            ? String(existing.start).slice(11, 16)
            : "08:00",
          end: existing
            ? String(existing.end).slice(11, 16)
            : "17:00",
        };
      });

      setAdminFormState({
        houseId:          employee?.houseId ?? "",
        roleId:           employee?.roleId  ?? "",
        type:             employee?.type    ?? "",
        salary:           employee?.salary  ?? "",
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

  // ── Setters de campos ────────────────────────────────────────────────────────
  const setBasicField = useCallback((field, value) => {
    setBasicFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setContactField = useCallback((field, value) => {
    setContactFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setAdminField = useCallback((field, value) => {
    setAdminFormState((prev) => ({ ...prev, [field]: value }));
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

  // ── Submits ──────────────────────────────────────────────────────────────────
  const submitBasic = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(basicForm).filter(([, v]) => v !== "")
      );
      await updateBasicInfoService(employeeId, payload);
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
      await updateContactInfoService(employeeId, payload);
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

      await updateAdminInfoService(employeeId, payload);
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