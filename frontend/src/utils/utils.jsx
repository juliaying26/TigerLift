import CopyEmailButton from "../components/CopyEmailButton";
import RideNote from "../components/RideNote";

export const MAX_CAPACITY = 5;
export const NOTE_MAX_LENGTH = 300;

// Strips formatting from a US phone number; returns the 10 digits, or null if
// invalid. Mirrors normalize_phone_number in backend/app.py.
export const normalizePhoneNumber = (phoneNumber) => {
  let digits = phoneNumber.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
  if (digits.length !== 10 || "01".includes(digits[0]) || "01".includes(digits[3]))
    return null;
  return digits;
};

// Formats 10 stored digits as (609) 555-1234
export const formatPhoneNumber = (digits) =>
  `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;

// used in arrival time in ride cards
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
  "w-full md:max-w-full min-w-[100px] px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal hover:outline-theme_medium_1 max-md:min-h-11 max-md:text-base";

// 44px minimum tap targets on phones (below md); desktop is unchanged
export const tapTarget = "max-md:min-h-11 max-md:min-w-11";
export const tapTargetInline =
  "max-md:inline-flex max-md:items-center max-md:min-h-11";

// colors for request status pills, shared with Button
export const statusPillStyling = {
  pending: "bg-theme_light_2 text-theme_dark_2",
  rejected: "bg-red-100 text-red-500",
  removed: "bg-zinc-200 text-zinc-600",
  accepted: "bg-theme_light_green text-theme_dark_green",
};

export const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export const bigButtonStyling1 =
  "bg-theme_medium_1 text-white px-4 py-2 rounded-md hover:bg-theme_dark_1 hover:text-white text-center max-md:min-h-11 max-md:inline-flex max-md:items-center max-md:justify-center";

export const bigButtonStyling2 =
  "bg-theme_medium_2 text-white px-4 py-2 rounded-md hover:bg-theme_dark_2 hover:text-white text-center max-md:min-h-11 max-md:inline-flex max-md:items-center max-md:justify-center";

export const handleShowPopupMessage = (
  setPopupMessageInfo,
  status,
  message
) => {
  setPopupMessageInfo({ status: status, message: message });
  setTimeout(() => setPopupMessageInfo({ status: "", message: "" }), 1500);
};

// airports riders commonly travel to, matched against a location's name and
// address. Each gets its own color so e.g. PHL and EWR are hard to confuse.
// Zip codes are only used where they cover the airport alone.
const AIRPORTS = [
  {
    code: "PHL",
    city: "Philadelphia",
    match: /philadelphia international airport|\bPHL\b/i,
    className: "bg-emerald-100 text-emerald-900 border-emerald-400",
  },
  {
    code: "EWR",
    city: "Newark",
    match: /newark liberty international airport|\bEWR\b|NJ 07114/i,
    className: "bg-amber-100 text-amber-900 border-amber-400",
  },
  {
    code: "JFK",
    city: "New York JFK",
    match: /kennedy international airport|NY 11430/i,
    className: "bg-indigo-100 text-indigo-900 border-indigo-400",
  },
  {
    code: "LGA",
    city: "New York LaGuardia",
    match: /laguardia airport|NY 11371/i,
    className: "bg-cyan-100 text-cyan-900 border-cyan-400",
  },
  {
    code: "TTN",
    city: "Trenton",
    match: /trenton[- ]mercer airport/i,
    className: "bg-lime-100 text-lime-900 border-lime-500",
  },
];

// returns the airport a location ({ name, address }) is at, or null
export const getAirport = (location) => {
  if (!location) return null;
  const text = `${location.name || ""} ${location.address || ""}`;
  return AIRPORTS.find((airport) => airport.match.test(text)) || null;
};

// a colored "✈ Philadelphia (PHL)" label for airport locations
export const renderAirportBadge = (location) => {
  const airport = getAirport(location);
  return (
    airport && (
      <span
        className={`inline-flex items-center gap-1 self-center px-2 py-0.5 my-1 rounded-full border text-sm font-semibold whitespace-nowrap ${airport.className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
        {airport.city} ({airport.code})
      </span>
    )
  );
};

