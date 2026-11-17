import { useLayoutEffect, useRef, useState } from "react";
import useIsMobile from "../utils/useIsMobile";

// Ride note box. On phones a long note is clamped to 2 lines with a "Show more"
// toggle, so it doesn't push the card's Request to Join button far down.
// eslint-disable-next-line react/prop-types -- no component in src declares propTypes
export default function RideNote({ note }) {
  const isMobile = useIsMobile();
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || !isMobile || expanded) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [note, isMobile, expanded]);

  const clamp = isMobile && !expanded;

  return (
    <div className="mb-0.5">
      <span className="font-semibold">Note:</span>
      <div className="py-2 px-3 bg-zinc-100 rounded-lg">
        <p ref={textRef} className={`break-words ${clamp ? "line-clamp-2" : ""}`}>
          {note}
        </p>
        {isMobile && (isClamped || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-theme_medium_2 hover:text-theme_dark_2 font-medium min-h-11 -mb-2"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}
