import React from "react";

export default function Button({
  onClick,
  disabled,
  className,
  children,
  status = "",
}) {
  let buttonStyling = "";
  if (status === "pending") {
    buttonStyling = "bg-theme_light_1 text-theme_dark_1";
  } else if (status === "accepted") {
    buttonStyling = "bg-theme_light_2 text-theme_dark_2";
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded-md ${className} ${buttonStyling}`}
    >
      {children}
    </button>
  );
}
