import flag from "/absence-black.svg";
import globe from "/global-black.svg";
import home from "/house-black.svg";
import user from "/personal-black.svg";
import plane from "/vacation-black.svg";

const ICONS = {
    globe,
    home,
    user,
    plane,
    flag,
};

const ButtonGroup = ({ options = [], value, onChange, disabled = false }) => {
    return (
        <div
            role="group"
            aria-label="Seleccionar categoría"
            style={{
                display: "flex",
                overflow: "hidden",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px solid #d1d5db",
                width: "100%",
                boxSizing: "border-box",
                boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            }}
        >
            {options.map((opt, index) => {
                const isActive = opt.value === value;
                const icon = ICONS[opt.icon];

                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        disabled={disabled}
                        onClick={() => !disabled && onChange?.(opt.value)}
                        style={{
                            flex: "1 1 0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "7px 8px",
                            fontSize: "12px",
                            fontWeight: isActive ? "600" : "400",
                            border: "none",
                            borderLeft:
                                index === 0 ? "none" : "1px solid #d1d5db",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.5 : 1,
                            background: isActive ? "#1E3A5F" : "#f8fafc",
                            color: isActive ? "#ffffff" : "#000000",
                            transition:
                                "background 0.15s ease, color 0.15s ease",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive && !disabled) {
                                e.currentTarget.style.background = "#f1f5f9";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive && !disabled) {
                                e.currentTarget.style.background = "#f8fafc";
                            }
                        }}
                    >
                        {icon && (
                            <img
                                src={icon}
                                alt=""
                                aria-hidden="true"
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    flexShrink: 0,
                                    filter: isActive
                                        ? "brightness(0) invert(1)"
                                        : "none",
                                }}
                            />
                        )}

                        <span>{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ButtonGroup;
