import { Input } from "antd";

export default function CustomTextArea({
  label,
  inputValue,
  setInputValue,
  placeholder,
  maxLength = null,
}) {
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const { TextArea } = Input;

  return (
    <TextArea
      label={label}
      variant="outlined"
      value={inputValue}
      placeholder={placeholder}
      onChange={handleChange}
      style={{
        height: 80,
        resize: "none",
      }}
      {...(maxLength ? { maxLength, showCount: true } : {})}
    />
  );
}
