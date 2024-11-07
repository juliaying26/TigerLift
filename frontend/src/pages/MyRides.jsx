import React, { useState, useEffect } from "react"; // Added React for consistency
import Navbar from "../components/Navbar";
import RideCard from "../components/RideCard";
import MyDateTimePicker from "../components/DateTimePicker";
import ManageRidesModal from '../components/ManageRidesModal';
import Button from '../components/Button';

export default function MyRides({ netid }) {
  // myRidesData = array of dictionaries
  const [myRidesData, setMyRidesData] = useState([]);
  const [viewType, setViewType] = useState("posted");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const fetchMyRidesData = async () => {
    setLoading(true);

    const endpoint =
      viewType === "posted" ? "/api/mypostedrides" : "/api/myrequestedrides";
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();

      const ride_data = viewType === "posted" ? data.myrides : data.myreqrides;

      const formattedRides = Array.isArray(ride_data)
        ? ride_data.map((rideArray) => ({
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
            hasRequestedJoin: rideArray[11] || false,
          }))
        : [];
      
      console.log("Formattedrides are", formattedRides)
      setMyRidesData(formattedRides);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRidesData();
  }, [viewType]);

// states for modal
  const handleManageRideClick = (ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  // if Delete clicked on Modal popup
  const handleDeleteRide = () => {
    // calls app.py deleteride function (but is currently not working...???)
    fetch(`/deleteride?rideid=${selectedRide.id}`, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete the ride");
        }
        console.log("Ride deleted!!");
      })
      .catch((error) => {
        console.error("Error deleting ride:", error);
      })
      .finally(() => {
        handleCloseModal();
      });
  };

// if Save clicked on Modal popup
  const handleSaveRide = () => {
    
  };
  

  console.log("my rides data is", myRidesData);
  return (
    <div className="pt-16">
      <Button onClick={() => setViewType("posted")} >My Posted Rides</Button>
      <Button onClick={() => setViewType("requested")}>My Requested Rides</Button>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        myRidesData.length > 0 ? (
          <div className="flex flex-col gap-4">
            {myRidesData.map((ride) => ( 
              <RideCard
                key={ride.id}
                buttonText={viewType === "posted" ? "Manage Ride" : "Cancel Request"}
                buttonOnClick={() => handleManageRideClick(ride)}
              >
                <div>Origin: {ride.origin}</div>
                <div>Destination: {ride.destination}</div>
                <div>Admin Name: {ride.admin_name}</div>
                <div>Admin Email: {ride.admin_email}</div>
                <div>
                  Filled Capacity: {ride.current_riders.length}/{ride.max_capacity}
                </div>
                <div>Arrival Time: {ride.arrival_time}</div>
              </RideCard>
            ))}
          </div>
        ) : (
          <p className="text-center">No rides available in this category.</p>
        )
      )}

        {isModalOpen && (
        <ManageRidesModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          rideDetails={selectedRide}
          onDeleteRide={handleDeleteRide}
          onSave={handleSaveRide}
        />
      )}

    </div>
  );
}
