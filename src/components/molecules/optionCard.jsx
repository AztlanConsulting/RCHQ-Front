const OptionCard = ({ icon, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[8.5rem] w-[8.5rem] flex-col items-center justify-center gap-2.5 rounded-2xl border-none bg-[#1a2f5e] px-3 py-4 transition-opacity hover:opacity-85 active:opacity-70 sm:h-[8.75rem] sm:w-[8.75rem] sm:gap-3 md:h-[7rem] md:w-[7rem] md:gap-2 md:px-2 md:py-3 lg:h-[7.5rem] lg:w-[7.5rem]"
    >
      <span className="text-white">{icon}</span>
      <span className="text-center text-xs font-medium text-white md:text-[0.8rem] lg:text-sm">
        {label}
      </span>
    </button>
  );
};

export default OptionCard;
