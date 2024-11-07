import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Input from "../components/Input";
import DateTimePicker from "../components/DateTimePicker";
import RideCard from "../components/RideCard.jsx"
import Pill from "../components/Pill.jsx"
// import RidesTable from "./RidesTable";
// import AddRideForm from "./AddRideForm";

export default function Dashboard() {
  
  const [dashboardData, setDashboardData] = useState({
    user_info: null,
    rides: [],
    locations: [],
    ridereqs: {},
  });
  const [loading, setLoading] = useState(true);

  const [ridesData, setRidesData] = useState([]);

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

      setRidesData(formattedRides)

    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleRideRequest = async (ride) => {
    try {
      console.log(ride.id)
      const response = await fetch("/requestride/?rideid=${ride.id}");
      const data = await response.json();
      console.log("ride requested sucessfully")
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

    
  useEffect(() => {
    console.log(dashboardData.ridereqs);
  }, [dashboardData]);

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
        className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
      >
        Log out
      </a>
      <br />
      <br />

      <Link to="/myrides">My Rides</Link>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : ridesData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {ridesData.map((ride) => (
            <RideCard
              key={ride.id}
              buttonText={
                dashboardData.ridereqs[ride.id] ? "Pending" : "Request a Ride"
              }
              buttonOnClick={() => handleRideRequest(ride)}
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

      <a
        href="/myrides"
        className="bg-theme_dark_2 text-white px-4 py-2 rounded hover:text-theme_medium_1"
      >
        My Rides
      </a>
      <br />
      <br />

      <div>
        <p> Create a new ride: </p>
        <Input label="Maximum Capacity"></Input>
        <Input label="Starting Point"></Input>
        <Input label="Destination"></Input>
        <DateTimePicker> </DateTimePicker>
        <br />
        <a
          //href="/api/dashboard"
          className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
        >
          Submit
        </a>
      </div>

      {/* <AddRideForm
        locations={dashboardData.locations}
        onSubmit={fetchDashboardData}
      />
      <RidesTable
        rides={dashboardData.rides}
        ridereqs={dashboardData.ridereqs}
        userId={dashboardData.user_info?.netid}
        onAction={fetchDashboardData}
      /> */}
    </div>
  );
}
