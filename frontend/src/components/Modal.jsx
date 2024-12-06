import React from "react";
import IconButton from "./IconButton";

export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null; // means modal not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div className="absolute inset-0 bg-zinc-800 bg-opacity-50 pointer-events-none"></div>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative flex flex-col gap-4 pointer-events-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <IconButton
            type="xmark"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
          ></IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
