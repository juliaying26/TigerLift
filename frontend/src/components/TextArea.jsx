import React, { useState } from "react";
import TextField from "@mui/material/TextField";

export default function Input({
  label,
  inputValue,
  setInputValue,
  placeholder,
}) {
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="p-1">
      <TextField
        label={label}
        variant="outlined"
        type="email"
        value={inputValue}
        fullWidth
        placeholder={placeholder}
        onChange={handleChange}
      />

      <p> User input from field above (testing purposes): {inputValue} </p>
    </div>
  );
}
