import React from "react";
import CopyEmailIcon from "./CopyEmailIcon";

export default function Pill({ children, className, email }) {
  return (
    <div
      className={`px-3 py-1 bg-zinc-300 rounded-full ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Push content to the left and right
        gap: "8px",
      }}
    >
      <span>{children}</span> {/* Text remains the default font size */}
      <div style={{ marginLeft: "auto" }}>
        {/* Push CopyEmailIcon to the far right */}
        <CopyEmailIcon email={email} />
      </div>
    </div>
  );
}