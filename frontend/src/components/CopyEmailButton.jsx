import { useState } from "react";

export default function CopyEmailIcon({ text, copy, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(copy.join(", "))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1250);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <button
      onClick={handleCopy}
      className={`${
        copied ? "!text-theme_dark_2 !cursor-auto" : ""
      } ${className}`}
    >
      {copied ? (
        <div className="text-sm flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 mb-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          Copied!
        </div>
      ) : (
        // Smaller icon
        <div className="text-sm flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
          {text}
        </div>
        // Smaller icon
      )}
    </button>
  );
}
