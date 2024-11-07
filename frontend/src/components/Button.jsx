import React from "react";

export default function Button({ onClick, disabled, className, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded-md ${className}`}
    >
      {children}
    </button>
  );
}
