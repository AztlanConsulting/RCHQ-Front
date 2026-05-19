import UserInfoSection from "../../components/organism/userInfoSection";
import useEmployeeCreateForm from "../../hooks/pages/useEmployeeCreateForm";

const AltaNuevoUsuarioPage = ({ onCancel, onSuccess }) => {
    const {
        form,
        roles,
        photo,
        errors,
        serverError,
        isLoading,
        isLoadingData,
        setServerError,
        setPhoto,
        handleChange,
        handleSubmit,
        navigate,
    } = useEmployeeCreateForm(onSuccess);

    return (
        <div className="flex justify-center px-4 py-6 sm:px-6 md:px-8 md:py-12">
            <div className="w-full max-w-6xl flex flex-col gap-4 sm:gap-6">
                <h1 className="ml-1 text-2xl font-bold text-[#121212] sm:text-3xl">
                    Registrar usuario
                </h1>

                {isLoadingData ? (
                    <div className="flex items-center justify-center rounded-xl border border-[#e0e0e0] bg-white py-16 shadow-sm sm:py-20">
                        <span className="text-sm text-[#6b6b6b] sm:text-base">
                            Cargando datos...
                        </span>
                    </div>
                ) : (
                    <UserInfoSection
                        form={form}
                        errors={errors}
                        serverError={serverError}
                        onServerErrorClose={() => setServerError(null)}
                        handleChange={handleChange}
                        roles={roles}
                        photo={photo}
                        onPhotoChange={setPhoto}
                        onSubmit={handleSubmit}
                        onCancel={onCancel || (() => navigate(-1))}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default AltaNuevoUsuarioPage;
