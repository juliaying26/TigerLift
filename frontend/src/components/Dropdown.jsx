import React, { useState } from "react";
import Select from "react-select";

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
      }}
    />
  );
}
