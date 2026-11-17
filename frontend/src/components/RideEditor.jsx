// Inline editor shown on a posted ride's card in place of its details
import { useState } from "react";
import dayjs from "dayjs";
import Autocomplete from "react-google-autocomplete";
import Button from "./Button";
import Dropdown from "./Dropdown";
import DateTimePicker from "./DateTimePicker";
import CustomTextArea from "./TextArea";
import IconButton from "./IconButton";
import Pill from "./Pill";
import WarningModal from "./WarningModal";
import {
  MAX_CAPACITY,
  autocompleteStyling,
  placeToLocation,
  renderToAndFrom,
} from "../utils/utils";

const autocompleteOptions = {
  fields: ["formatted_address", "geometry", "name", "place_id"],
  types: ["establishment", "geocode"],
};

const formatForEmail = (dateTime) =>
  dayjs(dateTime).tz("America/New_York").format("MMMM D, YYYY, h:mm A");

export default function RideEditor({ ride, onDone, onCancel }) {
  const google_api_key = import.meta.env.VITE_GOOGLE_API_KEY;

  const [origin, setOrigin] = useState(ride.origin);
  const [destination, setDestination] = useState(ride.destination);
  const [arrivalDate, setArrivalDate] = useState(dayjs(ride.arrival_time));
  const [arrivalTime, setArrivalTime] = useState(dayjs(ride.arrival_time));
  const [capacity, setCapacity] = useState({
    value: ride.max_capacity,
    label: ride.max_capacity,
  });
  const [note, setNote] = useState(ride.note || "");
  const [currentRiders, setCurrentRiders] = useState(ride.current_riders);
  const [requestedRiders, setRequestedRiders] = useState(
    ride.requested_riders
  );
  const [rejectedRiders, setRejectedRiders] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [warning, setWarning] = useState(null); // { title, message, buttonText, onConfirm? }
  const [deleteRideMessage, setDeleteRideMessage] = useState("");

  // location would affect people who already joined or asked to join
  const isLocationLocked =
    ride.current_riders.length > 0 || ride.requested_riders.length > 0;

  const locationChanged =
    origin?.id !== ride.origin.id || destination?.id !== ride.destination.id;
  const timeChanged =
    !dayjs(arrivalDate).isSame(dayjs(ride.arrival_time), "day") ||
    !dayjs(arrivalTime).isSame(dayjs(ride.arrival_time), "minute");
  const capacityChanged = capacity.label !== ride.max_capacity;
  const noteChanged = note !== (ride.note || "");
  const ridersChanged =
    currentRiders.length !== ride.current_riders.length ||
    requestedRiders.length !== ride.requested_riders.length ||
    rejectedRiders.length !== 0;
  const hasChanges =
    locationChanged ||
    timeChanged ||
    capacityChanged ||
    noteChanged ||
    ridersChanged;
  const isValid =
    origin &&
    destination &&
    arrivalDate?.isValid?.() &&
    arrivalTime?.isValid?.();

  const capacityOptions = [];
  for (let i = Math.max(1, currentRiders.length); i <= MAX_CAPACITY; i++) {
    capacityOptions.push({ value: i, label: i });
  }

  const handleCancel = () => {
    if (hasChanges) {
      setWarning({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Do you want to discard them?",
        buttonText: "Discard Changes",
        onConfirm: onCancel,
      });
    } else {
      onCancel();
    }
  };

  const handleAcceptRider = (rider) => {
    if (currentRiders.length >= capacity.label) {
      setWarning({
        title: "Capacity Full",
        message: `The capacity for this rideshare is full. Please remove a rider before accepting another, or increase the capacity of the rideshare (maximum ${MAX_CAPACITY}).`,
        buttonText: "Okay",
      });
      return;
    }
    setCurrentRiders((prev) => [...prev, rider]);
    setRequestedRiders((prev) => prev.filter(([n]) => n !== rider[0]));
  };

  const handleRejectRider = (rider) => {
    setRejectedRiders((prev) => [...prev, rider]);
    setRequestedRiders((prev) => prev.filter(([n]) => n !== rider[0]));
  };

  // moves an accepted rider back to pending
  const handleRemoveRider = (rider) => {
    setCurrentRiders((prev) => prev.filter(([n]) => n !== rider[0]));
    setRequestedRiders((prev) => [...prev, rider]);
  };

  const postAndFinish = async (endpoint, body) => {
    setIsSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseData = await response.json();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
      await onDone(responseData);
    } catch (error) {
      console.error("Error during fetch:", error);
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    // picked in the browser's timezone, like when creating a ride
    const new_arrival_time = dayjs(
      `${arrivalDate.format("YYYY-MM-DD")}T${arrivalTime.format("HH:mm:ss")}`
    );
    if (timeChanged && !new_arrival_time.isAfter(dayjs())) {
      setWarning({
        title: "Invalid Input",
        message: "Cannot enter a date in the past.",
        buttonText: "Okay",
      });
      return;
    }

    const toRider = ([requester_id, full_name, mail]) => ({
      requester_id,
      full_name,
      mail,
    });

    postAndFinish("/api/batchupdateriderequest", {
      rideid: ride.id,
      accepting_riders: currentRiders.map(toRider),
      rejecting_riders: rejectedRiders.map(toRider),
      pending_riders: requestedRiders.map(toRider),
      new_capacity: capacity.label,
      new_arrival_time: new_arrival_time.toISOString(),
      formatted_arrival_time: formatForEmail(new_arrival_time),
      origin_name: origin.name,
      destination_name: destination.name,
      changedTime: timeChanged,
      ...(locationChanged && {
        new_origin: origin,
        new_destination: destination,
      }),
      ...(noteChanged && { new_note: note }),
    });
  };

  const handleDelete = () => {
    setWarning({
      title: "Delete this Rideshare?",
      message: "Are you sure you want to delete this rideshare?",
      buttonText: "Delete Rideshare",
      onConfirm: () =>
        postAndFinish("/api/deleteride", {
          rideid: ride.id,
          formatted_arrival_time: formatForEmail(ride.arrival_time),
          deleteRideMessage: deleteRideMessage,
          current_riders: ride.current_riders,
          origin_name: ride.origin["name"],
          destination_name: ride.destination["name"],
        }),
    });
  };

  // any typing invalidates the location until a suggestion is picked
  const renderLocationInput = (label, location, setLocation) => (
    <div className="flex flex-col">
      <p className="font-medium mb-1">{label}</p>
      <Autocomplete
        className={autocompleteStyling}
        apiKey={google_api_key}
        defaultValue={location?.name}
        placeholder={`Enter ${label.toLowerCase()}`}
        onPlaceSelected={(place) => {
          if (place?.place_id) setLocation(placeToLocation(place));
        }}
        onChange={() => setLocation(null)}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        options={autocompleteOptions}
      />
      {!location && (
        <p className="text-sm text-zinc-500 mt-1">
          Choose a place from the suggestions.
        </p>
      )}
    </div>
  );

  const isDeleteWarning = warning?.title === "Delete this Rideshare?";
  const isInfoWarning =
    warning?.title === "Capacity Full" || warning?.title === "Invalid Input";

  return (
    <div
      data-testid="ride-editor"
      className="p-4 md:p-6 bg-white rounded-xl h-full drop-shadow-sm ring-2 ring-theme_medium_1 flex flex-col gap-3"
    >
      {origin && destination ? (
        renderToAndFrom({ origin, destination })
      ) : (
        <p className="text-center text-zinc-500">Choose both locations</p>
      )}

      {isLocationLocked ? (
        <p className="text-sm text-zinc-700 rounded-md bg-info_light p-2">
          Location is locked because people have joined or requested this
          ride. Changing it could send them to the wrong place.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {renderLocationInput("Origin", origin, setOrigin)}
          {renderLocationInput("Destination", destination, setDestination)}
        </div>
      )}

      <div>
        <p className="font-medium mb-1">Arrival Time (in ET)</p>
        <DateTimePicker
          date={arrivalDate}
          setDate={setArrivalDate}
          time={arrivalTime}
          setTime={setArrivalTime}
          allowClear={false}
        />
        {ride.current_riders.length > 0 && (
          <p className="text-sm text-zinc-500 mt-1">
            Current riders will be emailed if you change the time.
          </p>
        )}
      </div>

      <div>
        <p className="font-medium mb-1">
          Capacity{" "}
          <span className="font-normal text-zinc-500">
            ({currentRiders.length} seats taken)
          </span>
        </p>
        <Dropdown
          inputValue={capacity}
          setInputValue={setCapacity}
          options={capacityOptions}
        />
      </div>

      <div>
        <p className="font-medium mb-1">Note to Riders</p>
        <CustomTextArea
          placeholder="Add an optional note here. (Max 200 characters)."
          inputValue={note}
          setInputValue={setNote}
          maxLength={200}
        />
      </div>

      <div>
        <p className="font-medium mb-1">Current Riders</p>
        {currentRiders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {currentRiders.map((rider) => (
              <Pill key={rider[0]} className="max-md:py-0.5 max-md:pr-1">
                <div className="flex items-center justify-between w-full">
                  <div>{rider[1]}</div>
                  <IconButton
                    type="xmark"
                    onClick={() => handleRemoveRider(rider)}
                    ariaLabel={`Remove ${rider[1]}`}
                    className="text-zinc-700 hover:text-zinc-500"
                  />
                </div>
              </Pill>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No current riders.</p>
        )}
      </div>

      <div>
        <p className="font-medium mb-1">Requests to Join</p>
        <div className="overflow-y-auto bg-zinc-100 rounded-lg p-3 max-h-40 flex flex-col gap-2 max-md:max-h-none">
          {requestedRiders.length > 0 ? (
            requestedRiders.map((rider) => (
              <Pill key={rider[0]} className="max-md:rounded-2xl max-md:py-2">
                <div className="flex justify-between items-center gap-2 max-[359px]:flex-wrap">
                  <div className="flex flex-col min-w-0">
                    <span>{rider[1]}</span>
                    {rider[3] && (
                      <span className="text-sm text-zinc-600 break-words">
                        “{rider[3]}”
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 max-md:gap-3 max-[359px]:w-full max-[359px]:justify-end">
                    <IconButton
                      type="checkmark"
                      onClick={() => handleAcceptRider(rider)}
                      ariaLabel={`Accept ${rider[1]}`}
                      className="bg-theme_green text-theme_dark_green hover:bg-theme_light_green"
                    />
                    <IconButton
                      type="xmark"
                      onClick={() => handleRejectRider(rider)}
                      ariaLabel={`Reject ${rider[1]}`}
                      className="bg-theme_red text-theme_dark_red hover:bg-theme_light_red"
                    />
                  </div>
                </div>
              </Pill>
            ))
          ) : (
            <p className="text-sm">No requests to join</p>
          )}
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          Newly accepted riders are emailed when you save. You are
          responsible for coordinating logistics with them.
        </p>
      </div>

      <div className="flex justify-between items-center gap-2 pt-1">
        <Button
          onClick={handleDelete}
          className="hover:bg-theme_red border border-zinc-300 text-zinc-700 hover:text-white max-md:px-4"
          disabled={isSaving}
        >
          Delete
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
            className="border border-zinc-300 text-zinc-700 hover:bg-zinc-100 max-md:px-4"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={`max-md:px-4 ${
              hasChanges && isValid
                ? "bg-theme_green text-white hover:bg-theme_dark_green"
                : ""
            }`}
            disabled={!hasChanges || !isValid}
            loading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>

      {warning && (
        <WarningModal isOpen title={warning.title}>
          <div className="flex flex-col gap-3">
            <p>{warning.message}</p>
            {isDeleteWarning && ride.current_riders.length > 0 && (
              <div className="flex flex-col gap-4 pb-5">
                <p>
                  Please give a reason for deleting this rideshare. The riders
                  you have currently accepted will be notified.
                </p>
                <CustomTextArea
                  placeholder={"List reason here."}
                  inputValue={deleteRideMessage}
                  setInputValue={setDeleteRideMessage}
                  maxLength={200}
                />
              </div>
            )}
            <div className="flex items-center self-end gap-2 max-md:self-stretch">
              {!isInfoWarning && (
                <Button
                  className="border-[1px] border-gray-300 text-zinc-500 hover:bg-zinc-100 max-md:flex-1"
                  onClick={() => {
                    setWarning(null);
                    setDeleteRideMessage("");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
              <Button
                className={`max-md:flex-1 ${
                  isInfoWarning
                    ? "bg-theme_medium_1 text-white hover:bg-theme_dark_1"
                    : "bg-red-400 text-white hover:bg-red-500"
                }`}
                onClick={warning.onConfirm || (() => setWarning(null))}
                loading={isSaving}
                disabled={
                  isDeleteWarning &&
                  ride.current_riders.length > 0 &&
                  !deleteRideMessage
                }
              >
                {warning.buttonText}
              </Button>
            </div>
          </div>
        </WarningModal>
      )}
    </div>
  );
}
