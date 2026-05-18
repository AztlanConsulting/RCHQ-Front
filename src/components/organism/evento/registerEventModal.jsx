import Alert from "../../atoms/alerts";
import TextField from "../../atoms/textField";
import ButtonGroup from "../../molecules/buttonGroup";
import AusenciaForm from "./forms/absenceForm";
import CasaForm from "./forms/houseForm";
import { useRegisterEventModal } from "../../../hooks/organism/useRegisterEventModal";
import { getCalendarViewerRole } from "../../../services/calendarService";

const CATEGORY_OPTIONS = [
    { value: "global", label: "Global", icon: "globe" },
    { value: "casa", label: "Casa", icon: "home" },
    { value: "personal", label: "Personal", icon: "user" },
    { value: "vacaciones", label: "Vacaciones", icon: "plane" },
    { value: "ausencias", label: "Ausencias", icon: "flag" },
];

const CATEGORY_FORMS = {
    ausencias: AusenciaForm,
    casa: CasaForm,
};

const RegisterEventModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialStartDate,
    initialEndDate,
}) => {
    const {
        name,
        nameError,
        categoryKey,
        validationAlert,
        animationKey,
        setNameError,
        setValidationAlert,
        handleNameChange,
        handleCategoryChange,
    } = useRegisterEventModal(isOpen);

    if (!isOpen) return null;

    const viewerRole = getCalendarViewerRole();
    const canRegisterAbsences =
        viewerRole === "Coordinador" ||
        viewerRole === "Admin";
    const categoryOptions = canRegisterAbsences
        ? CATEGORY_OPTIONS
        : CATEGORY_OPTIONS.filter((option) => option.value !== "ausencias");
    const SubForm = CATEGORY_FORMS[categoryKey] ?? null;
    const shouldShowNameField = categoryKey !== "ausencias";

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
                    alignItems: "flex-start",
                    justifyContent: "center",
                    padding: "12px",
                    pointerEvents: "none",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        pointerEvents: "all",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        padding: "24px",
                        width: "100%",
                        maxWidth: "560px",
                        boxSizing: "border-box",
                        maxHeight: "calc(100dvh - 24px)",
                        overflowY: "auto",
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

                    <ButtonGroup
                        options={categoryOptions}
                        value={categoryKey}
                        onChange={handleCategoryChange}
                    />

                    <div
                        style={{
                            position: "relative",
                            height: 0,
                            overflow: "visible",
                            zIndex: 20,
                            marginTop: "-8px",
                        }}
                    >
                        {validationAlert && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
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

                    <div
                        key={animationKey}
                        className="animate-[fadeSlideIn_220ms_ease-in-out]"
                    >
                        {SubForm && (
                            <SubForm
                                name={name}
                                isOpen={isOpen}
                                onClose={onClose}
                                onSuccess={onSuccess}
                                initialStartDate={initialStartDate}
                                initialEndDate={initialEndDate}
                                onNameError={setNameError}
                                onValidationAlert={setValidationAlert}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterEventModal;
