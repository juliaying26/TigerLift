import { useEffect } from "react";

// Number of open overlays currently locking the page. Shared by every caller so
// closing one overlay does not unlock the page while another is still open.
let locks = 0;

// Stops the page behind an overlay from scrolling while `active` is true.
export default function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return undefined;
    locks += 1;
    document.body.style.overflow = "hidden";
    return () => {
      locks -= 1;
      if (locks === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [active]);
}
