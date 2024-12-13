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
import CustomTextArea from "../components/TextArea.jsx";
import WarningModal from "../components/WarningModal.jsx";
import {
  getFormattedDate,
  MAX_CAPACITY,
  autocompleteStyling,
  capitalizeFirstLetter,
  handleShowPopupMessage,
  renderRideCardInfo,
  bigButtonStyling1,
  flipFields,
} from "../utils/utils";

export default function AllRides() {
  const google_api_key = import.meta.env.VITE_GOOGLE_API_KEY;

  const [pendingRideId, setPendingRideId] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    user_info: null,
    rides: [],
    ridereqs: {},
  });

  const [loading, setLoading] = useState(true);
  const [ridesData, setRidesData] = useState([]);
  const [createRideModal, setCreateRideModal] = useState(false);

  const [popupMessageInfo, setPopupMessageInfo] = useState({
    status: "",
    message: "",
  });

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationModalMessage, setValidationModalMessage] = useState("");
  const [validationModalTitle, setValidationModalTitle] = useState("");

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const isInitialRender = useRef(true);

  const [origin, setOrigin] = useState(null);
  const [capacity, setCapacity] = useState("");
  const [dest, setDest] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rideNote, setRideNote] = useState("");
  const [isCreatingRide, setIsCreatingRide] = useState(false);

  const searchOriginRef = useRef(null);
  const searchDestinationRef = useRef(null);
  const [searchOrigin, setSearchOrigin] = useState(null);
  const [searchDest, setSearchDest] = useState(null);
  const [startSearchDate, setStartSearchDate] = useState();
  const [startSearchTime, setStartSearchTime] = useState();
  const [endSearchDate, setEndSearchDate] = useState();
  const [endSearchTime, setEndSearchTime] = useState();
  const [inSearch, setInSearch] = useState(false);

  const autocompleteOptions = {
    fields: ["formatted_address", "geometry", "name", "place_id"],
    types: ["establishment", "geocode"], // This will show both businesses and addresses
  };

  const capacity_options = [];
  for (let i = 1; i < MAX_CAPACITY + 1; i++) {
    let dict = { value: i, label: i };
    capacity_options.push(dict);
  }

  const searchRide = async () => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    console.log("in search ride. search origin: ", searchOrigin);

    if (!searchOrigin && !searchDest && !startSearchDate && !endSearchDate) {
      setLoading(true);
      console.log("dash data fetch 1");
      await fetchDashboardData();
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log("test, am in dashboard searchride");

      console.log("startSearchDate: " + startSearchDate);
      console.log("endSearchDate: " + endSearchDate);

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
          console.log("today:", today);
          console.log("startsearchdate:", startSearchDate.format("YYYY-MM-DD"));
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

      console.log("arrive after iso: " + start_search_time_iso);
      console.log("arrive before iso: " + arrival_time_iso);

      const params = new URLSearchParams({
        ...(searchOrigin && { origin: searchOrigin.place_id }),
        ...(searchDest && { destination: searchDest.place_id }),
        ...(start_search_time_string && {
          start_search_time: start_search_time_iso,
        }),
        ...(arrival_time_string && { arrival_time: arrival_time_iso }),
      });

      console.log("params: " + params.toString());

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

  const checkCreateRideParams = () => {
    const now = new Date();

    const parsedDate = dayjs(date);
    const parsedTime = dayjs(time);

    console.log(date);
    console.log(time);

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

    if (
      !capacity ||
      !origin ||
      !dest ||
      !date ||
      !time ||
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
      setShowValidationModal(true); // Show the validation modal
      return;
    }

    createRide();
  };

  const createRide = async () => {
    setIsCreatingRide(true);
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
        }),
      });
      const responseData = await response.json();

      handleCloseRideModal();
      resetSearch();
      setInSearch(false);

      handleShowPopupMessage(
        setPopupMessageInfo,
        responseData.success,
        responseData.message
      );
      console.log("dash data fetch 2");
      await fetchDashboardData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setLoading(false);
    setIsCreatingRide(false);
  };

  const handleOpenRideModal = () => {
    setCreateRideModal(true);
  };

  const handleCloseRideModal = () => {
    setCreateRideModal(false);
    setCapacity("");
    setOrigin("");
    setDest("");
    setDate("");
    setTime("");
    setRideNote("");
    originRef.current = null;
    destinationRef.current = null;
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setDashboardData(data);
      console.log(data.rides);
      setRidesData(data.rides);
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setLoading(false);
  };

  const handleRideRequest = async (
    rideid,
    origin,
    destination,
    arrival_time
  ) => {
    console.log("IN HANDLE RIDE REQUEST");
    setPendingRideId((prev) => [...prev, rideid]);
    try {
      console.log("ARRIVAL TIME DASHBOARD ", arrival_time);

      const formattedArrivalTime = dayjs(arrival_time)
        .tz("America/New_York")
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
        }),
      });
      console.log("dash data fetch 3");
      await fetchDashboardData();
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
    if (searchOriginRef.current.value) {
      searchOriginRef.current.value = "";
    }
    if (searchDestinationRef.current.value) {
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
    console.log("dash data fetch 4");
    await fetchDashboardData();
    setLoading(false);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    console.log("dash data fetch 5");
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
      console.log("is this what happening?");
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
    <div className="p-8 pb-14">
      {popupMessageInfo.message && (
        <PopUpMessage
          status={popupMessageInfo.status}
          message={popupMessageInfo.message}
        />
      )}
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <Link
            to="/myrides"
            className={`hidden md:inline-block ${bigButtonStyling1}`}
          >
            My Rideshares
          </Link>
          <Button
            className={`${bigButtonStyling1}`}
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
          } items-center justify-between pb-4 sm:space-x-3`}
        >
          <div className="grid grid-cols-[5fr,1fr] gap-2 md:flex justify-center mb-3 md:mb-0">
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
              className="flex-none mt-[27px] w-9 h-9 hover:bg-theme_medium_2"
              type="flip"
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
            <div className="flex flex-col">
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
            <div className="flex flex-col">
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
            <div className="flex flex-col">
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
                className="text-theme_dark_1 px-4 py-2 hover:text-theme_medium_1 font-medium mt-6"
              >
                Clear Search Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingIcon carColor="bg-theme_medium_2" />
      ) : (
        <div>
          <h3 className="text-lg font-medium mt-2 mb-3">
            Upcoming & available rideshares ({ridesData.length})
          </h3>
          {ridesData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {ridesData.map((ride) => (
                <RideCard
                  key={ride.id}
                  buttonText={
                    ride.admin_netid === dashboardData.user_info.netid
                      ? ""
                      : dashboardData.ridereqs[ride.id] !== undefined &&
                        dashboardData.ridereqs[ride.id] !== null
                      ? "Status: " +
                        capitalizeFirstLetter(dashboardData.ridereqs[ride.id])
                      : "Request to Join"
                  }
                  buttonOnClick={
                    dashboardData.ridereqs[ride.id] ||
                    ride.admin_netid === dashboardData.user_info.netid ||
                    ride.current_riders.length === ride.max_capacity
                      ? () => {}
                      : () =>
                          handleRideRequest(
                            ride.id,
                            ride.origin,
                            ride.destination,
                            ride.arrival_time
                          )
                  }
                  buttonClassName={`${
                    ride.admin_netid === dashboardData.user_info.netid
                      ? "cursor-auto"
                      : dashboardData.ridereqs[ride.id]
                      ? "cursor-auto"
                      : "bg-theme_medium_1 text-white hover:bg-theme_dark_1"
                  }`}
                  buttonStatus={dashboardData.ridereqs[ride.id]}
                  buttonLoading={pendingRideId.includes(ride.id)}
                >
                  {renderRideCardInfo(ride)}
                </RideCard>
              ))}
            </div>
          ) : (
            <p className="text-center">No rides available in this category.</p>
          )}
        </div>
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
                <div className="flex items-center space-x-2 w-full justify-between">
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
                    className="flex-none w-9 h-9 hover:bg-theme_light_1"
                    type="flip"
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
                    className={autocompleteStyling}
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
                <p className="font-medium mb-1">Optional Note to Riders</p>
                <CustomTextArea
                  placeholder={
                    "Add an optional note here, such as a suggested time to meet up, if you're flexible with the arrival time, or anything else. (Max 200 characters)."
                  }
                  inputValue={rideNote}
                  setInputValue={setRideNote}
                  maxLength={200}
                />
              </div>
            </div>
            <Button
              className="self-start bg-theme_dark_1 py-1.5 px-3 text-white hover:bg-theme_medium_1"
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
            <div className="flex self-end">
              <Button
                onClick={() => setShowValidationModal(false)}
                className="bg-theme_medium_1 text-white hover:bg-theme_dark_1"
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
