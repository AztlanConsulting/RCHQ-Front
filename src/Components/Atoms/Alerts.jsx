import error from "/error.svg";

const Alert = ({ icon = "", type = "success", message }) => {
  const styles = {
    success: {
      container: "bg-green-500 text-black",
      icon: icon,
    },
    error: {
      container: "bg-red-500 text-black",
      icon: error,
    },
    warning: {
      container: "bg-yellow-400 text-black",
      icon: icon,
    },
    info: {
      container: "bg-blue-500 text-white",
      icon: icon,
    },
  };

  const current = styles[type];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-md ${current.container}`}>
      {current.icon && <img src={current.icon} alt={type} className="h-5 w-5" />}
      <p className="font-medium whitespace-pre-line">{message}</p>
    </div>
  );
};

export default Alert;