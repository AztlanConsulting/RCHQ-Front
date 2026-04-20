import error from "/error.svg";
import check from "/check.svg";

const Alert = ({ icon = "", type = "success", message }) => {
  const styles = {
    success: {
      container: "bg-green-500 text-black",
      icon: check,
    },
    error: {
      container: "bg-[#dd4344] text-white",
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
    <div
      className={`flex w-full gap-3 rounded-lg p-4 shadow-md ${current.container}`}
    >
      {current.icon && (
        <div className="flex shrink-0 items-center self-center">
          <img src={current.icon} alt={type} className="h-5 w-5" />
        </div>
      )}

      <div className="min-w-0 flex-1 text-sm font-medium whitespace-pre-line sm:text-base">
        {message}
      </div>
    </div>
  );
};

export default Alert;
