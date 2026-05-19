const CheckboxField = ({ id, label, checked, onChange }) => (
    <label
        htmlFor={id}
        style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#111827",
            cursor: "pointer",
            userSelect: "none",
        }}
    >
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{
                width: "15px",
                height: "15px",
                accentColor: "#1E3A5F",
                cursor: "pointer",
                flexShrink: 0,
            }}
        />

        {label}
    </label>
);

export default CheckboxField;
