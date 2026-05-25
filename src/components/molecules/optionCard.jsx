import Button from "../atoms/button"; 

const OptionCard = ({ icon, label, onClick }) => {
  return (
    <Button
      onClick={onClick}
      bgColor="bg-[#1a2f5e]"
      hoverColor="hover:opacity-85"
      activeColor="active:opacity-70"
      width="w-[8.5rem] sm:w-[8.75rem] md:w-[7rem] lg:w-[7.5rem]"
      height="h-[8.5rem] sm:h-[8.75rem] md:h-[7rem] lg:h-[7.5rem]"
      className="!rounded-2xl flex-col gap-2.5 border-none px-3 py-4 sm:gap-3 md:gap-2 md:px-2 md:py-3"
    >
      <span className="text-white">{icon}</span>
      <span className="text-center text-xs font-medium text-white md:text-[0.8rem] lg:text-sm">
        {label}
      </span>
    </Button>
  );
};

export default OptionCard;
