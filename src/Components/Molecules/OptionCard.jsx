import Button from "../Atoms/Button"; 

const OptionCard = ({ icon, label, onClick }) => {
  return (
    <Button
      onClick={onClick}
      bgColor="bg-[#1a2f5e]"
      hoverColor="hover:opacity-85"
      activeColor="active:opacity-70"
      width="w-40"
      height="h-40"
      className="!rounded-2xl flex-col gap-3 border-none"
    >
      <span className="text-white">{icon}</span>
      <span className="text-white text-sm font-medium">{label}</span>
    </Button>
  );
};

export default OptionCard;
