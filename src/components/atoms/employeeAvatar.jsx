const API_URL = import.meta.env.VITE_API_URL;;

const EmployeeAvatar = ({ picture, fullName, className = "w-12 h-12" }) => {
    const imageUrl = picture ? `${API_URL}/${picture}` : null;

    return (
        <div
            className={`${className} rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0`}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                />
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-gray-600"
                >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
            )}
        </div>
    );
};

export default EmployeeAvatar;
