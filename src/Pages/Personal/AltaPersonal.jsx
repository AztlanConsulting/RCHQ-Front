import UserInfoSection from "../../Components/Organism/UserInfoSection";
import Alert from "../../Components/Atoms/Alerts";
import useEmployeeCreateForm from "../../hooks/Pages/useEmployeeCreateForm";

const AltaNuevoUsuarioPage = ({ onCancel, onSuccess }) => {
    const {
        form,
        roles,
        photo,
        errors,
        isLoading,
        isLoadingData,
        setErrors,
        setPhoto,
        handleChange,
        handleSubmit,
        navigate,
    } = useEmployeeCreateForm(onSuccess);

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