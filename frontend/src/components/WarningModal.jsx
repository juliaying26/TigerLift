import React from "react";
import Button from "./Button";
import IconButton from "./IconButton";

export default function WarningModal({ isOpen, title, children }) {
  if (!isOpen) return null; // means modal not open

  return (
    <div className="fixed inset-0 bg-zinc-800 bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm relative flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
