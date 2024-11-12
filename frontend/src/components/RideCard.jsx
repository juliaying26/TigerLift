import React from "react";
import Button from "./Button";

export default function RideCard({
  children,
  buttonText,
  buttonOnClick,
  buttonClassName,
}) {
  return (
    <div id="ridecard" className="flex flex-col p-4 bg-white rounded-lg">
      <div className="flex flex-col gap-2">
        <div>{children}</div>
        <div className="self-end">
          <Button onClick={buttonOnClick} className={buttonClassName}>
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
