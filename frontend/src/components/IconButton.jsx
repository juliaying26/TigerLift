import React from "react";

export default function IconButton({ type, onClick, disabled, className }) {
  const renderIcon = () => {
    switch (type) {
      case "back":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="size-6 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        );
      case "checkmark":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="size-6 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        );
      case "xmark":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="size-6 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        );
      case "flip":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
        );
      case "hamburger":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        );
      case "notification":
        return(
          <svg xmlns="http://www.w3.org/2000/svg" 
          width="25"
          className="bi bi-bell" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2z" />
            <path
               fillRule="evenodd"
                d="M8 1a4 4 0 0 0-4 4c0 1.098-.628 2.163-1.217 3.019C2.23 8.347 2 8.962 2 9.586V10a1 1 0 0 0 .293.707l.853.853c.047.047.074.109.115.16C3.738 12.22 5.163 14 8 14s4.262-1.78 4.739-2.28c.041-.051.068-.113.115-.16l.853-.853A1 1 0 0 0 14 10v-.414c0-.624-.23-1.239-.783-1.567C12.628 7.163 12 6.098 12 5a4 4 0 0 0-4-4zM4.5 5c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.364.518 2.418 1.061 3.19.461.683.939 1.278.939 1.396V10h-1.732l-.875.875a.5.5 0 0 1-.354.146h-5.34a.5.5 0 0 1-.354-.146L3.732 10H2v-.414c0-.118.478-.713.939-1.396C3.982 7.418 4.5 6.364 4.5 5z"
             />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full p-1.5 items-center justify-center ${className}`}
    >
      {renderIcon()}
    </button>
  );
}
