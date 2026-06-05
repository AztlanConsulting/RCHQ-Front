import BeneficiaryInfoSection from "../../components/organism/beneficiaryInfoSection";
import useBeneficiaryCreateForm from "../../hooks/pages/useBeneficiaryCreateForm";

const AltaNuevoBeneficiarioPage = ({ onCancel, onSuccess }) => {
    const {
        form,
        errors,
        serverError,
        serverSuccess,
        conflictModal,
        isLoading,
        setServerError,
        setServerSuccess,
        closeConflictModal,
        handleChange,
        handleSubmit,
        navigate,
    } = useBeneficiaryCreateForm(onSuccess);

    const goBack = onCancel || (() => navigate("/app/beneficiarios"));

    return (
        <div className="flex justify-center px-4 py-6 sm:px-6 md:px-8 md:py-12">
            <div className="w-full max-w-6xl flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-2 ml-1">
                    <button
                        type="button"
                        onClick={goBack}
                        className="rounded-lg p-2 hover:bg-slate-100 transition-colors shrink-0"
                        aria-label="Volver a beneficiarios"
                    >
                        <svg
                            className="w-5 h-5 text-slate-600 rotate-90"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-[#121212] sm:text-3xl">
                        Registrar beneficiario
                    </h1>
                </div>

                <BeneficiaryInfoSection
                    form={form}
                    errors={errors}
                    serverError={serverError}
                    serverSuccess={serverSuccess}
                    onServerErrorClose={() => setServerError(null)}
                    onServerSuccessClose={() => setServerSuccess(null)}
                    conflictModal={conflictModal}
                    onCloseConflictModal={closeConflictModal}
                    handleChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={goBack}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default AltaNuevoBeneficiarioPage;
