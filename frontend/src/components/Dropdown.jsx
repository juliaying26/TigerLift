import Select from "react-select";
import { inputStyling } from "../utils/utils";

export default function Dropdown({
  options,
  inputValue,
  setInputValue,
  placeholder,
  isClearable = false,
}) {
  const handleChange = (e) => {
    setInputValue(e || null);
  };

  return (
    <Select
      value={inputValue}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      isClearable={isClearable}
      styles={{
        // Fixes the overlapping problem of the component
        menu: (provided) => ({ ...provided, zIndex: 1000 }),
        menuList: (provided) => ({ ...provided, cursor: "pointer" }),
        input: (provided) => ({ ...provided, cursor: "pointer" }),
        dropdownIndicator: (provided) => ({ ...provided, cursor: "pointer" }),
        clearIndicator: (provided) => ({ ...provided, cursor: "pointer" }),
        option: (provided, state) => ({
          ...provided,
          cursor: "pointer",
          backgroundColor: state.isFocused
            ? "#f0f0f0"
            : provided.backgroundColor, // Change hover color
          color: state.isFocused ? "#000" : provided.color, // Change text color on hover
          // Optionally add a transition effect for smooth hover
        }),
      }}
      className={inputStyling}
    />
  );
}
