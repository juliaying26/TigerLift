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

  const disabledStyling = "bg-zinc-100 text-zinc-400 cursor-progress";

  return (
    <button
      onClick={onClick}
      className={`py-1 font-medium ${
        buttonStyling ? buttonStyling : "px-2.5 rounded-md"
      } ${className} ${disabled ? `${disabledStyling} hover:bg-zinc-100` : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