// the origin and destination formatting in ride cards
// side by side on desktop; stacked (origin, down arrow, destination) on phones
export const renderToAndFrom = (ride) => {
  return (
    <p className="text-xl flex items-center justify-center gap-2 max-md:flex-col max-md:gap-1 max-md:text-lg">
      <span className="flex text-center flex-col max-md:w-full max-md:min-w-0 break-words">
        <strong>{ride.origin["name"]}</strong>
        {renderAirportBadge(ride.origin)}
        <span className="text-sm">
          {ride.origin["address"].split(" ").slice(0, -2).join(" ")}
        </span>
      </span>
      <span className="max-md:hidden">→</span>
      <span className="md:hidden text-zinc-500" aria-hidden="true">
        ↓
      </span>
      <span className="flex text-center flex-col max-md:w-full max-md:min-w-0 break-words">
        <strong>{ride.destination["name"]}</strong>
        {renderAirportBadge(ride.destination)}
        <span className="text-sm">
          {ride.destination["address"].split(" ").slice(0, -2).join(" ")}
        </span>
      </span>
    </p>
  );
};

// converts a Google Places result into the { address, name, id } shape rides store
export const placeToLocation = (place) => ({
  address: place.formatted_address,
  name: place.name,
  id: place.place_id,
});

export const renderRideNote = (ride) => {
  return ride.note && <RideNote note={ride.note} />;
};

// used in AllRides and MyRides to render ride card info
// status (optional) adds a request status chip next to the time on phones
export const renderRideCardInfo = (
  ride,
  { showRiders = false, status = "" } = {}
) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        {renderToAndFrom(ride)}
        {/* on phones, seats and status sit next to the time at the top of the card */}
        <p className="mt-2 mb-1 text-center max-md:flex max-md:flex-wrap max-md:justify-center max-md:gap-2">
          <span className="px-3 py-1 bg-zinc-200 rounded-full whitespace-nowrap">
            Arrives by {getFormattedDate(new Date(ride.arrival_time))}
          </span>
          <span className="md:hidden px-3 py-1 bg-zinc-200 rounded-full whitespace-nowrap">
            {ride.current_riders.length}/{ride.max_capacity} seats
          </span>
          {status && (
            <span
              className={`md:hidden px-3 py-1 rounded-full whitespace-nowrap font-medium ${
                statusPillStyling[status] || "bg-zinc-200"
              }`}
            >
              {capitalizeFirstLetter(status)}
            </span>
          )}
        </p>
      </div>
      <hr className="border-1 my-3 border-theme_medium_1" />
      <p>
        <span className="font-semibold">Posted by:</span>{" "}
        <span>{ride.admin_name}</span>{" "}
        <CopyEmailButton
          copy={[ride.admin_email]}
          text="Copy Email"
          className={`inline-flex text-theme_medium_2 hover:text-theme_dark_2 ml-1 mb-0.5 align-middle ${tapTargetInline} max-md:-my-2`}
        />
      </p>
      <p className="max-md:hidden">
        <span className="font-semibold">Seats Taken:</span>{" "}
        {ride.current_riders.length}/{ride.max_capacity}
      </p>
      {showRiders && (
        <p>
          <span className="font-semibold">Riders:</span>{" "}
          {ride.current_riders.length > 0 ? (
            ride.current_riders.map((rider) => rider[1]).join(", ")
          ) : (
            <span className="text-zinc-500">No riders yet</span>
          )}
        </p>
      )}
      {ride.phone_number && (
        <p>
          <span className="font-semibold">Phone:</span>{" "}
          <a
            href={`tel:+1${ride.phone_number}`}
            className={`text-theme_medium_2 hover:text-theme_dark_2 ${tapTargetInline}`}
          >
            {formatPhoneNumber(ride.phone_number)}
          </a>
        </p>
      )}
      {renderRideNote(ride)}
    </>
  );
};

// used in AllRides for flipping origin/dest fields
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

// builds a Google Calendar prefilled event link for a ride (no API needed)
// event ends at the ride's arrival time and starts one hour before
export const getGoogleCalendarUrl = (ride) => {
  const toGoogleDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(ride.arrival_time);
  const start = new Date(end.getTime() - 60 * 60 * 1000);
  const riderNames = [
    ride.admin_name,
    ...(ride.current_riders || []).map((rider) => rider[1]),
  ];
  const details = `Riders: ${riderNames.join(", ")}\n\nRide page: ${
    window.location.origin
  }/myrides`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Rideshare to ${ride.destination["name"]}`,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    location: `${ride.origin["name"]}, ${ride.origin["address"]}`,
    details: details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
