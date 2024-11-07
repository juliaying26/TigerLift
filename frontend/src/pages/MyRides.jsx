import React, { useState, useEffect } from "react"; // Added React for consistency
import Navbar from "../components/Navbar";
import RideCard from "../components/RideCard";
import MyDateTimePicker from "../components/DateTimePicker";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Pill from "../components/Pill";
import IconButton from "../components/IconButton";

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
            requested_riders: rideArray[11] || false,
          }))
        : [];

      console.log("Formattedrides are", formattedRides);
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
  const handleSaveRide = () => {};

  const handleAcceptRider = async (netid, fullName, email, rideId) => {
    try {
      await fetch("/api/acceptriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester_id: netid,
          full_name: fullName,
          mail: email,
          rideid: rideId,
        }),
      });
      await fetchMyRidesData();
    } catch (error) {}
  };

  const handleRejectRider = async (netid, rideId) => {
    try {
      await fetch("/api/rejectriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester_id: netid,
          rideid: rideId,
        }),
      });
      await fetchMyRidesData();
    } catch (error) {}
  };

  const handleRemoveRider = async (netid, fullName, email, rideId) => {
    try {
      await fetch("/api/removerider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester_id: netid,
          full_name: fullName,
          mail: email,
          rideid: rideId,
        }),
      });
      await fetchMyRidesData();
    } catch (error) {}
  };

  console.log("my rides data is", myRidesData);
  return (
    <div className="pt-16 flex flex-col gap-6">
      <div className="flex gap-2">
        <Button
          className={`${
            viewType == "posted" ? "bg-theme_dark_1" : "bg-theme_medium_1"
          } text-white font-medium`}
          onClick={() => setViewType("posted")}
        >
          My Posted Rides
        </Button>
        <Button
          className={`${
            viewType == "requested" ? "bg-theme_dark_1" : "bg-theme_medium_1"
          } text-white font-medium`}
          onClick={() => setViewType("requested")}
        >
          My Requested Rides
        </Button>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : myRidesData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {myRidesData.map((ride) => (
            <RideCard
              key={ride.id}
              buttonText={
                viewType === "posted" ? "Manage Ride" : "Cancel Request"
              }
              buttonOnClick={() => handleManageRideClick(ride)}
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

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={"Manage this Ride"}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <p>
                <strong>Origin:</strong> {selectedRide.origin}
              </p>
              <p>
                <strong>Destination:</strong> {selectedRide.destination}
              </p>
              <p>
                <strong>Arrival Time:</strong> {selectedRide.arrival_time}
              </p>
              <p>
                <strong>Admin Name:</strong> {selectedRide.admin_name}
              </p>
              <p>
                <strong>Admin Email:</strong> {selectedRide.admin_email}
              </p>
              <p>
                <strong>Capacity:</strong> {selectedRide.current_riders.length}/
                {selectedRide.max_capacity}
              </p>
              <p>
                <strong>Current Riders:</strong>
                {selectedRide.current_riders.map((rider) => {
                  const [netid, fullName, email] = rider;
                  return (
                    <Pill>
                      <div className="flex items-center justify-between">
                        <div>{rider[0] + " " + rider[1] + " " + rider[2]}</div>
                        <IconButton
                          type="xmark"
                          onClick={() =>
                            handleRemoveRider(
                              netid,
                              fullName,
                              email,
                              selectedRide.id
                            )
                          }
                        />
                      </div>
                    </Pill>
                  );
                })}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="">
                <strong>Requests to Join:</strong>
              </p>
              <div className="overflow-y-auto bg-neutral-100 rounded-lg p-3 max-h-40 flex flex-col gap-2">
                {selectedRide.requested_riders.map((requested_rider) => {
                  const [netid, fullName, email] = requested_rider;
                  return (
                    <Pill>
                      <div className="p-1 flex justify-between items-center">
                        <div>
                          {requested_rider[0] +
                            " " +
                            requested_rider[1] +
                            " " +
                            requested_rider[2]}
                        </div>
                        <div className="flex items-center gap-2">
                          <IconButton
                            type="checkmark"
                            onClick={() =>
                              handleAcceptRider(
                                netid,
                                fullName,
                                email,
                                selectedRide.id
                              )
                            }
                          />
                          <IconButton
                            type="xmark"
                            onClick={() =>
                              handleRejectRider(netid, selectedRide.id)
                            }
                          />
                        </div>
                      </div>
                    </Pill>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between">
              <Button onClick={handleDeleteRide} className="hover:bg-red-600">
                Delete this Ride
              </Button>
              <Button onClick={handleSaveRide} className="hover:bg-green-600">
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
