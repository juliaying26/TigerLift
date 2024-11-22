import React from "react";

export default function Button({
  onClick,
  disabled,
  className = "",
  children,
  status = "",
}) {
  let buttonStyling = "";
  if (status === "pending") {
    buttonStyling = "px-3 rounded-full bg-theme_light_1 text-theme_dark_1";
  } else if (status === "accepted") {
    buttonStyling = "px-3 rounded-full bg-theme_light_2 text-theme_dark_2";
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-1 font-medium ${className} ${
        buttonStyling ? buttonStyling : "px-2.5 rounded-md"
      }`}
    >
      {children}
    </button>
  );
}
