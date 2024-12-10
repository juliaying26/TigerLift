import Select from "react-select";
import { inputStyling } from "../utils/utils";
import tailwindConfig from "../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

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

  const fullConfig = resolveConfig(tailwindConfig);

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
        input: (provided, state) => ({
          ...provided,
          cursor: "pointer",
        }),
        dropdownIndicator: (provided) => ({ ...provided, cursor: "pointer" }),
        clearIndicator: (provided) => ({ ...provided, cursor: "pointer" }),
        option: (provided, state) => ({
          ...provided,
          cursor: "pointer",
          backgroundColor: state.isFocused
            ? fullConfig.theme.colors.theme_light_1
            : provided.backgroundColor,
          color: state.isFocused ? "#000" : provided.color, // Change text color on hover
        }),
        control: (provided, state) => ({
          ...provided,
          borderColor: fullConfig.theme.colors.zinc["200"],
          boxShadow: "none",
          "&:hover": {
            borderColor: fullConfig.theme.colors.theme_medium_1,
          },
          "&:active": {
            borderColor: fullConfig.theme.colors.theme_medium_1,
            boxShadow: "none",
            outline: "none",
          },
        }),
        placeholder: (provided) => ({
          ...provided,
          color: fullConfig.theme.colors.zinc["400"],
        }),
      }}
      className={inputStyling}
    />
  );
}
