const variantStyles = {
    "page-title": "text-2xl font-bold text-slate-900",
    "display-name": "text-2xl font-base tracking-tight text-slate-900 ",
    subtitle: "text-sm font-semibold text-slate-500 sm:text-base",
    "metric-label": "text-xs font-semibold text-slate-500 sm:text-sm",
    "metric-value": "text-base font-normal text-black sm:text-lg",
    "section-title": "text-lg font-semibold text-black sm:text-xl",
    body: "text-base font-normal text-black",
};

const sizeModifiers = {
    sm: "text-sm sm:text-sm",
    md: "",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
};

const weightMap = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
};

const colorMap = {
    black: "text-black",
    slate: "text-slate-600",
    muted: "text-slate-500",
    brand: "text-slate-900",
};

const Type = ({
    variant = "body",
    size,
    weight,
    color,
    className = "",
    as: Component = "span",
    children,
    ...rest
}) => {
    const base = variantStyles[variant] ?? variantStyles.body;
    const sizeExtra = size ? sizeModifiers[size] : "";
    const w = weight ? weightMap[weight] : "";
    const c = color ? colorMap[color] : "";

    const classes = [base, sizeExtra, w, c, className]
        .filter(Boolean)
        .join(" ");

    return (
        <Component className={classes} {...rest}>
            {children}
        </Component>
    );
};

export default Type;
