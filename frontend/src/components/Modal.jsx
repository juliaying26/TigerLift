import { useEffect } from "react";
import IconButton from "./IconButton";

export default function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null; // means modal not open

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      // Disable scrolling on body when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling on body when modal is closed
      document.body.style.overflow = "auto";
    }

    // Cleanup when the component is unmounted or modal closes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div className="absolute inset-0 bg-zinc-800 bg-opacity-50 pointer-events-none"></div>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative flex flex-col gap-4 pointer-events-auto overflow-y-auto max-h-full md:h-auto">
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
