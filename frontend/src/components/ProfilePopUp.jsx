import React from "react";
import IconButton from "./IconButton";

export default function ProfilePopup({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 w-80 max-h-[80vh] overflow-y-auto shadow-lg fixed top-4 right-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{title}</h2>

          <IconButton
            type="xmark"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 ml-2"
          />
        </div>

        <a
          href="/api/logout"
          className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1 self-end"
        >
          Log out
        </a>
        <div>{children}</div>
      </div>
    </div>
  );
}
