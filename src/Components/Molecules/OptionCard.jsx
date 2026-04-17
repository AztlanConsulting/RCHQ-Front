const OptionCard = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-40 h-40 bg-[#1a2f5e] rounded-2xl flex flex-col items-center justify-center gap-3
                 cursor-pointer transition-opacity hover:opacity-85 active:opacity-70 border-none"
    >
      <span className="text-white">{icon}</span>
      <span className="text-white text-sm font-medium">{label}</span>
    </button>
  );
};

export default OptionCard;