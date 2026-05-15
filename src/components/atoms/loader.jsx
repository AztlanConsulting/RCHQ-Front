const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
};

const Loader = ({ size = "md" }) => {
    return (
        <div className="flex items-center justify-center">
            <span
                role="status"
                aria-label="Cargando"
                className={[
                    "rounded-full border-slate-200 border-t-slate-700 animate-spin",
                    sizeStyles[size] ?? sizeStyles.md,
                ].join(" ")}
            />
        </div>
    );
};

export default Loader;
