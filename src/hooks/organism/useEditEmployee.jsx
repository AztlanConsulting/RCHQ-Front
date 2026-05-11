import { useState, useCallback } from "react";
import {
  employeeBasicUpdateSchema,
  employeeContactUpdateSchema,
  employeeAdminUpdateSchema,
} from "../../utils/schema/employee/update.schema";
import {
  getUpdateFormService,
  updateBasicInfoService,
  updateContactInfoService,
  updateAdminInfoService,
} from "../../services/employeeUpdateService";

export const useEditEmployee = (employeeId, onSuccess) => {
  const [editSection, setEditSection]           = useState(null);
  const [saving, setSaving]                     = useState(false);
  const [saveError, setSaveError]               = useState(null);
  const [loadingCatalogues, setLoadingCatalogues] = useState(false);

  const [roles, setRoles]                         = useState([]);
  const [houses, setHouses]                       = useState([]);
  const [allWorkdays, setAllWorkdays]             = useState([]);
  const [frecuentPaymentTypes, setFrecuentPaymentTypes] = useState([]);
  const [houseEmployees, setHouseEmployees]       = useState([]);

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
      bankAccount: employee?.bankAccount && !isNaN(employee.bankAccount)
        ? String(employee.bankAccount)
        : "",
      birthDate: employee?.birthDate
        ? String(employee.birthDate).slice(0, 10)
        : "",
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
      const formData = await getUpdateFormService(employeeId);

      setRoles(formData?.roles ?? []);
      setHouses(formData?.houses ?? []);
      setAllWorkdays(formData?.workdays ?? []);
      setFrecuentPaymentTypes(formData?.frecuencyOptions ?? []);
      setHouseEmployees(formData?.employees ?? []);

      const preselected = (formData?.workdays ?? []).map((wd) => {
        const wdId     = wd.workdayId ?? wd.workday_id;
        const existing = currentWorkdays?.find(
          (cw) => String(cw.workdayId ?? cw.workday_id) === String(wdId)
        );

        const extractTime = (t, defaultT) => {
          if (!t) return defaultT;
          const s = String(t);
          return s.includes("T") ? s.slice(11, 16) : s.substring(0, 5);
        };

        return {
          workdayId: wdId,
          name:      wd.name,
          selected:  !!existing,
          start:     extractTime(existing?.start, "08:00"),
          end:       extractTime(existing?.end, "17:00"),
        };
      });

      setAdminFormState({
        houseId:              employee?.houseId ?? "",
        roleId:               employee?.roleId  ?? "",
        type:                 employee?.type    ?? "",
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
  }, [employeeId]);

  const closeEdit = useCallback(() => {
    setEditSection(null);
    setSaveError(null);
  }, []);

  const setBasicField = useCallback((field, value) => {
    let finalValue = value;

    if (field === "name" || field === "surname")
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

    if (field === "curp" || field === "rfc")
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "").toUpperCase();

    if (field === "bankAccount" || field === "nss")
      finalValue = value.replace(/\D/g, "");

    if (field === "name" || field === "surname") finalValue = finalValue.slice(0, 50);
    if (field === "curp")        finalValue = finalValue.slice(0, 18);
    if (field === "rfc")         finalValue = finalValue.slice(0, 13);
    if (field === "nss")         finalValue = finalValue.slice(0, 11);
    if (field === "bankAccount") finalValue = finalValue.slice(0, 18);

    setBasicFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setContactField = useCallback((field, value) => {
    let finalValue = value;

    if (field === "municipio" || field === "city")
      finalValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

    if (field === "email" || field === "street")
      finalValue = value.replace(/\p{Extended_Pictographic}/gu, "");

    if (field === "phoneNumber")
      finalValue = value.replace(/\D/g, "");

    if (field === "postalCode")
      finalValue = value.replace(/\D/g, "");

    if (field === "email")       finalValue = finalValue.slice(0, 60);
    if (field === "phoneNumber") finalValue = finalValue.slice(0, 10);
    if (field === "street")      finalValue = finalValue.slice(0, 200);
    if (field === "municipio")   finalValue = finalValue.slice(0, 120);
    if (field === "city")        finalValue = finalValue.slice(0, 100);
    if (field === "postalCode")  finalValue = finalValue.slice(0, 10);

    setContactFormState((prev) => ({ ...prev, [field]: finalValue }));
  }, []);

  const setAdminField = useCallback((field, value) => {
    let finalValue = value;
    if (field === "salary") finalValue = value.replace(/[^\d.]/g, "");
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

  const submitBasic = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const validation = employeeBasicUpdateSchema.safeParse(basicForm);
      if (!validation.success) {
        const firstIssue = validation.error?.issues?.[0] || validation.error?.errors?.[0];
        throw new Error(
          firstIssue?.message || "Por favor, llena todos los campos obligatorios correctamente."
        );
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
        throw new Error(
          firstIssue?.message || "Es necesario completar todos los campos de contacto."
        );
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
      if (!adminForm.houseId || !adminForm.roleId || !adminForm.type || adminForm.salary === "") {
        throw new Error("Debes llenar todos los campos administrativos (Casa, Puesto, Tipo y Salario).");
      }

      const salaryNum = Number(adminForm.salary);
      if (isNaN(salaryNum) || salaryNum < 0)
        throw new Error("El salario debe ser un número válido.");
      if (adminForm.type !== "Voluntariado" && salaryNum === 0)
        throw new Error("El salario debe ser mayor a 0 para este tipo de contrato.");

      const payload = {
        houseId:              adminForm.houseId,
        roleId:               adminForm.roleId,
        type:                 adminForm.type,
        salary:               Number(adminForm.salary),
        frequencyOfPaymentId: adminForm.frequencyOfPaymentId || null,
      };

      const selectedWorkdays = adminForm.selectedWorkdays.filter((w) => w.selected);
      if (selectedWorkdays.length === 0)
        throw new Error("Debes seleccionar al menos un día de trabajo.");

      const workdaysToSend = selectedWorkdays.map(({ workdayId, name, start, end }) => {
        if (!start || !end)
          throw new Error(`Debes asignar un horario completo para el día ${name}.`);

        const [sh] = start.split(":").map(Number);
        const [eh] = end.split(":").map(Number);
        const isOvernight   = end <= start;
        const durationHours = isOvernight ? (24 - sh) + eh : eh - sh;

        if (durationHours < 1)
          throw new Error(`El turno del ${name} debe durar al menos 1 hora.`);
        if (durationHours > 24)
          throw new Error(`El turno del ${name} no puede durar más de 24 horas.`);

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
  }, [employeeId, closeEdit, onSuccess, adminForm]);

  return {
    editSection, saving, saveError, loadingCatalogues,
    basicForm, contactForm, adminForm,
    roles, houses, allWorkdays, frecuentPaymentTypes,
    houseEmployees,
    setAdminFormState,
    openBasicEdit, openContactEdit, openAdminEdit, closeEdit,
    setBasicField, setContactField, setAdminField,
    toggleWorkday, setWorkdayTime,
    submitBasic, submitContact, submitAdmin,
  };
};