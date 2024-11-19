import React from "react";
import Button from "./Button";

export default function RideCard({
  children,
  buttonText,
  buttonOnClick,
  buttonClassName,
  buttonStatus = "",
  secondaryButtonText = "",
  secondaryButtonOnClick = () => {},
  secondaryButtonClassName = "",
  secondaryButtonStatus = "",
}) {
  return (
    <div
      id="ridecard"
      className="p-6 bg-white rounded-lg h-full drop-shadow-sm"
    >
      <div className="flex flex-col gap-2 justify-between h-full">
        <div>{children}</div>
        <div className="flex justify-between">
          <Button
            onClick={secondaryButtonOnClick}
            className={secondaryButtonClassName}
            status={secondaryButtonStatus}
          >
            {secondaryButtonText}
          </Button>
          <Button
            onClick={buttonOnClick}
            className={buttonClassName}
            status={buttonStatus}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
