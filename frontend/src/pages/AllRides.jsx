// importing necessary libraries and components
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DateTimePicker from "../components/DateTimePicker.jsx";
import RideCard from "../components/RideCard.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import Dropdown from "../components/Dropdown.jsx";
import IconButton from "../components/IconButton.jsx";
import dayjs from "dayjs";
import PopUpMessage from "../components/PopUpMessage.jsx";
import LoadingIcon from "../components/LoadingIcon.jsx";
import Autocomplete from "react-google-autocomplete";
import { Input } from "antd";
import CustomTextArea from "../components/TextArea.jsx";
import WarningModal from "../components/WarningModal.jsx";
import useAutoRefresh from "../utils/useAutoRefresh.js";
import {
  getFormattedDate,
  MAX_CAPACITY,
  autocompleteStyling,
  capitalizeFirstLetter,
  handleShowPopupMessage,
  renderRideCardInfo,
  renderToAndFrom,
  placeToLocation,
  bigButtonStyling1,
  flipFields,
  NOTE_MAX_LENGTH,
  normalizePhoneNumber,
} from "../utils/utils";

// Displaying and managing all upcoming Rideshares in the database
export default function AllRides() {
  const google_api_key = import.meta.env.VITE_GOOGLE_API_KEY; // Google API key from environment variables
  const [pendingRideId, setPendingRideId] = useState([]); // tracking requests in progress
  const [dashboardData, setDashboardData] = useState({
    user_info: null,
    rides: [],
    ridereqs: {},
  });

  const [loading, setLoading] = useState(true);
  const [ridesData, setRidesData] = useState([]); // storing fetched Rides Data
  const [createRideModal, setCreateRideModal] = useState(false); // state for create new ride modal

  const [popupMessageInfo, setPopupMessageInfo] = useState({
    status: "",
    message: "",
  });

  // whether we are showing validation modal (e.g. warning for creating new ride without all necessary fields in it filled)
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationModalMessage, setValidationModalMessage] = useState(""); // message inside validation modal
  const [validationModalTitle, setValidationModalTitle] = useState(""); // title of validation modal

  // Refs for handling input elements
  const originRef = useRef(null); // stores origin
  const destinationRef = useRef(null); // stores destination
  const isInitialRender = useRef(true);

  // for ride creation from inputs
  const [origin, setOrigin] = useState(null);
  const [capacity, setCapacity] = useState("");
  const [dest, setDest] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rideNote, setRideNote] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCreatingRide, setIsCreatingRide] = useState(false);

  // for searching functionality
  const searchOriginRef = useRef(null);
  const searchDestinationRef = useRef(null);
  const [searchOrigin, setSearchOrigin] = useState(null);
  const [searchDest, setSearchDest] = useState(null);
  const [startSearchDate, setStartSearchDate] = useState();
  const [startSearchTime, setStartSearchTime] = useState();
  const [endSearchDate, setEndSearchDate] = useState();
  const [endSearchTime, setEndSearchTime] = useState();
  const [inSearch, setInSearch] = useState(false);
  // phones collapse the search filters behind a toggle (always shown on desktop)
  const [showFilters, setShowFilters] = useState(false);

  // for requesting to join a ride with an optional note
  const [requestModalRide, setRequestModalRide] = useState(null);
  const [requestNote, setRequestNote] = useState("");

  // pending requests to join the user's own rides, shown above the rides list
  const [pendingRequests, setPendingRequests] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null); // "rideid:netid" in progress

  // autocomplete options for location input
  const autocompleteOptions = {
    fields: ["formatted_address", "geometry", "name", "place_id"],
    types: ["establishment", "geocode"], // This will show both businesses and addresses
  };

  // make capacity dropdown options
  const capacity_options = Array.from({ length: MAX_CAPACITY }, (_, i) => ({
    value: i + 1,
    label: i + 1,
  }));

  // searching for ride functionality
  const searchRide = async () => {
    if (isInitialRender.current) {
      isInitialRender.current = false; // for initial render, do not search
      return;
    }

    // if no filters are set, fetch all rides
    if (!searchOrigin && !searchDest && !startSearchDate && !endSearchDate) {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // format start and end search times
      let start_search_time_string = null;
      let arrival_time_string = null;
      let start_search_time_iso = null;
      let arrival_time_iso = null;

      if (startSearchDate != null) {
        if (startSearchTime != null) {
          start_search_time_string = `${startSearchDate.format(
            "YYYY-MM-DD"
          )}T${startSearchTime.format("HH:mm:ss")}`;
        } else {
          const today = dayjs().format("YYYY-MM-DD");
          if (startSearchDate.format("YYYY-MM-DD") === today) {
            start_search_time_string = `${startSearchDate.format(
              "YYYY-MM-DD"
            )}T${dayjs().format("HH:mm:ss")}`; // defaults to current time to show only upcoming rides if date is today
          } else {
            start_search_time_string = `${startSearchDate.format(
              "YYYY-MM-DD"
            )}T00:00:00`; // defaults to midnight to show all times on this day
          }
        }

        start_search_time_iso = new Date(
          start_search_time_string
        ).toISOString();
      }

      if (endSearchDate != null) {
        if (endSearchTime != null) {
          arrival_time_string = `${endSearchDate.format(
            "YYYY-MM-DD"
          )}T${endSearchTime.format("HH:mm:ss")}`;
        } else {
          arrival_time_string = `${endSearchDate.format(
            "YYYY-MM-DD"
          )}T23:59:00`; // defaults to 11:59pm to include all rides on that day
        }

        arrival_time_iso = new Date(arrival_time_string).toISOString();
      }

      const params = new URLSearchParams({
        ...(searchOrigin && { origin: searchOrigin.place_id }),
        ...(searchDest && { destination: searchDest.place_id }),
        ...(start_search_time_string && {
          start_search_time: start_search_time_iso,
        }),
        ...(arrival_time_string && { arrival_time: arrival_time_iso }),
      });

      // make api call to searchrides
      const response = await fetch(`/api/searchrides?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch rides: ${response.status}`);
      }
      const data = await response.json();
      setRidesData(data.rides);
      setInSearch(true);
      setLoading(false);
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  // Checks if all necessary fields are inputted in Create Ride modal
  const checkCreateRideParams = () => {
    const now = new Date();

    const parsedDate = dayjs(date);
    const parsedTime = dayjs(time);

    let arrival_time_iso = null;

    if (date && time) {
      const arrival_time_string = `${date.format("YYYY-MM-DD")}T${time.format(
        "HH:mm:ss"
      )}`;
      arrival_time_iso = new Date(arrival_time_string);
    }

    if (arrival_time_iso && now.getTime() >= arrival_time_iso.getTime()) {
      setValidationModalTitle("Invalid Input");
      setValidationModalMessage("Cannot enter a date in the past.");
      setShowValidationModal(true); // Show the validation modal
      return;
    }

    // Check if any required fields are missing
    if (
      !capacity ||
      !origin ||
      !dest ||
      !date ||
      !time ||
      !phoneNumber.trim() ||
      capacity === "" ||
      origin === "" ||
      dest === "" ||
      date === "" ||
      !parsedDate.isValid() ||
      !parsedTime.isValid()
    ) {
      setValidationModalTitle("Missing fields");
      setValidationModalMessage(
        "You must provide all fields to create a ride."
      );
      setShowValidationModal(true); // Show the validation modal if something missing
      return;
    }

    if (!normalizePhoneNumber(phoneNumber)) {
      setValidationModalTitle("Invalid Input");
      setValidationModalMessage("Please enter a valid 10-digit phone number.");
      setShowValidationModal(true);
      return;
    }

    createRide();
  };

  // Creates ride by making API call to /addride
  const createRide = async () => {
    setIsCreatingRide(true); // indicate adding ride is in progress
    const arrival_time_string = `${date.format("YYYY-MM-DD")}T${time.format(
      "HH:mm:ss"
    )}`;
    const arrival_time_iso = new Date(arrival_time_string).toISOString();
    try {
      const response = await fetch("/api/addride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capacity: capacity["label"],
          origin: origin,
          destination: dest,
          arrival_time: arrival_time_iso,
          note: rideNote,
          phone_number: phoneNumber,
        }),
      });
      const responseData = await response.json();

      handleCloseRideModal(); // Close the modal after successfully created
      resetSearch(); // Reset search filters
      setInSearch(false);

      handleShowPopupMessage(
        setPopupMessageInfo,
        responseData.success,
        responseData.message
      );
      await fetchDashboardData(); // Refresh the dashboard, since new ride created
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setLoading(false);
    setIsCreatingRide(false); // reset
  };

  // Opens Create Ride modal
  const handleOpenRideModal = () => {
    setCreateRideModal(true);
  };

  // Closes Create Ride Modal, reset corresponding input fields
  const handleCloseRideModal = () => {
    setCreateRideModal(false);
    setCapacity("");
    setOrigin("");
    setDest("");
    setDate("");
    setTime("");
    setRideNote("");
    setPhoneNumber("");
    originRef.current = null;
    destinationRef.current = null;
  };

  // Fetch data for dashboard from server using API call to /dashboard
  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setDashboardData(data); // update DashboardData state
      setRidesData(data.rides); // update RidesData
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setLoading(false);
  };

  // Fetch pending requests to join the user's upcoming posted rides
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/myrides");
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setPendingRequests(
        data.upcoming_posted_rides.flatMap((ride) =>
          ride.requested_riders.map(([netid, fullName, mail, note]) => ({
            ride,
            netid,
            fullName,
            note,
          }))
        )
      );
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  // Quietly refresh request statuses and pending requests, e.g. after another
  // user accepts or removes this user. Leaves search results in place.
  const refreshInBackground = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        if (!inSearch) {
          setRidesData(data.rides);
        }
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    await fetchPendingRequests();
  };

  useAutoRefresh(refreshInBackground);

  // Accepts or rejects a pending request from the dashboard
  const handleRespondToRequest = async (pendingRequest, action) => {
    const key = `${pendingRequest.ride.id}:${pendingRequest.netid}`;
    setRespondingTo(key);
    try {
      const response = await fetch("/api/respondtorequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: pendingRequest.ride.id,
          requester_id: pendingRequest.netid,
          action: action,
        }),
      });
      const responseData = await response.json();
      handleShowPopupMessage(
        setPopupMessageInfo,
        responseData.success,
        responseData.message
      );
      await refreshInBackground();
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setRespondingTo(null);
  };

  // Opens the request popup, where the user can add a note to the poster
  const openRequestModal = (ride) => {
    setRequestNote("");
    setRequestModalRide(ride);
  };

  // Handles ride requests made by user
  const handleRideRequest = async (
    rideid,
    origin,
    destination,
    arrival_time,
    note = ""
  ) => {
    setPendingRideId((prev) => [...prev, rideid]); // track pending request by ID
    try {
      const formattedArrivalTime = dayjs(arrival_time)
        .tz("America/New_York") // ET timezone
        .format("MMMM D, YYYY, h:mm A");

      const response = await fetch("/api/requestride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideid,
          origin_name: origin["name"],
          destination_name: destination["name"],
          formatted_arrival_time: formattedArrivalTime,
          note: note,
        }),
      });
      const responseData = await response.json();
      handleShowPopupMessage(
        setPopupMessageInfo,
        responseData.success,
        responseData.message
      );
      await fetchDashboardData(); // refresh dashboardData after requesting ride
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    if (searchOrigin || searchDest || startSearchDate || endSearchDate) {
      searchRide();
    }
    setPendingRideId((prev) => prev.filter((id) => id !== rideid));
  };

  const resetSearch = async () => {
    if (searchOriginRef.current?.value) {
      searchOriginRef.current.value = "";
    }
    if (searchDestinationRef.current?.value) {
      searchDestinationRef.current.value = "";
    }
    setSearchOrigin("");
    setSearchDest("");
    setStartSearchDate(null);
    setStartSearchTime(null);
    setEndSearchDate(null);
    setEndSearchTime(null);
    setLoading(true);
    setInSearch(false);
    await fetchDashboardData();
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (
      searchOrigin ||
      searchDest ||
      startSearchDate ||
      endSearchDate ||
      (startSearchDate && startSearchTime) ||
      (endSearchDate && endSearchTime)
    ) {
      searchRide();
    } else {
      resetSearch();
    }
  }, [
    searchOrigin,
    searchDest,
    startSearchDate,
    endSearchDate,
    startSearchTime,
    endSearchTime,
  ]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default behavior of the Enter key
      console.log("Enter key is disabled!");
    }
  };

  const onPlaceSelected = (searchField, place) => {
    const inputElement = document.querySelector(
      `#${searchField}.pac-target-input`
    );
    const inputValue = inputElement ? inputElement.value.trim() : "";

    console.log("Input value: ", inputValue);
    console.log("Place object: ", place);

    // If the input is empty or the place.name is invalid, do nothing
    if (!inputValue || !place.name) {
      console.log("Ignoring invalid or empty selection");
      return;
    }

    // Otherwise, update the origin with the selected place
    console.log("Valid selection: ", place);
    if (searchField === "searchDest") {
      setSearchDest(place);
    } else {
      setSearchOrigin(place);
    }
  };

  const onChange = (e, setFunction) => {
    if (!e.target.value) {
      setFunction(null);
    }
  };

  const onDateTimePick = (value, setFunction) => {
    if (value === null) {
      setFunction(null);
    } else {
      setFunction(value);
    }
  };

  return (
    <div className="p-4 pb-14 md:p-8">
      {popupMessageInfo.message && (
        <PopUpMessage
          status={popupMessageInfo.status}
          message={popupMessageInfo.message}
        />
      )}
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center max-md:gap-3">
          <Link
            to="/myrides"
            className={`hidden md:inline-block ${bigButtonStyling1} max-md:!hidden`}
          >
            My Rideshares
          </Link>
          <Button
            className="md:hidden shrink-0 border border-zinc-300 bg-white text-zinc-700 rounded-md px-3 py-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters
              ? "Hide search"
              : inSearch
              ? "Search (on)"
              : "Search & filter"}
          </Button>
          <Button
            className={`${bigButtonStyling1} max-md:flex-1`}
            onClick={() => handleOpenRideModal()}
          >
            Create a Rideshare
          </Button>
        </div>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            inSearch
              ? "lg:grid-cols-[9fr,5fr,5fr,2.5fr]"
              : "lg:grid-cols-[9fr,5fr,5fr]"
          } items-center justify-between pb-4 sm:space-x-3 max-md:gap-y-3 ${
            showFilters ? "" : "max-md:hidden"
          }`}
        >
          <div className="grid grid-cols-[1fr,auto] gap-2 md:flex justify-center mb-3 md:mb-0">
            <div>
              <p className="font-medium mb-1">Origin</p>
              <Autocomplete
                key={"searchOrigin"}
                id={"searchOrigin"}
                className={autocompleteStyling}
                apiKey={google_api_key}
                placeholder="Enter origin"
                onPlaceSelected={(place) => {
                  onPlaceSelected("searchOrigin", place);
                }}
                // if user deletes input from field
                onChange={(e) => onChange(e, setSearchOrigin)}
                onKeyDown={handleKeyDown}
                options={autocompleteOptions}
                ref={searchOriginRef}
              />
            </div>
            <IconButton
              className="flex-none mt-[27px] w-9 h-9 hover:bg-theme_medium_2 max-md:mt-0 max-md:col-start-2 max-md:row-start-1 max-md:row-span-2 max-md:self-center"
              type="flip"
              ariaLabel="Swap origin and destination"
              onClick={() =>
                flipFields(
                  searchOrigin,
                  searchDest,
                  searchOriginRef,
                  searchDestinationRef,
                  setSearchOrigin,
                  setSearchDest
                )
              }
            ></IconButton>
            <div className="flex flex-col max-md:col-start-1">
              <p className="font-medium mb-1">Destination</p>
              <Autocomplete
                key={"searchDestination"}
                id={"searchDest"}
                className={autocompleteStyling}
                apiKey={google_api_key}
                placeholder="Enter destination"
                onPlaceSelected={(place) => {
                  onPlaceSelected("searchDest", place);
                }}
                onKeyDown={handleKeyDown}
                // if user deletes input from field
                onChange={(e) => onChange(e, setSearchDest)}
                options={autocompleteOptions}
                ref={searchDestinationRef}
              />
            </div>
          </div>
          <div className="flex justify-start md:justify-center mb-2 sm:mb-0">
            <div className="flex flex-col max-md:w-full">
              <p className="font-medium mb-1">Arrive After</p>
              <DateTimePicker
                date={startSearchDate}
                setDate={(value) => {
                  onDateTimePick(value, setStartSearchDate);
                }}
                time={startSearchTime}
                setTime={(value) => {
                  onDateTimePick(value, setStartSearchTime);
                }}
              />
            </div>
          </div>
          <div className="flex justify-start md:justify-center">
            <div className="flex flex-col max-md:w-full">
              <p className="font-medium mb-1">Arrive Before</p>
              <DateTimePicker
                date={endSearchDate}
                setDate={(value) => {
                  onDateTimePick(value, setEndSearchDate);
                }}
                time={endSearchTime}
                setTime={(value) => {
                  onDateTimePick(value, setEndSearchTime);
                }}
              />
            </div>
          </div>
          {inSearch && (
            <div>
              <Button
                onClick={resetSearch}
                className="text-theme_dark_1 px-4 py-2 hover:text-theme_medium_1 font-medium mt-6 max-md:mt-0 max-md:px-0"
              >
                Clear Search Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mt-2 mb-6">
          <h3 className="text-lg font-medium mb-3">
            Requests to join your rideshares ({pendingRequests.length})
          </h3>
          <div className="flex flex-col gap-3">
            {pendingRequests.map((pendingRequest) => {
              const key = `${pendingRequest.ride.id}:${pendingRequest.netid}`;
              const isFull =
                pendingRequest.ride.current_riders.length >=
                pendingRequest.ride.max_capacity;
              return (
                <div
                  key={key}
                  className="p-4 bg-white rounded-xl drop-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="break-words">
                      <span className="font-semibold">
                        {pendingRequest.fullName}
                      </span>{" "}
                      wants to join your rideshare from{" "}
                      <strong>{pendingRequest.ride.origin["name"]}</strong> to{" "}
                      <strong>{pendingRequest.ride.destination["name"]}</strong>{" "}
                      on {getFormattedDate(new Date(pendingRequest.ride.arrival_time))}
                    </p>
                    {pendingRequest.note && (
                      <p className="py-1.5 px-3 bg-zinc-100 rounded-lg break-words">
                        {pendingRequest.note}
                      </p>
                    )}
                    {isFull && (
                      <p className="text-sm text-zinc-500">
                        This rideshare is full. Remove a rider or increase the
                        capacity in My Rideshares to accept.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 max-md:w-full">
                    <Button
                      className="bg-theme_green text-theme_dark_green hover:bg-theme_light_green max-md:flex-1"
                      onClick={() =>
                        handleRespondToRequest(pendingRequest, "accept")
                      }
                      loading={respondingTo === key}
                      disabled={isFull}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-theme_red text-theme_dark_red hover:bg-theme_light_red max-md:flex-1"
                      onClick={() =>
                        handleRespondToRequest(pendingRequest, "reject")
                      }
                      loading={respondingTo === key}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingIcon carColor="bg-theme_medium_2" />
      ) : (
        <div>
          <h3 className="text-lg font-medium mt-2 mb-3">
            Upcoming & available rideshares ({ridesData.length})
          </h3>
          {ridesData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-md:gap-4">
              {ridesData.map((ride) => {
                const isOwnRide =
                  ride.admin_netid === dashboardData.user_info.netid;
                const requestStatus = dashboardData.ridereqs[ride.id];
                const wasRemoved = requestStatus === "removed";
                // removed riders can request again; other statuses are final
                const canRequest =
                  !isOwnRide &&
                  (!requestStatus || wasRemoved) &&
                  ride.current_riders.length < ride.max_capacity;
                return (
                  <RideCard
                    key={ride.id}
                    buttonText={
                      isOwnRide
                        ? ""
                        : requestStatus && !wasRemoved
                        ? "Status: " + capitalizeFirstLetter(requestStatus)
                        : wasRemoved
                        ? "Request Again"
                        : "Request to Join"
                    }
                    buttonOnClick={
                      canRequest ? () => openRequestModal(ride) : () => {}
                    }
                    buttonClassName={`${
                      canRequest
                        ? "bg-theme_medium_1 text-white hover:bg-theme_dark_1"
                        : "cursor-auto"
                    }`}
                    buttonStatus={wasRemoved ? "" : requestStatus}
                    buttonLoading={pendingRideId.includes(ride.id)}
                    secondaryButtonText={wasRemoved && "Status: Removed"}
                    secondaryButtonClassName="cursor-auto"
                    secondaryButtonStatus={wasRemoved ? "removed" : ""}
                  >
                    {renderRideCardInfo(ride, {
                      showRiders: true,
                      status: requestStatus,
                    })}
                  </RideCard>
                );
              })}
            </div>
          ) : (
            <p className="text-center">No rides available in this category.</p>
          )}
        </div>
      )}
      {requestModalRide && (
        <Modal
          isOpen={!!requestModalRide}
          onClose={() => setRequestModalRide(null)}
          title={"Request to Join"}
        >
          <div className="flex flex-col gap-4">
            <p>
              Request to join {requestModalRide.admin_name}'s rideshare from{" "}
              <strong>{requestModalRide.origin["name"]}</strong> to{" "}
              <strong>{requestModalRide.destination["name"]}</strong>.
            </p>
            <div>
              <p className="font-medium mb-1">Optional Note to Poster</p>
              <CustomTextArea
                placeholder={
                  "Add an optional note, such as how much luggage you have or if you're flexible with the time. (Max 300 characters)."
                }
                inputValue={requestNote}
                setInputValue={setRequestNote}
                maxLength={300}
              />
            </div>
            <Button
              className="self-start bg-theme_dark_1 py-1.5 px-3 text-white hover:bg-theme_medium_1 max-md:self-stretch"
              onClick={() => {
                const ride = requestModalRide;
                setRequestModalRide(null);
                handleRideRequest(
                  ride.id,
                  ride.origin,
                  ride.destination,
                  ride.arrival_time,
                  requestNote
                );
              }}
            >
              Send Request
            </Button>
          </div>
        </Modal>
      )}
      {createRideModal && (
        <Modal
          isOpen={createRideModal}
          onClose={handleCloseRideModal}
          title={"Create a Rideshare"}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-sm text-zinc-500 mb-1">
                  Number of people you'd like to rideshare with, not including
                  yourself
                </p>
                <Dropdown
                  inputValue={capacity}
                  setInputValue={setCapacity}
                  options={capacity_options}
                  isClearable
                  placeholder="Select capacity"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-medium mb-1">Origin & Destination</p>
                <div className="flex items-center space-x-2 w-full justify-between max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-2 max-md:space-x-0">
                  <Autocomplete
                    key={"createOrigin"}
                    className={autocompleteStyling}
                    apiKey={google_api_key}
                    placeholder="Enter origin"
                    onPlaceSelected={(place) => {
                      setOrigin(place); // Store selected place details in state
                    }}
                    onChange={(e) => onChange(e, setOrigin)}
                    options={autocompleteOptions}
                    ref={originRef}
                  />
                  <IconButton
                    className="flex-none w-9 h-9 hover:bg-theme_light_1 max-md:col-start-2 max-md:row-start-1 max-md:row-span-2 max-md:self-center"
                    type="flip"
                    ariaLabel="Swap origin and destination"
                    onClick={() =>
                      flipFields(
                        origin,
                        dest,
                        originRef,
                        destinationRef,
                        setOrigin,
                        setDest
                      )
                    }
                  ></IconButton>
                  <Autocomplete
                    key={"createDestination"}
                    className={`${autocompleteStyling} max-md:col-start-1`}
                    apiKey={google_api_key}
                    placeholder="Enter destination"
                    onPlaceSelected={(place) => {
                      setDest(place); // Store selected place details in state
                    }}
                    onChange={(e) => onChange(e, setDest)}
                    options={autocompleteOptions}
                    ref={destinationRef}
                  />
                </div>
                {/* preview so riders can confirm e.g. PHL vs EWR before posting */}
                {origin?.formatted_address && dest?.formatted_address && (
                  <div className="mt-3 py-2 rounded-lg bg-zinc-100">
                    {renderToAndFrom({
                      origin: placeToLocation(origin),
                      destination: placeToLocation(dest),
                    })}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium mb-1">Arrival Time (in ET)</p>
                <DateTimePicker
                  date={date}
                  setDate={setDate}
                  time={time}
                  setTime={setTime}
                />
              </div>
              <div>
                <p className="font-medium">Phone Number</p>
                <p className="text-sm text-zinc-500 mb-1">
                  Only shown to riders you accept
                </p>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="max-md:!h-11"
                  placeholder="(609) 555-1234"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div>
                <p className="font-medium mb-1">Optional Note to Riders</p>
                <CustomTextArea
                  placeholder={`Add an optional note here, such as a suggested time to meet up, if you're flexible with the arrival time, or anything else. (Max ${NOTE_MAX_LENGTH} characters).`}
                  inputValue={rideNote}
                  setInputValue={setRideNote}
                  maxLength={NOTE_MAX_LENGTH}
                />
              </div>
            </div>
            <Button
              className="self-end bg-theme_dark_1 py-1.5 px-3 text-white hover:bg-theme_medium_1 max-md:self-stretch"
              onClick={checkCreateRideParams}
              loading={isCreatingRide}
            >
              Submit
            </Button>
          </div>
        </Modal>
      )}
      {showValidationModal && (
        <WarningModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title={validationModalTitle}
        >
          <div className="flex flex-col gap-3">
            <p>{validationModalMessage}</p>
            <div className="flex self-end max-md:self-stretch">
              <Button
                onClick={() => setShowValidationModal(false)}
                className="bg-theme_medium_1 text-white hover:bg-theme_dark_1 max-md:flex-1"
              >
                Okay
              </Button>
            </div>
          </div>
        </WarningModal>
      )}
    </div>
  );
}
