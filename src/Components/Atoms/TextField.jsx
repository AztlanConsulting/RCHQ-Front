const TextField = ({ value, setValue, text, placeholder }) => {
  return (
      <div className="absolute top-[34px] left-[19px] w-[462px] h-[50px] flex items-center bg-neutral-50 rounded-lg shadow-[inset_0px_4px_4px_#00000040]">
        <input
          id={text}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-full ml-[19px] font-medium text-[#aaaaaa] text-base bg-transparent border-0 outline-none placeholder-[#aaaaaa]"
        />
      </div>
  );
};

export default TextField;