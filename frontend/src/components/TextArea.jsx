import React, { useState } from "react";
import TextArea from "antd/lib/input/TextArea";

export default function Input({
  label,
  inputValue,
  setInputValue,
  placeholder,
  maxLength = null,
}) {
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <TextArea
      label={label}
      variant="outlined"
      value={inputValue}
      fullWidth
      placeholder={placeholder}
      onChange={handleChange}
      style={{ height: 80, resize: "none" }}
      {...(maxLength ? { maxLength, showCount: true } : {})}
    />
  );
}
