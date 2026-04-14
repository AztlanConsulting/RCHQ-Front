const TextField = ({
  value,
  setValue,
  id,
  type = "text",
  placeholder,
  iconRight = null,
}) => {
  
  return (
    <div className="absolute top-[34px] left-[19px] w-[462px] h-[50px] flex items-center bg-neutral-50 rounded-lg shadow-[inset_0px_4px_4px_#00000040]">
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-full ml-[19px] font-medium text-[#aaaaaa] text-base bg-transparent border-0 outline-none placeholder-[#aaaaaa]"
      />

      {iconRight && (
        <div className="mr-[13px] flex items-center justify-center">
          {typeof iconRight === "string" ? (
            <img src={iconRight} alt="icono" className="h-6 w-6" />
          ) : (
            iconRight
          )}
        </div>
      )}
    </div>
  );
};

export default TextField;