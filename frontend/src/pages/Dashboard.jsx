import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import DateTimePicker from "../components/DateTimePicker";
import RideCard from "../components/RideCard.jsx";
import Pill from "../components/Pill.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import Dropdown from "../components/Dropdown.jsx";
import IconButton from "../components/IconButton.jsx";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    user_info: null,
    rides: [],
    locations: [],
    ridereqs: {},
  });

  const [loading, setLoading] = useState(true);
  const [ridesData, setRidesData] = useState([]);
  const [createRideModal, setCreateRideModal] = useState(false);
  const [searchRideModal, setSearchRideModal] = useState(false);

  const [createRideNotif, setCreateRideNotif] = useState([false, ""]);
  const [capacity, setCapacity] = useState("");
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [startSearchDate, setStartSearchDate] = useState();
  const [startSearchTime, setStartSearchTime] = useState();
  const [endSearchDate, setEndSearchDate] = useState();
  const [endSearchTime, setEndSearchTime] = useState();

  const [inSearch, setInSearch] = useState(false);

  const [locations, setLocations] = useState([]);

  const max_capacity_option = 5;
  const capacity_options = [];

  function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  for (let i = 1; i < max_capacity_option + 1; i++) {
    let dict = { value: i, label: i };
    capacity_options.push(dict);
  }

  const flipSearchFields = () => {
    let prevDest = dest;
    let prevOrigin = origin;
    setOrigin(prevDest);
    setDest(prevOrigin);
    return;
  };

  const searchRide = async () => {
    console.log(dashboardData);

    try {
      const start_search_time_string = `${startSearchDate.format(
        "YYYY-MM-DD"
      )}T${startSearchTime.format("HH:mm:ss")}`;
      const start_search_time_iso = new Date(
        start_search_time_string
      ).toISOString();

      const arrival_time_string = `${endSearchDate.format(
        "YYYY-MM-DD"
      )}T${endSearchTime.format("HH:mm:ss")}`;
      const arrival_time_iso = new Date(arrival_time_string).toISOString();

      console.log("start date: " + startSearchDate.format("YYYY-MM-DD"));
      console.log("end date: " + endSearchDate.format("YYYY-MM-DD"));

      const response = await fetch(
        `/api/searchrides?origin=${origin.label}&destination=${dest.label}&arrival_time=${arrival_time_iso}&start_search_time=${start_search_time_iso}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch rides: ${response.status}`);
      }

      const data = await response.json();
      console.log("DATA =", data);

      setRidesData(data.rides);
      setInSearch(true);
      console.log(inSearch);
      console.log("end of search ride");
    } catch (error) {
      console.error("Error during fetch:", error);
    }

    handleCloseSearchRideModal();
  };

  const checkCreateRideParams = async () => {

    const now = dayjs()

    console.log("current time = ", now)
    console.log("time = ", time)

    if (
      capacity === "" ||
      origin === "" ||
      dest === "" ||
      date === "" ||
      time === ""
    ) {
      setCreateRideNotif([true, "Please enter all fields!"]);
    } else if (time.isBefore(now, 'minute')) {
      setCreateRideNotif([true, "Cannot enter a time in the past!"])
    } else {
      setCreateRideNotif([false, ""]);
      createRide();
    }
  };

  const createRide = async () => {
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
          origin: origin["label"],
          destination: dest["label"],
          arrival_time: arrival_time_iso,
        }),
      });
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    handleCloseRideModal();
    await fetchDashboardData();
    setLoading(false);
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

  const handleOpenSearchRideModal = async () => {
    setSearchRideModal(true);
  };

  const handleCloseSearchRideModal = async () => {
    setSearchRideModal(false);
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      // console.log(data.locations)
      setDashboardData(data);

      console.log(data.rides);

      const currentTime = new Date();
      data.rides = data.rides.filter(
        (entry) => new Date(entry.arrival_time) >= currentTime
      );
      console.log(currentTime);
      data.rides.sort(
        (a, b) => new Date(a.arrival_time) - new Date(b.arrival_time)
      );
      setRidesData(data.rides);
      const tempLocations = [];
      for (const loc of data.locations) {
        let dict = { value: loc[1], label: loc[1] };
        tempLocations.push(dict);
      }
      setLocations(tempLocations);
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setLoading(false);
  };

  const handleRideRequest = async (rideid) => {
    console.log("IN HANDLE RIDE REQUEST");

    try {
      const response = await fetch("/api/requestride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideid,
        }),
      });
      await fetchDashboardData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const resetSearch = async () => {
    setLoading(true);
    setInSearch(false);
    await fetchDashboardData();
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">
          Welcome, {dashboardData.user_info?.displayname}
        </h1>
      </div>

      <div className="flex justify-between">
        <Link
          to="/myrides"
          className="inline-block bg-theme_medium_2 text-white px-4 py-2 rounded-md hover:bg-theme_dark_2 hover:text-white"
        >
          My Rides
        </Link>
        <div className="flex gap-4">
          <Button
            className="bg-theme_medium_2 text-white px-4 py-2 hover:bg-theme_dark_2"
            onClick={() => handleOpenRideModal()}
          >
            Create a Rideshare
          </Button>
          <Button
            className="bg-theme_medium_2 text-white px-4 py-2 hover:bg-theme_dark_2"
            onClick={() => handleOpenSearchRideModal()}
          >
            Search
          </Button>
        </div>
      </div>

      <br />

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div>
          {inSearch && (
            <div>
              <Button
                onClick={resetSearch}
                className="bg-theme_dark_1 text-white px-4 py-2 hover:text-theme_medium_1 font-semibold"
              >
                Back to All Rides
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
                      : () => handleRideRequest(ride.id)
                  }
                  buttonClassName={`${
                    ride.admin_netid === dashboardData.user_info.netid
                      ? "cursor-auto"
                      : dashboardData.ridereqs[ride.id]
                      ? "cursor-auto font-semibold"
                      : "bg-theme_dark_1 text-white font-semibold"
                  }`}
                  buttonStatus={dashboardData.ridereqs[ride.id]}
                >
                  <p className="text-xl text-center">
                    <strong>
                      {ride.origin_name} → {ride.destination_name}
                    </strong>
                  </p>
                  <p className="text-center mb-2">
                    Arrive by{" "}
                    {new Date(ride.arrival_time).toLocaleString("en-US", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </p>
                  <hr className="border-1 my-3 border-theme_medium_1" />
                  <p>
                    <span className="font-semibold">Posted by:</span>{" "}
                    {ride.admin_name}, {ride.admin_email}
                  </p>
                  <p>
                    <span className="font-semibold">Seats Taken:</span>{" "}
                    {ride.current_riders.length}/{ride.max_capacity}
                  </p>
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
              <div>
                <p className="font-medium">Origin & Destination</p>
                <div className="flex items-center gap-2">
                  <Dropdown
                    inputValue={origin}
                    setInputValue={setOrigin}
                    options={locations}
                    isClearable
                    placeholder="Select an origin"
                  ></Dropdown>
                  <IconButton
                    type="flip"
                    onClick={flipSearchFields}
                    disabled={false}
                  ></IconButton>
                  <Dropdown
                    inputValue={dest}
                    setInputValue={setDest}
                    options={locations}
                    isClearable
                    placeholder="Select a destination"
                  ></Dropdown>
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
            <Button
              className="self-start bg-theme_dark_1 py-1.5 px-3 text-white hover:text-theme_medium_1"
              onClick={checkCreateRideParams}
            >
              Submit
            </Button>

            {createRideNotif[0] && <p> {createRideNotif[1]} </p>}
          </div>
        </Modal>
      )}
      {searchRideModal && (
        <Modal
          isOpen={searchRideModal}
          onClose={handleCloseSearchRideModal}
          title={"Search"}
        >
          <div>
            <Dropdown
              inputValue={origin}
              setInputValue={setOrigin}
              options={locations}
              isClearable
              placeholder="Select starting point"
            ></Dropdown>
            <Dropdown
              inputValue={dest}
              setInputValue={setDest}
              options={locations}
              isClearable
              placeholder="Select destination"
            ></Dropdown>
            Arrive After:
            <DateTimePicker
              date={startSearchDate}
              setDate={setStartSearchDate}
              time={startSearchTime}
              setTime={setStartSearchTime}
            />
            Arrive Before:
            <DateTimePicker
              date={endSearchDate}
              setDate={setEndSearchDate}
              time={endSearchTime}
              setTime={setEndSearchTime}
            />
            <br />
            <Button
              className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
              onClick={searchRide}
            >
              Search
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
