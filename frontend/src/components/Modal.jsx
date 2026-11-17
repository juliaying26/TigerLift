import IconButton from "./IconButton";
import useIsMobile from "../utils/useIsMobile";
import useLockBodyScroll from "../utils/useLockBodyScroll";

// Centered dialog on desktop; full-screen sheet with a sticky header on phones
export default function Modal({ isOpen, title, onClose, children }) {
  const isMobile = useIsMobile();
  // the sheet covers the page on phones, so stop the page behind it scrolling
  useLockBodyScroll(isOpen && isMobile);

  if (!isOpen) return null; // means modal not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div className="absolute inset-0 bg-zinc-800 bg-opacity-50 pointer-events-none"></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-xl p-6 w-full max-w-lg relative flex flex-col gap-4 pointer-events-auto overflow-y-auto max-h-full md:h-auto overscroll-contain max-md:h-full max-md:max-w-none max-md:rounded-none max-md:p-4 max-md:pt-0 max-md:pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex justify-between items-center max-md:sticky max-md:top-0 max-md:z-10 max-md:bg-white max-md:-mx-4 max-md:px-4 max-md:pt-[max(0.75rem,env(safe-area-inset-top))] max-md:pb-3 max-md:border-b max-md:border-zinc-200">
          <h2 className="text-2xl font-semibold max-md:text-xl">{title}</h2>
          <IconButton
            type="xmark"
            onClick={onClose}
            ariaLabel="Close"
            className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
          ></IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
