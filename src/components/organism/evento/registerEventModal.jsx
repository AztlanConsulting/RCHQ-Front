import Alert from "../../atoms/alerts";
import TextField from "../../atoms/textField";
import ButtonGroup from "../../molecules/buttonGroup";
import CasaForm from "./forms/houseForm";
import PersonalForm from "./forms/personalForm";
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
    casa: CasaForm,
    personal: PersonalForm,
};

const normalizeRole = (role) =>
    String(role ?? "")
        .trim()
        .toLowerCase();

const canViewCategory = (option, role) => {
    const normalizedRole = normalizeRole(role);

    if (option.value === "casa" || option.value === "ausencias") {
        return normalizedRole === "coordinador";
    }

    if (option.value === "global") {
        return normalizedRole === "admin";
    }

    return true;
};

const RegisterEventModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialStartDate,
    initialEndDate,
}) => {
    const viewerRole = getCalendarViewerRole();
    const visibleCategoryOptions = CATEGORY_OPTIONS.filter((option) =>
        canViewCategory(option, viewerRole),
    );
    const defaultCategory = visibleCategoryOptions[0]?.value ?? "personal";

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

    const visibleCategoryValues = visibleCategoryOptions.map(
        ({ value }) => value,
    );
    const effectiveCategoryKey = visibleCategoryValues.includes(categoryKey)
        ? categoryKey
        : defaultCategory;
    const SubForm = CATEGORY_FORMS[effectiveCategoryKey] ?? null;

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
                    padding: "16px",
                    pointerEvents: "none",
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
                    {/* Encabezado fijo — nunca hace scroll */}
                    <div style={{ flexShrink: 0 }}>
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
