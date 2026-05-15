import { useId } from "react";

const sizeStyles = {
    sm: { select: "py-1.5 pl-3 pr-8 text-sm", icon: "right-2.5 h-4 w-4" },
    md: { select: "py-2 pl-3 pr-9 text-sm", icon: "right-3 h-4 w-4" },
    lg: { select: "py-2.5 pl-3.5 pr-10 text-base", icon: "right-3 h-5 w-5" },
};

const NativeSelect = ({ size = "md", options, className, ...props }) => {
    const id = useId();
    const { select: selectClass, icon: iconClass } =
        sizeStyles[size] ?? sizeStyles.md;

    return (
        <div
            className={["relative inline-flex w-full items-center", className]
                .filter(Boolean)
                .join(" ")}
        >
            <select
                id={id}
                {...props}
                className={[
                    "w-full appearance-none rounded-lg border border-slate-200 bg-white font-medium text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50",
                    selectClass,
                ].join(" ")}
            >
                {options.map((opt) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                    >
                        {opt.label}
                    </option>
                ))}
            </select>

            <svg
                className={[
                    "pointer-events-none absolute text-slate-400",
                    iconClass,
                ].join(" ")}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    );
};

export default NativeSelect;
