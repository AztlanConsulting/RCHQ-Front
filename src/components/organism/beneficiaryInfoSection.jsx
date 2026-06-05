import FormField from "./formField";
import Alert from "../atoms/alerts";
import DateField from "../atoms/dateField";
import ErrorText from "../atoms/errorText";
import SelectField from "../atoms/selectField";
import SmallButton from "../atoms/smallButton";
import { BLOOD_TYPE_OPTIONS } from "../../utils/schema/beneficiary/beneficiaryAdd.schema";

const ChildIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-[#121212]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
    </svg>
);

const LABEL_COLOR = "text-[#6b6b6b]";

const BeneficiaryInfoSection = ({
    form,
    errors = {},
    serverError,
    onServerErrorClose,
    handleChange,
    onCancel,
    onSubmit,
    isLoading = false,
}) => {
    return (
        <section className="relative bg-white rounded-xl p-8 flex flex-col gap-6 shadow-sm border border-[#e0e0e0]">
            <div className="flex items-center gap-3">
                <ChildIcon />
                <h2 className="font-bold text-xl text-[#121212]">
                    Información del beneficiario
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                <div>
                    <FormField
                        label="Nombre(s)"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        labelColor={LABEL_COLOR}
                    />
                    <div className="h-5">
                        {errors.name && <ErrorText>{errors.name}</ErrorText>}
                    </div>
                </div>

                <div>
                    <FormField
                        label="Nombre preferido"
                        name="preferred_name"
                        value={form.preferred_name}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        labelColor={LABEL_COLOR}
                    />
                    <div className="h-5">
                        {errors.preferred_name && (
                            <ErrorText>{errors.preferred_name}</ErrorText>
                        )}
                    </div>
                </div>

                <div>
                    <FormField
                        label="Apellido paterno"
                        name="paternal_surname"
                        value={form.paternal_surname}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        labelColor={LABEL_COLOR}
                    />
                    <div className="h-5">
                        {errors.paternal_surname && (
                            <ErrorText>{errors.paternal_surname}</ErrorText>
                        )}
                    </div>
                </div>

                <div>
                    <FormField
                        label="Apellido materno"
                        name="maternal_surname"
                        value={form.maternal_surname}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        labelColor={LABEL_COLOR}
                    />
                    <div className="h-5">
                        {errors.maternal_surname && (
                            <ErrorText>{errors.maternal_surname}</ErrorText>
                        )}
                    </div>
                </div>

                <div>
                    <DateField
                        label="Fecha de nacimiento"
                        name="birth_date"
                        value={form.birth_date}
                        onChange={handleChange}
                        labelColor={LABEL_COLOR}
                        minDate={new Date("1900-01-01")}
                        maxDate={new Date()}
                    />
                    <div className="h-5">
                        {errors.birth_date && (
                            <ErrorText>{errors.birth_date}</ErrorText>
                        )}
                    </div>
                </div>

                <div>
                    <FormField
                        label="Edad al entrar en la casa"
                        name="age_entered_house"
                        value={form.age_entered_house}
                        onChange={handleChange}
                        required
                        maxLength={2}
                        labelColor={LABEL_COLOR}
                    />
                    <div className="h-5">
                        {errors.age_entered_house && (
                            <ErrorText>{errors.age_entered_house}</ErrorText>
                        )}
                    </div>
                </div>

                <div>
                    <SelectField
                        label="Tipo de sangre"
                        name="blood_type"
                        value={form.blood_type}
                        onChange={handleChange}
                        options={BLOOD_TYPE_OPTIONS}
                        placeholder="Selecciona un tipo"
                        required
                        labelColor={LABEL_COLOR}
                    />
                    <div
                        className={
                            errors.blood_type ? "min-h-5 h-auto" : "h-5"
                        }
                    >
                        {errors.blood_type && (
                            <ErrorText>{errors.blood_type}</ErrorText>
                        )}
                    </div>
                </div>

                <div className={errors.blood_type ? "max-md:mt-2" : ""}>
                    <FormField
                        label="CURP (opcional)"
                        name="curp"
                        value={form.curp}
                        onChange={handleChange}
                        maxLength={18}
                        labelColor={LABEL_COLOR}
                    />
                    <div className="h-5">
                        {errors.curp && <ErrorText>{errors.curp}</ErrorText>}
                    </div>
                </div>
            </div>

            {serverError && (
                <div className="absolute left-1/2 top-4 z-50 w-full -translate-x-1/2 px-2">
                    <Alert
                        type="error"
                        message={serverError}
                        onClose={onServerErrorClose}
                    />
                </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
                <SmallButton
                    text="Cancelar"
                    onClick={onCancel}
                    disabled={isLoading}
                    cancel
                />

                <SmallButton
                    text={isLoading ? "Registrando..." : "Registrar"}
                    onClick={onSubmit}
                    disabled={isLoading}
                />
            </div>
        </section>
    );
};

export default BeneficiaryInfoSection;
