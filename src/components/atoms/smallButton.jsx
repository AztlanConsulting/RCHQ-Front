const SMALL_BUTTON_VARIANTS = {
    default: {
        color: "bg-[#1E3A5F] text-white",
        state: "hover:bg-[#162d4a] active:bg-[#0f1f33]",
        border: "border border-transparent",
    },
    danger: {
        color: "bg-[#A20000] text-white",
        state: "hover:bg-[#870000] active:bg-[#6B0000]",
        border: "border border-transparent",
    },
    cancel: {
        color: "bg-white text-[#121212]",
        state: "hover:bg-slate-50 active:bg-slate-100",
        border: "border border-slate-200",
    },
};

const SmallButton = ({
    text,
    onClick,
    type = "button",
    disabled = false,
    hasNoRollback = false,
    cancel = false,
    hasAdjustableWidth = false,
    leadingIcon = null,
    title,
    className = "",
}) => {
    const variant = hasNoRollback
        ? SMALL_BUTTON_VARIANTS.danger
        : cancel
          ? SMALL_BUTTON_VARIANTS.cancel
          : SMALL_BUTTON_VARIANTS.default;
    const width = hasAdjustableWidth ? "w-full sm:w-auto" : "w-auto";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${width} inline-flex h-8 min-w-[80px] items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors sm:h-10 sm:min-w-[112px] sm:px-5 sm:text-sm ${variant.color} ${variant.state} ${variant.border} shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {leadingIcon ? (
                <span className="flex items-center">{leadingIcon}</span>
            ) : null}
            <span>{text}</span>
        </button>
    );
};

export default SmallButton;
