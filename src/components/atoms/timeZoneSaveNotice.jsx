const TimeZoneSaveNotice = ({ children }) => {
    if (!children) return null;

    return (
        <p className="mx-auto mt-1 mb-4 max-w-[30rem] rounded-md bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
            {children}
        </p>
    );
};

export default TimeZoneSaveNotice;
