const CheckboxField = ({ id, label, checked, onChange, disabled = false }) => (
    <label
        htmlFor={id}
        style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#111827",
            cursor: disabled ? "not-allowed" : "pointer",
            userSelect: "none",
            opacity: disabled ? 0.6 : 1,
        }}
    >
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            style={{
                width: "15px",
                height: "15px",
                accentColor: "#1E3A5F",
                cursor: disabled ? "not-allowed" : "pointer",
                flexShrink: 0,
            }}
        />

        {label}
    </label>
);

export default CheckboxField;
