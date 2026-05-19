import Alert from "../../atoms/alerts";
import TextField from "../../atoms/textField";
import ButtonGroup from "../../molecules/buttonGroup";
import AusenciaForm from "./forms/absenceForm";
import CasaForm from "./forms/houseForm";
import PersonalForm from "./forms/personalForm";
import { useRegisterEventModal } from "../../../hooks/organism/useRegisterEventModal";

const CATEGORY_FORMS = {
    ausencias: AusenciaForm,
    casa: CasaForm,
    personal: PersonalForm,
};

const RegisterEventModal = ({
    isOpen,
    onClose,
    onSuccess,
    onFeedback,
    initialStartDate,
    initialEndDate,
}) => {
    const {
        name,
        nameError,
        validationAlert,
        animationKey,
        setNameError,
        setValidationAlert,
        handleNameChange,
        handleCategoryChange,
        visibleCategoryOptions,
        effectiveCategoryKey,
        SubForm,
    } = useRegisterEventModal(isOpen, CATEGORY_FORMS);

    if (!isOpen) return null;

    const shouldShowNameField = effectiveCategoryKey !== "ausencias";

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 900,
                    background: "rgba(0,0,0,0.4)",
                }}
            />

            <div
                role="dialog"
                aria-modal="true"
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 910,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    pointerEvents: "none",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        pointerEvents: "all",
                        position: "relative",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        padding: "24px",
                        width: "100%",
                        maxWidth: "560px",
                        boxSizing: "border-box",
                        maxHeight: "90vh",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    {shouldShowNameField ? (
                        <div>
                            <TextField
                                id="event-name"
                                placeholder="Agregar título"
                                value={name}
                                setValue={handleNameChange}
                                maxLength={70}
                            />

                            {nameError && (
                                <p
                                    style={{
                                        margin: "4px 0 0",
                                        fontSize: "12px",
                                        color: "#dc2626",
                                    }}
                                >
                                    {nameError}
                                </p>
                            )}
                        </div>
                    ) : (
                        <h2
                            style={{
                                margin: 0,
                                color: "#121212",
                                fontSize: "28px",
                                fontWeight: 800,
                                lineHeight: 1.15,
                            }}
                        >
                            Ausencias
                        </h2>
                    )}

                    <div style={{ flexShrink: 0 }}>
                        <ButtonGroup
                            options={visibleCategoryOptions}
                            value={effectiveCategoryKey}
                            onChange={handleCategoryChange}
                        />
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div
                            key={animationKey}
                            className="animate-[fadeSlideIn_220ms_ease-in-out]"
                            style={{ paddingBottom: "4px" }}
                        >
                            {SubForm && (
                                <SubForm
                                    name={name}
                                    isOpen={isOpen}
                                    onClose={onClose}
                                    onSuccess={onSuccess}
                                    onFeedback={onFeedback}
                                    initialStartDate={initialStartDate}
                                    initialEndDate={initialEndDate}
                                    onNameError={setNameError}
                                    onValidationAlert={setValidationAlert}
                                />
                            )}
                        </div>
                    </div>

                    {validationAlert && (
                        <div
                            style={{
                                position: "absolute",
                                top: "130px",
                                left: "24px",
                                right: "24px",
                                zIndex: 30,
                            }}
                        >
                            <Alert
                                type="error"
                                message={validationAlert}
                                onClose={() => setValidationAlert(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RegisterEventModal;
