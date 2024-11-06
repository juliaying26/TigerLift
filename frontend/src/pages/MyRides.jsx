import React, { useState, useEffect } from "react"; // Added React for consistency
import Navbar from "../components/Navbar";
import RideCard from "../components/RideCard";
import MyDateTimePicker from "../components/DateTimePicker";

export default function MyRides({ netid }) {
  const [myRidesData, setMyRidesData] = useState([]);
  const [viewType, setViewType] = useState("posted");
  const [loading, setLoading] = useState(true);

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

      const formattedRides = Array.isArray(data.myrides)
        ? data.myrides.map((rideArray) => ({
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

  console.log(myRidesData);
  return (
    <div className="pt-16">
      <button onClick={() => setViewType("posted")}>My Posted Rides</button>
      <button onClick={() => setViewType("requested")}>
        My Requested Rides
      </button>
      {loading ? (
        <div>loading...</div>
      ) : (
        <div className="rides-container">
          {myRidesData.length > 0 ? (
            myRidesData.map((ride) => (
              <RideCard
                my_netid={netid}
                key={ride.id}
                id={ride.id}
                admin_netid={ride.admin_netid}
                admin_name={ride.admin_name}
                admin_email={ride.admin_email}
                max_capacity={ride.max_capacity}
                origin={ride.origin}
                destination={ride.destination}
                arrival_time={ride.arrival_time}
                creation_time={ride.creation_time}
                updated_at={ride.updated_at}
                current_riders={ride.current_riders}
                isMyRide={ride.admin_netid === netid}
                hasRequestedJoin={ride.hasRequestedJoin}
                handleRequestToJoin={(id) =>
                  console.log(`Requesting to join ride with ID: ${id}`)
                }
                handleCancelRequest={(id) =>
                  console.log(`Cancelling request for ride with ID: ${id}`)
                }
              />
            ))
          ) : (
            <p>No rides available in this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
