const Label = ({ text, htmlFor }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="absolute top-[7.63%] left-[3.80%] font-bold text-white text-base"
    >
      {text}
    </label>
  );
};

export default Label;