import React from "react";
import IconButton from "./IconButton";
import Button from "./Button";

export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null; // means modal not open

  return (
    <div className="fixed inset-0 bg-neutral-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <IconButton
            type="xmark"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800"
          ></IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
