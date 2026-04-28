const StatusBadge = ({ isActive, className = "" }) => {
  const bgColor = isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const statusText = isActive ? "Activo" : "Inactivo";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${className}`}
    >
      {statusText}
    </span>
  );
};

export default StatusBadge;
