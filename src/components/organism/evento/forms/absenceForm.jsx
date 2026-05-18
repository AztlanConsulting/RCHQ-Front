import { useState } from "react";

import Alert from "../../../atoms/alerts";
import Button from "../../../atoms/button";
import DateField from "../../../atoms/dateField";
import FormErrorText from "../../../atoms/formErrorText";
import DocumentFileField from "../../../molecules/documentFileField";
import EmployeeSelectOption from "../../../molecules/employeeSelectOption";
import SingleSelectDropdown from "../../../molecules/singleSelectDropdown";
import { useAbsenceForm } from "../../../../hooks/pages/useAbsenceForm";

const AusenciaForm = (props) => {
    const {
        form,
        errors,
        serverError,
        employeeOptions,
        absenceTypeOptions,
        isLoadingOptions,
        isSubmitting,
        evidenceFileName,
        evidenceError,
        minStartDate,
        maxEndDate,
        setField,
        setServerError,
        handleEvidenceChange,
        handleSubmit,
    } = useAbsenceForm(props);
    const [openDropdown, setOpenDropdown] = useState(null);
    const descriptionLength = String(form.description ?? "").length;

    return (
        <>
            <SingleSelectDropdown
                id="absence-employee"
                label="Empleado"
                placeholder={
                    isLoadingOptions
                        ? "Cargando empleados ..."
                        : "Selecciona el empleado ..."
                }
                value={form.employeeId}
                options={employeeOptions}
                isOpen={openDropdown === "employee"}
                disabled={isLoadingOptions}
                onToggle={() =>
                    setOpenDropdown((current) =>
                        current === "employee" ? null : "employee",
                    )
                }
                onClose={() => setOpenDropdown(null)}
                onChange={(value) => {
                    setField("employeeId", value);
                    setOpenDropdown(null);
                }}
                renderOption={(option) => (
                    <EmployeeSelectOption
                        option={option}
                        isSelected={false}
                    />
                )}
                renderSelected={(option) => (
                    <EmployeeSelectOption option={option} isSelected />
                )}
            />
            {errors.employeeId && (
                <FormErrorText>{errors.employeeId}</FormErrorText>
            )}

            <SingleSelectDropdown
                id="absence-type"
                label="Tipo de ausencia"
                placeholder={
                    isLoadingOptions
                        ? "Cargando tipos de ausencia ..."
                        : "Selecciona tipo de ausencia ..."
                }
                value={form.absenceTypeId}
                options={absenceTypeOptions}
                isOpen={openDropdown === "absenceType"}
                disabled={isLoadingOptions}
                onToggle={() =>
                    setOpenDropdown((current) =>
                        current === "absenceType" ? null : "absenceType",
                    )
                }
                onClose={() => setOpenDropdown(null)}
                onChange={(value) => {
                    setField("absenceTypeId", value);
                    setOpenDropdown(null);
                }}
            />
            {errors.absenceTypeId && (
                <FormErrorText>{errors.absenceTypeId}</FormErrorText>
            )}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                    <DateField
                        label="Fecha de inicio"
                        labelColor="text-[#374151]"
                        value={form.startDate}
                        placeholder="dd / mm / yyyy"
                        minDate={minStartDate}
                        maxDate={maxEndDate}
                        popupSize="compact"
                        onChange={(e) => setField("startDate", e.target.value)}
                    />
                    {errors.startDate && (
                        <FormErrorText>{errors.startDate}</FormErrorText>
                    )}
                </div>

                <div className="min-w-0">
                    <DateField
                        label="Fecha de fin"
                        labelColor="text-[#374151]"
                        value={form.endDate}
                        placeholder="dd / mm / yyyy"
                        minDate={minStartDate}
                        maxDate={maxEndDate}
                        popupAlign="right"
                        popupSize="compact"
                        onChange={(e) => setField("endDate", e.target.value)}
                    />
                    {errors.endDate && (
                        <FormErrorText>{errors.endDate}</FormErrorText>
                    )}
                </div>
            </div>

            <div className="flex w-full flex-col gap-1.5">
                <label className="text-sm font-bold text-[#374151]">
                    Descripción
                </label>
                <textarea
                    placeholder="Agregar descripción ..."
                    value={form.description}
                    onChange={(event) =>
                        setField("description", event.target.value)
                    }
                    maxLength={200}
                    rows={4}
                    className="w-full resize-none rounded-lg border-0 bg-neutral-50 px-4 py-2 text-sm font-medium text-[#222] shadow-[inset_0px_4px_4px_#00000040] outline-none placeholder-[#aaaaaa]"
                />
                <div className="mt-1 text-right text-xs font-medium text-slate-500">
                    {`${descriptionLength}/200`}
                </div>
                {errors.description && (
                    <FormErrorText>{errors.description}</FormErrorText>
                )}
            </div>

            <DocumentFileField
                id="absence-evidence"
                label="Documento"
                labelColor="text-[#374151]"
                fileName={evidenceFileName}
                handleFileChange={handleEvidenceChange}
                placeholder="Subir un documento ..."
            />
            {(errors.file || evidenceError) && (
                <FormErrorText>{errors.file || evidenceError}</FormErrorText>
            )}

            {serverError && (
                <Alert
                    type="error"
                    message={serverError}
                    onClose={() => setServerError(null)}
                />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    text={isSubmitting ? "Registrando..." : "Confirmar"}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoadingOptions}
                    bgColor="bg-[#1E3A5F]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#162d4a]"
                    activeColor="active:bg-[#0f1f33]"
                    width="w-auto"
                    height="h-[38px]"
                    textSize="text-sm"
                    fontWeight="font-semibold"
                    className="px-5"
                />
            </div>
        </>
    );
};

export default AusenciaForm;
