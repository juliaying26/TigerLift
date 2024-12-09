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
    buttonStyling = "px-3 rounded-full bg-theme_light_2 text-theme_dark_2";
  } else if (status === "accepted") {
    buttonStyling =
      "px-3 rounded-full bg-theme_light_green text-theme_dark_green";
  }

  const disabledStyling =
    "bg-zinc-100 text-zinc-400 cursor-progress hover:text-zinc-400 hover:bg-zinc-100";

  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-3 font-medium ${
        buttonStyling ? buttonStyling : "px-2.5 rounded-md"
      } ${className} ${disabled ? `${disabledStyling} hover:bg-zinc-100` : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
