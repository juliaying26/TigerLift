import Button from "./Button";

export default function RideCard({
  children,
  buttonText,
  buttonOnClick,
  buttonClassName,
  buttonStatus = "",
  buttonLoading = false,
  secondaryButtonText = "",
  secondaryButtonOnClick = () => {},
  secondaryButtonClassName = "",
  secondaryButtonStatus = "",
}) {
  // On phones the status shows in the card's top chip row, so the footer only
  // holds a real action (full width) and is hidden otherwise.
  const primaryIsAction = Boolean(buttonText) && !buttonStatus;

  return (
    <div
      data-testid="ridecard"
      className="p-4 md:p-6 bg-white rounded-xl h-full drop-shadow-sm"
    >
      <div className="flex flex-col gap-2 justify-between h-full">
        <div>{children}</div>
        <div
          className={`flex justify-between max-md:mt-1 ${
            primaryIsAction ? "" : "max-md:hidden"
          }`}
        >
          <Button
            onClick={secondaryButtonOnClick}
            className={`${secondaryButtonClassName} max-md:hidden`}
            status={secondaryButtonStatus}
          >
            {secondaryButtonText}
          </Button>
          <Button
            onClick={buttonOnClick}
            className={`${buttonClassName} ${
              primaryIsAction ? "max-md:w-full" : "max-md:hidden"
            }`}
            status={buttonStatus}
            loading={buttonLoading}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
