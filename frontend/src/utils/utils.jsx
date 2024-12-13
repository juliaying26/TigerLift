import CopyEmailButton from "../components/CopyEmailButton";

export const MAX_CAPACITY = 5;

export const getFormattedDate = (date) => {
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export const inputStyling =
  "outline-1 outline-zinc-200 focus:outline-theme_medium_1 text-sm font-normal hover:outline-theme_medium_1";

export const autocompleteStyling =
  "w-full md:max-w-full min-w-[100px] px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal hover:outline-theme_medium_1";

export const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export const bigButtonStyling1 =
  "bg-theme_medium_1 text-white px-4 py-2 rounded-md hover:bg-theme_dark_1 hover:text-white text-center";

export const bigButtonStyling2 =
  "bg-theme_medium_2 text-white px-4 py-2 rounded-md hover:bg-theme_dark_2 hover:text-white text-center";

export const handleShowPopupMessage = (
  setPopupMessageInfo,
  status,
  message
) => {
  setPopupMessageInfo({ status: status, message: message });
  setTimeout(() => setPopupMessageInfo({ status: "", message: "" }), 1500);
};

export const renderToAndFrom = (ride) => {
  return (
    <p className="text-xl flex items-center justify-center gap-2">
      <span className="flex text-center flex-col">
        <strong>{ride.origin["name"]}</strong>
        <span className="text-sm">
          {ride.origin["address"].split(" ").slice(0, -2).join(" ")}
        </span>
      </span>
      →
      <span className="flex text-center flex-col">
        <strong>{ride.destination["name"]}</strong>
        <span className="text-sm">
          {ride.destination["address"].split(" ").slice(0, -2).join(" ")}
        </span>
      </span>
    </p>
  );
};

export const renderRideNote = (ride) => {
  return (
    ride.note && (
      <div className="mb-0.5">
        <span className="font-semibold">Note:</span>
        <div className="py-2 px-3 bg-zinc-100 rounded-lg">
          <p className="break-words">{ride.note}</p>
        </div>
      </div>
    )
  );
};

export const renderRideCardInfo = (ride) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        {renderToAndFrom(ride)}
        <p className="mt-2 mb-1 text-center">
          <span className="px-3 py-1 bg-zinc-200 rounded-full whitespace-nowrap">
            Arrives by {getFormattedDate(new Date(ride.arrival_time))}
          </span>
        </p>
      </div>
      <hr className="border-1 my-3 border-theme_medium_1" />
      <p>
        <span className="font-semibold">Posted by:</span>{" "}
        <span>{ride.admin_name}</span>{" "}
        <CopyEmailButton
          copy={[ride.admin_email]}
          text="Copy Email"
          className="inline-flex text-theme_medium_2 hover:text-theme_dark_2 ml-1 mb-0.5 align-middle"
        />
      </p>
      <p>
        <span className="font-semibold">Seats Taken:</span>{" "}
        {ride.current_riders.length}/{ride.max_capacity}
      </p>
      {renderRideNote(ride)}
    </>
  );
};

export const flipFields = (
  origin,
  dest,
  originRef,
  destinationRef,
  setOrigin,
  setDest
) => {
  const tempOrigin = origin;

  setOrigin(dest);
  setDest(tempOrigin);

  if (originRef.current && destinationRef.current) {
    const tempOriginValue = originRef.current.value;
    originRef.current.value = destinationRef.current.value;
    destinationRef.current.value = tempOriginValue;
  }
};
