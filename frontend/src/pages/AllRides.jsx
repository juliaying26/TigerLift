import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Input from "../components/Input.jsx";
import DateTimePicker from "../components/DateTimePicker.jsx";
import RideCard from "../components/RideCard.jsx";
import Pill from "../components/Pill.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import Dropdown from "../components/Dropdown.jsx";
import IconButton from "../components/IconButton.jsx";
import dayjs from "dayjs";
import PopUpMessage from "../components/PopUpMessage.jsx";
import LoadingIcon from "../components/LoadingIcon.jsx";
import Autocomplete from "react-google-autocomplete";
import CopyEmailButton from "../components/CopyEmailButton.jsx";
import TextArea from "../components/TextArea.jsx";

export default function AllRides() {
  const google_api_key = import.meta.env.VITE_GOOGLE_API_KEY;

  const [pendingRideId, setPendingRideId] = useState(null);

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

  const [capacity, setCapacity] = useState("");
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const [origin, setOrigin] = useState(null);
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

  const autocompleteOptions = {
    componentRestrictions: { country: "us" },
    fields: ["formatted_address", "geometry", "name", "place_id"],
    types: ["establishment", "geocode"], // This will show both businesses and addresses
  };

  const [inSearch, setInSearch] = useState(false);

  const [locations, setLocations] = useState([]); // delete this later

  const max_capacity_option = 5;
  const capacity_options = [];

  const capitalizeFirstLetter = (val) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  };

  for (let i = 1; i < max_capacity_option + 1; i++) {
    let dict = { value: i, label: i };
    capacity_options.push(dict);
  }

  const handleShowPopupMessage = (status, message) => {
    setPopupMessageInfo({ status: status, message: message });
    setTimeout(() => setPopupMessageInfo({ status: "", message: "" }), 1500);
  };

  const flipCreateRideFields = () => {
    const tempOrigin = origin;

    setOrigin(dest);
    setDest(tempOrigin);

    if (originRef.current && destinationRef.current) {
      const tempOriginValue = originRef.current.value;
      originRef.current.value = destinationRef.current.value;
      destinationRef.current.value = tempOriginValue;
    }

    console.log("Locations flipped!");
  };

  const flipSearchFields = () => {
    const tempSearchOrigin = searchOrigin;

    setSearchOrigin(searchDest);
    setSearchDest(tempSearchOrigin);

    console.log(
      "searchOriginRef.current when switchign fields:",
      searchOriginRef.current.placeholder
    );

    if (searchOriginRef.current && searchDestinationRef.current) {
      const tempSearchOriginValue = searchOriginRef.current.value;
      searchOriginRef.current.value = searchDestinationRef.current.value;
      searchDestinationRef.current.value = tempSearchOriginValue;
    }
  };

  const searchRide = async () => {
    //console.log(dashboardData);

    console.log("in search ride. search origin: ", searchOrigin);

    if (!searchOrigin && !searchDest) {
      alert("You must provide at least one of 'origin' or 'destination'.");
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
        }
        else if (startSearchTime == null) {
          start_search_time_string = `${startSearchDate.format(
            "YYYY-MM-DD"
            )}T00:00:00`; // defaults to midnight to show all times on this day
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
        }
        else if (endSearchTime == null) {
          arrival_time_string = `${endSearchDate.format(
            "YYYY-MM-DD"
          )}T23:59:00`; // defaults to 11:59pm to include all rides on that day
        }

        arrival_time_iso = new Date(arrival_time_string).toISOString();
      }

      console.log("arrive after iso: " + start_search_time_iso);
      console.log("arrive before iso: " + arrival_time_iso);

      //console.log("start date: " + startSearchDate.format("YYYY-MM-DD"))
      //console.log("end date: " + endSearchDate.format("YYYY-MM-DD"))

      //console.log("origin place id:", searchOrigin.place_id)

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
      console.log("DATA =", data);
      setRidesData(data.rides);
      setInSearch(true);
      setLoading(false);
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const checkCreateRideParams = async () => {
    console.log(origin);
    console.log(dest);

    if (
      capacity === "" ||
      origin === "" ||
      dest === "" ||
      date === "" ||
      time === "" ||
      !date ||
      !time
    ) {
      alert("You must provide all fields.");
      return;
    } else {
      createRide();
    }
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
          origin: origin, // .name,
          destination: dest, // .name,
          arrival_time: arrival_time_iso,
          note: rideNote,
        }),
      });
      const responseData = await response.json();
      handleCloseRideModal();
      console.log(responseData.success);
      console.log(responseData.message);
      handleShowPopupMessage(responseData.success, responseData.message);
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

  const handleOpenRideModal = async () => {
    setCreateRideModal(true);
  };

  const handleCloseRideModal = async () => {
    setCreateRideModal(false);
    setCapacity("");
    setOrigin("");
    setDest("");
    setDate("");
    setTime("");
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
    setPendingRideId(rideid);
    try {
      console.log("ARRIVAL TIME DASHBOARD ", arrival_time);

      const formattedArrivalTime = dayjs(arrival_time).format(
        "MMMM D, YYYY, h:mm A"
      );

      const formatted = new Date(arrival_time).toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      console.log(formatted);

      const response = await fetch("/api/requestride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideid,
          origin_name: origin["name"],
          destination_name: destination["name"],
          arrival_time: formattedArrivalTime,
        }),
      });
      await fetchDashboardData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setPendingRideId(null);
  };

  const resetSearch = async () => {
    if (searchOriginRef.current.value) {
      searchOriginRef.current.value = "";
    }
    if (searchDestinationRef.current.value) {
      searchDestinationRef.current.value = "";
    }
    setLoading(true);
    setInSearch(false);
    await fetchDashboardData();
    setLoading(false);
    setSearchOrigin("");
    setSearchDest("");
    setStartSearchDate(null);
    setStartSearchTime(null);
    setEndSearchDate(null);
    setEndSearchTime(null);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {

    if (searchOrigin) {
      console.log("searchOrigin updated:", searchOrigin);
      searchRide();
    }

    if (searchDest) {
      console.log("searchDest updated:", searchDest);
      searchRide();
    }

    if (startSearchDate) {
      searchRide();
    }

    if (endSearchDate) {
      searchRide();
    }

  }, [searchOrigin, searchDest, startSearchDate, endSearchDate]);

  return (
    <div className="p-8">
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
            className="hidden md:inline-block bg-theme_medium_2 text-white px-4 py-2 rounded-md hover:bg-theme_dark_2 hover:text-white"
          >
            My Rideshares
          </Link>

          <Button
            className="bg-theme_medium_2 text-white px-4 py-2 hover:bg-theme_dark_2 rounded-md"
            onClick={() => handleOpenRideModal()}
          >
            Create a Rideshare
          </Button>
        </div>

        <div className="flex items-center justify-between space-x-3">
          {/*
         <Dropdown
            inputValue={searchOrigin}
            setInputValue={setSearchOrigin}
            options={locations}
            isClearable
            placeholder="Select starting point"
          />
          */}

          <div className="flex items-center gap-2">
            <Autocomplete
              key={"searchOrigin"}
              className="px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal"
              apiKey={google_api_key}
              placeholder="Enter origin"
              onPlaceSelected={(place) => {
                console.log("Selected Place Details:", place);
                console.log("Formatted Address:", place.formatted_address);
                console.log(
                  "Coordinates:",
                  place.geometry.location.lat(),
                  place.geometry.location.lng()
                );
                setSearchOrigin(place);
                console.log("place:", place);
              }}
              options={autocompleteOptions}
              ref={searchOriginRef}
            />

            <IconButton
              className="flex-none"
              type="flip"
              onClick={flipSearchFields}
              disabled={false}
            ></IconButton>

            {/* <IconButton type="flip" onClick={flipSearchFields} disabled={false} /> */}

            {/*
          <Dropdown
            inputValue={searchDest}
            setInputValue={setSearchDest}
            options={locations}
            isClearable
            placeholder="Select destination"
          />
          */}

            <Autocomplete
              key={"searchDestination"}
              className="px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal"
              apiKey={google_api_key}
              placeholder="Enter destination"
              onPlaceSelected={(place) => {
                console.log("Selected Place Details:", place);
                console.log("Formatted Address:", place.formatted_address);
                console.log(
                  "Coordinates:",
                  place.geometry.location.lat(),
                  place.geometry.location.lng()
                );
                setSearchDest(place);
              }}
              options={autocompleteOptions}
              ref={searchDestinationRef}
            />
          </div>

          <div
            className="flex flex-col items-center"
            style={{ transform: "translateY(-12px)" }}
          >
            <label>Arrive After:</label>
            <DateTimePicker
              date={startSearchDate}
              setDate={setStartSearchDate}
              time={startSearchTime}
              setTime={setStartSearchTime}
            />
          </div>

          <div
            className="flex flex-col items-center"
            style={{ transform: "translateY(-12px)" }}
          >
            <label>Arrive Before:</label>
            <DateTimePicker
              date={endSearchDate}
              setDate={setEndSearchDate}
              time={endSearchTime}
              setTime={setEndSearchTime}
            />
          </div>
          {/*
          <Button
            className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
            onClick={searchRide}
          >
            Search
          </Button>
          */}
        </div>
      </div>

      {loading ? (
        <LoadingIcon carColor="bg-theme_medium_2" />
      ) : (
        <div>
          {inSearch && (
            <div>
              <Button
                onClick={resetSearch}
                className="bg-theme_dark_1 text-white px-4 py-2 hover:text-theme_medium_1 font-semibold"
              >
                Clear Search Filters
              </Button>
              <br />
              <br />
            </div>
          )}
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
                      : ride.current_riders.length === ride.max_capacity
                      ? "Ride filled"
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
                      : "bg-theme_dark_1 text-white hover:bg-theme_medium_1"
                  }`}
                  buttonStatus={dashboardData.ridereqs[ride.id]}
                  buttonDisabled={pendingRideId === ride.id}
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-xl flex items-center justify-center gap-2">
                      <span className="flex text-center flex-col">
                        <strong>{ride.origin["name"]}</strong>
                        <span className="text-sm">
                          {ride.origin["address"]
                            .split(" ")
                            .slice(0, -2)
                            .join(" ")}
                        </span>
                      </span>
                      →
                      <span className="flex text-center flex-col">
                        <strong>{ride.destination["name"]}</strong>
                        <span className="text-sm">
                          {ride.destination["address"]
                            .split(" ")
                            .slice(0, -2)
                            .join(" ")}
                        </span>
                      </span>
                    </p>
                    <p className="mt-2 mb-1 text-center">
                      <span className="px-3 py-1 bg-zinc-200 rounded-full">
                        Arrive by{" "}
                        {new Date(ride.arrival_time).toLocaleString("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
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
                  {ride.note && (
                    <div className="mb-0.5">
                      <span className="font-semibold">Note:</span>
                      <div className="p-2 bg-zinc-100 rounded-lg">
                        <p>{ride.note}</p>
                      </div>
                    </div>
                  )}
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
                <p className="font-medium">Capacity </p>
                <Dropdown
                  inputValue={capacity}
                  setInputValue={setCapacity}
                  options={capacity_options}
                  isClearable
                  placeholder="Select capacity"
                ></Dropdown>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-medium">Origin & Destination</p>
                <div className="flex items-center space-x-2 w-full">
                  <Autocomplete
                    key={"createOrigin"}
                    className="px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal"
                    apiKey={google_api_key}
                    placeholder="Enter origin"
                    onPlaceSelected={(place) => {
                      console.log("Selected Place Details:", place);
                      console.log(
                        "Formatted Address:",
                        place.formatted_address
                      );
                      console.log(
                        "Coordinates:",
                        place.geometry.location.lat(),
                        place.geometry.location.lng()
                      );
                      console.log(place.name);
                      // const placeName = place.name || place.formatted_address;
                      // if (originRef.current) {
                      //   originRef.current.value = placeName;
                      // }
                      setOrigin(place); // Store selected place details in state
                    }}
                    options={autocompleteOptions}
                    ref={originRef}
                  />
                  <IconButton
                    className="flex-none"
                    type="flip"
                    onClick={flipCreateRideFields}
                    disabled={false}
                  ></IconButton>
                  <Autocomplete
                    key={"createDestination"}
                    className="px-3 py-2 outline outline-1 outline-zinc-200 rounded focus:outline-theme_medium_1 text-sm font-normal"
                    apiKey={google_api_key}
                    placeholder="Enter destination"
                    onPlaceSelected={(place) => {
                      console.log("Selected Place Details:", place);
                      console.log(
                        "Formatted Address:",
                        place.formatted_address
                      );
                      console.log(
                        "Coordinates:",
                        place.geometry.location.lat(),
                        place.geometry.location.lng()
                      );
                      setDest(place); // Store selected place details in state
                    }}
                    options={autocompleteOptions}
                    ref={destinationRef}
                  />
                </div>
              </div>
              <div>
                <p className="font-medium">Arrival Time</p>
                <DateTimePicker
                  date={date}
                  setDate={setDate}
                  time={time}
                  setTime={setTime}
                />
              </div>
            </div>
            <div>
              <p className="font-medium">Optional Note to Riders</p>
              <TextArea
                placeholder={"Add an optional note here. (Max 250 characters)."}
                inputValue={rideNote}
                setInputValue={setRideNote}
                maxLength={250}
              />
            </div>
            <Button
              className="self-start bg-theme_dark_1 py-1.5 px-3 text-white hover:bg-theme_medium_1"
              onClick={checkCreateRideParams}
              disabled={isCreatingRide}
            >
              Submit
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
