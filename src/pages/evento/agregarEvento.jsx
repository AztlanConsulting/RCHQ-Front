import { useEffect, useState } from "react";

import Alert from "../../components/atoms/alerts";
import TextField from "../../components/atoms/textField";
import ButtonGroup from "../../components/molecules/buttonGroup";
import CasaForm from "./forms/casaForm";

const CATEGORY_OPTIONS = [
    { value: "global", label: "Global", icon: "globe" },
    { value: "casa", label: "Casa", icon: "home" },
    { value: "personal", label: "Personal", icon: "user" },
    { value: "vacaciones", label: "Vacaciones", icon: "plane" },
    { value: "ausencias", label: "Ausencias", icon: "flag" },
];

const CATEGORY_FORMS = {
    casa: CasaForm,
};

const RegisterEventModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialStartDate,
    initialEndDate,
}) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [categoryKey, setCategoryKey] = useState("casa");
    const [validationAlert, setValidationAlert] = useState(null);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setNameError("");
            setCategoryKey("casa");
            setValidationAlert(null);
            setAnimationKey(0);
        }
    }, [isOpen]);

    const handleCategoryChange = (val) => {
        setCategoryKey(val);
        setAnimationKey((prev) => prev + 1);
        setNameError("");
        setValidationAlert(null);
    };

    if (!isOpen) return null;

    const SubForm = CATEGORY_FORMS[categoryKey] ?? null;

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
                    justifyContent: "flex-end",
                    paddingRight: "5vw",
                    pointerEvents: "none",
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
                        maxHeight: "90vh",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <div>
                        <TextField
                            id="event-name"
                            placeholder="Agregar título"
                            value={name}
                            setValue={(v) => {
                                setName(v);
                                setNameError("");
                            }}
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

                    <ButtonGroup
                        options={CATEGORY_OPTIONS}
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
