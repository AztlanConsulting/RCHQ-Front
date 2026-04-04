const Button = ({ children, type = "button", onClick, disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(13,148,136,0.35)] focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
    >
      {children}
    </button>
  );
};

export default Button;
