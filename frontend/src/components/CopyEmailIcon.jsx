import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

const CopyEmailIcon = ({ email }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        color: copied ? "green" : "black",
      }}
    >
      {copied ? (
        <CheckIcon style={{ fontSize: "16px" }} /> // Smaller icon
      ) : (
        <ContentCopyIcon style={{ fontSize: "16px" }} /> // Smaller icon
      )}
    </button>
  );
};

export default CopyEmailIcon;
