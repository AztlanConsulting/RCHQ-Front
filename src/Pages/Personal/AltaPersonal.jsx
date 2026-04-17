import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getEmployeeFormData,
    createEmployee,
} from "../../Services/EmployeeService";
import { employeeCreateSchema } from "../../Utils/Schema/employeeAdd.schema";

import UserInfoSection from "../../Components/Organism/UserInfoSection";
import Alert from "../../Components/Atoms/Alerts";

const INITIAL_FORM = {
    role_id: "",
    name: "",
    surname: "",
    email: "",
    curp: "",
    rfc: "",
    nss: "",
    clabe: "",
    birthdate: "",
};

const AltaNuevoUsuarioPage = ({ onCancel, onSuccess }) => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEmployeeFormData();
                setRoles(data.roles ?? []);
            } catch (err) {
                setErrors("Error cargando datos iniciales");
            } finally {
                setIsLoadingData(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        setErrors(null);
        const { name, value } = e.target;

        let finalValue = value;

        switch (name) {
            case "name":
            case "surname":
                finalValue = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
                break;
            case "nss":
            case "clabe":
                finalValue = value.replace(/\D/g, "");
                break;
            case "curp":
            case "rfc":
                finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                break;
            case "email":
                finalValue = value.replace(/[^a-zA-Z0-9@._+-]/g, "");
                break;
            default:
                finalValue = value;
        }

        setForm((prev) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async () => {
        setErrors(null);

        const result = employeeCreateSchema.safeParse(form);

        if (!result.success) {
            setErrors(result.error.issues[0].message);
            return;
        }

        setIsLoading(true);

        try {
            const response = await createEmployee({ ...result.data });

            setForm(INITIAL_FORM);
            setPhoto(null);
            onSuccess?.();

            if (response.redirect) {
                navigate(response.redirect);
            } else {
                navigate("/empleados");
            }
        } catch (err) {
            setErrors(err.message);

            if (err.redirect) {
                setTimeout(() => {
                    navigate(err.redirect);
                }, 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f2f2f2] px-8 py-12 flex justify-center">
            <div className="w-full max-w-6xl flex flex-col gap-6">
                <h1 className="font-bold text-3xl text-[#121212] ml-1">
                    Alta de nuevo usuario
                </h1>

                {isLoadingData ? (
                    <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-[#e0e0e0]">
                        <span className="text-[#6b6b6b] text-base">
                            Cargando datos...
                        </span>
                    </div>
                ) : (
                    <div className="relative w-full">
                        {errors && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-[calc(100%+6rem)] md:w-[calc(100%+12rem)] z-50">
                                <Alert
                                    type="error"
                                    message={errors}
                                    onClose={() => setErrors(null)}
                                />
                            </div>
                        )}

                        <UserInfoSection
                            form={form}
                            handleChange={handleChange}
                            roles={roles}
                            photo={photo}
                            onPhotoChange={setPhoto}
                            onSubmit={handleSubmit}
                            onCancel={onCancel || (() => navigate(-1))}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AltaNuevoUsuarioPage;
