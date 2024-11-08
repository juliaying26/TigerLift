import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import DateTimePicker from "../components/DateTimePicker";
import RideCard from "../components/RideCard.jsx";
import Pill from "../components/Pill.jsx";
import Button from "../components/Button.jsx"
import Modal from "../components/Modal.jsx"
import { useNavigate } from "react-router-dom";


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

  const capacityRef = useRef();
  const originRef = useRef();
  const destRef = useRef();

  const [formData, setFormData] = useState({
    capacity: '',
    origin: '',
    dest: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


  };

  const createRide = async() => {

    console.log("IN CREATE RIDE!!")

    // NOT WORKING, HOW TO ACCESS VALUES???

    const rideDetails = {
      capacity: formData.capacity,
      origin: formData.origin,
      dest: formData.dest,
    };

    console.log(rideDetails)

    const queryParams = new URLSearchParams(rideDetails).toString();
    const url = "/api/addride?${queryParams}"
    
    try {
      await fetch(url)
      const data = await response.json()
      await fetchDashboardData();
    } catch (error) {}

    setLoading(false)
    handleCloseRideModal()
  };

  const handleOpenRideModal = async() => {
    setCreateRideModal(true)
  }

  const handleCloseRideModal = async() => {
    setCreateRideModal(false)
  }

  const handleOpenSearchRideModal = async() => {
    setSearchRideModal(true)
  }

  const handleCloseSearchRideModal = async() => {
    setSearchRideModal(false)
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setDashboardData(data);

      const formattedRides = Array.isArray(data.rides)
        ? data.rides.map((rideArray) => ({
            id: rideArray[0],
            admin_netid: rideArray[1],
            admin_name: rideArray[2],
            admin_email: rideArray[3],
            max_capacity: rideArray[4],
            origin: rideArray[5],
            destination: rideArray[6],
            arrival_time: rideArray[7],
            creation_time: rideArray[8],
            updated_at: rideArray[9],
            current_riders: rideArray[10],
            requested_riders: rideArray[11] || false,
          }))
        : [];

      setRidesData(formattedRides);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleRideRequest = async (rideid) => {
    try {
      await fetch("/api/requestride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideid,
        }),
      });
      await fetchDashboardData();
    } catch (error) {}
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">
          Welcome, {dashboardData.user_info?.displayname}
        </h1>
      </div>
      <a
        href="/api/logout"
        className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1 float-right"
      >
        Log out
      </a>
      <br />
      <br />

      <Link
        to="/myrides"
        className="bg-theme_dark_2 text-white px-4 py-2 rounded hover:text-theme_medium_1"
      >
        My Rides
      </Link>

      <Button
        className="bg-theme_dark_2 text-white px-4 py-2 rounded hover:text-theme_medium_1"
        onClick={() => handleOpenRideModal()}
      >
        Create a Ride
      </Button>

      <Button
        className="bg-theme_dark_2 text-white px-4 py-2 rounded hover:text-theme_medium_1"
        onClick={() => handleOpenSearchRideModal()}
      >
        Search
      </Button>
      
      <br />
      <br />

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : ridesData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ridesData.map((ride) => (
            <RideCard
              key={ride.id}
              buttonText={
                ride.admin_netid === dashboardData.user_info.netid
                  ? "Cannot join your own ride"
                  : dashboardData.ridereqs[ride.id]
                  ? "Pending"
                  : "Request a Ride"
              }
              buttonOnClick={
                dashboardData.ridereqs[ride.id] ||
                ride.admin_netid === dashboardData.user_info.netid
                  ? () => {}
                  : () => handleRideRequest(ride.id)
              }
              buttonClassName={`${
                (dashboardData.ridereqs[ride.id] ||
                  ride.admin_netid === dashboardData.user_info.netid) &&
                "cursor-auto"
              } bg-theme_dark_1 text-white font-medium`}
            >
              <div>Origin: {ride.origin}</div>
              <div>Destination: {ride.destination}</div>
              <div>Arrival Time: {ride.arrival_time}</div>
              <div>Admin Name: {ride.admin_name}</div>
              <div>Admin Email: {ride.admin_email}</div>
              <div>
                Capacity: {ride.current_riders.length}/{ride.max_capacity}
              </div>
              <p>
                <strong>Current Riders:</strong>
                {ride.current_riders.map((rider) => (
                  <Pill>{rider[0] + " " + rider[1] + " " + rider[2]}</Pill>
                ))}
              </p>
            </RideCard>
          ))}
        </div>
      ) : (
        <p className="text-center">No rides available in this category.</p>
      )}

    {createRideModal && ( <Modal
          isOpen={createRideModal}
          onClose={handleCloseRideModal}
          title={"Create a Ride"}
        >
        <div>
            <Input
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              label="Maximum Capacity"
            />
            <Input
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              label="Starting Point"
            />
            <Input
              name="dest"
              value={formData.dest}
              onChange={handleInputChange}
              label="Destination"
            />
            <DateTimePicker />
            <br />

            <Button
              className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
              onClick={createRide}
            >
              Submit
            </Button>

        </div>
      </Modal>
    )}
      {searchRideModal && ( <Modal
              isOpen={searchRideModal}
              onClose={handleCloseSearchRideModal}
              title={"Search"}
            >
            <div>
                <Input
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  label="Starting Point"
                />
                <Input
                  name="dest"
                  value={formData.dest}
                  onChange={handleInputChange}
                  label="Destination"
                />
                <br />

                <Button
                  className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
                  // onClick={searchRide} FININSH UP
                >
                  Search
                </Button>

            </div>
          </Modal>
      )}
    
    </div>
  );
}
