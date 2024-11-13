import React from "react";
import Button from "./Button";

export default function RideCard({
  children,
  buttonText,
  buttonOnClick,
  buttonClassName,
}) {
  return (
    <div id="ridecard" className="p-6 bg-white rounded-lg h-full">
      <div className="flex flex-col gap-2 justify-between h-full">
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
