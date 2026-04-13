const label = ({ text }) => {
  return (
    <label
      htmlFor={text}
      className="absolute w-[29.80%] h-[16.10%] top-[7.63%] left-[3.80%] font-bold text-white text-base"
    >
      {text}
    </label>
  );
};

export default label;