import { createPortal } from "react-dom";
import useIsMobile from "../utils/useIsMobile";
import useLockBodyScroll from "../utils/useLockBodyScroll";

// Centered confirm box on desktop; content-height bottom sheet on phones
export default function WarningModal({ isOpen, title, children }) {
  const isMobile = useIsMobile();
  useLockBodyScroll(isOpen && isMobile);

  if (!isOpen) return null; // means modal not open

  const overlay = (
    <div className="fixed inset-0 bg-zinc-800 bg-opacity-50 flex items-center justify-center z-40 max-md:items-end">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-xl p-6 w-full max-w-sm relative flex flex-col gap-3 overscroll-contain max-md:max-h-[85vh] max-md:max-w-none max-md:rounded-t-2xl max-md:rounded-b-none max-md:p-4 max-md:pt-5 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] max-md:overflow-y-auto"
      >
        <div className="flex justify-between items-center max-md:pb-3 max-md:border-b max-md:border-zinc-200">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  // On phones, render at body level: an ancestor with a CSS filter (RideEditor's
  // drop-shadow) would otherwise turn `fixed inset-0` into the card's box.
  // Desktop keeps the original in-place overlay.
  return isMobile ? createPortal(overlay, document.body) : overlay;
}
