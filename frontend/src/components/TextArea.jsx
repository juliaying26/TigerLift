import React, { useState } from "react";
import TextArea from "antd/lib/input/TextArea";

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
      <TextArea
        label={label}
        variant="outlined"
        value={inputValue}
        fullWidth
        placeholder={placeholder}
        onChange={handleChange}
        style={{ height: 80, resize: "none" }}
      />
    </div>
  );
}
