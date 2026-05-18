const FormErrorText = ({ children, className = "" }) => (
    <p
        className={className}
        style={{
            margin: "4px 0 0",
            fontSize: "12px",
            color: "#dc2626",
        }}
    >
        {children}
    </p>
);

export default FormErrorText;
