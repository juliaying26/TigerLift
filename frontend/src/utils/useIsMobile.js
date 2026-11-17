import { useEffect, useState } from "react";

// Matches Tailwind's `max-md:` variant: anything narrower than 768px is a phone.
export const MOBILE_QUERY = "(max-width: 767.98px)";

export const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

// true while the viewport is phone sized; updates on resize and rotation
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
