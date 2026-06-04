import BeneficiaryInfoSection from "../../components/organism/beneficiaryInfoSection";
import useBeneficiaryCreateForm from "../../hooks/pages/useBeneficiaryCreateForm";

const AltaNuevoBeneficiarioPage = ({ onCancel, onSuccess }) => {
    const {
        form,
        errors,
        serverError,
        isLoading,
        setServerError,
        handleChange,
        handleSubmit,
        navigate,
    } = useBeneficiaryCreateForm(onSuccess);

    return (
        <div className="flex justify-center px-4 py-6 sm:px-6 md:px-8 md:py-12">
            <div className="w-full max-w-6xl flex flex-col gap-4 sm:gap-6">
                <h1 className="ml-1 text-2xl font-bold text-[#121212] sm:text-3xl">
                    Registrar beneficiario
                </h1>

                <BeneficiaryInfoSection
                    form={form}
                    errors={errors}
                    serverError={serverError}
                    onServerErrorClose={() => setServerError(null)}
                    handleChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={onCancel || (() => navigate(-1))}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default AltaNuevoBeneficiarioPage;
