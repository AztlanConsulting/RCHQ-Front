import FormField from "./FormField";
import SelectField from "../atoms/SelectField";
import PhotoUploader from "../atoms/PhotoUploader";
import Button from "../atoms/Button";

const UserIcon = () => (
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

const UserInfoSection = ({
    form,
    handleChange,
    roles = [],
    photo,
    onPhotoChange,
    onCancel,
    onSubmit,
    isLoading = false,
}) => {
    const roleOptions = roles.map((r) => ({ value: r.role_id, label: r.name }));

    return (
        <section className="bg-white rounded-xl p-8 flex flex-col gap-6 shadow-sm border border-[#e0e0e0]">
            <div className="flex items-center gap-3">
                <UserIcon />
                <h2 className="font-bold text-xl text-[#121212]">
                    Información del Usuario
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <FormField
                    label="Nombre"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    labelColor={LABEL_COLOR}
                />
                <FormField
                    label="Registro Federal de Contribuyentes (RFC)"
                    name="rfc"
                    value={form.rfc}
                    onChange={handleChange}
                    maxLength={13}
                    labelColor={LABEL_COLOR}
                />

                <FormField
                    label="Apellidos"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    labelColor={LABEL_COLOR}
                />
                <FormField
                    label="Número de seguro social (NSS)"
                    name="nss"
                    value={form.nss}
                    onChange={handleChange}
                    maxLength={11}
                    labelColor={LABEL_COLOR}
                />

                <FormField
                    label="Correo"
                    name="email"
                    type="text"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={60}
                    labelColor={LABEL_COLOR}
                />
                <FormField
                    label="Clave Bancaria Estandarizada (CLABE)"
                    name="bank_account"
                    value={form.bank_account}
                    onChange={handleChange}
                    maxLength={18}
                    labelColor={LABEL_COLOR}
                />

                <FormField
                    label="Clave Única de Registro de Población (CURP)"
                    name="curp"
                    value={form.curp}
                    onChange={handleChange}
                    required
                    maxLength={18}
                    labelColor={LABEL_COLOR}
                />
                <FormField
                    label="Fecha de Nacimiento"
                    name="birthdate"
                    type="date"
                    value={form.birthdate}
                    onChange={handleChange}
                    labelColor={LABEL_COLOR}
                />

                <SelectField
                    label="Puesto"
                    name="role_id"
                    value={form.role_id}
                    onChange={handleChange}
                    options={roleOptions}
                    placeholder="Selecciona un puesto"
                    required
                    labelColor={LABEL_COLOR}
                />
                <div className="row-span-2">
                    <PhotoUploader
                        file={photo}
                        onFileChange={onPhotoChange}
                        label="Foto del Usuario"
                        labelColor={LABEL_COLOR}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
                <Button
                    text="Cancelar"
                    onClick={onCancel}
                    disabled={isLoading}
                    bgColor="bg-[#9b1c1c]"
                    hoverColor="hover:bg-[#7f1d1d]"
                    activeColor="active:bg-[#6b1a1a]"
                    textColor="text-white"
                    height="h-[45px]"
                />
                <Button
                    text={isLoading ? "Registrando..." : "Registrar Usuario"}
                    onClick={onSubmit}
                    disabled={isLoading}
                    bgColor="bg-[#24375e]"
                    hoverColor="hover:bg-[#162d4a]"
                    activeColor="active:bg-[#0f2035]"
                    textColor="text-white"
                    height="h-[45px]"
                />
            </div>
        </section>
    );
};

export default UserInfoSection;
