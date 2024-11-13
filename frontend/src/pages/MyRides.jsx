import React, { useState, useEffect } from "react"; // Added React for consistency
import Navbar from "../components/Navbar";
import RideCard from "../components/RideCard";
import MyDateTimePicker from "../components/DateTimePicker";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Pill from "../components/Pill";
import IconButton from "../components/IconButton";
import { useNavigate } from "react-router-dom";

export default function MyRides({ netid }) {
  // myRidesData = array of dictionaries
  const navigate = useNavigate();
  const [myRidesData, setMyRidesData] = useState([]);
  const [viewType, setViewType] = useState("posted");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [modalRequestedRiders, setModalRequestedRiders] = useState([]);
  const [modalCurrentRiders, setModalCurrentRiders] = useState([]);
  const [modalRejectedRiders, setModalRejectedRiders] = useState([]); 

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
      console.log(ride_data)
      setMyRidesData(ride_data);
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
    setModalCurrentRiders(ride.current_riders || []);
    setModalRequestedRiders(ride.requested_riders || []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
    setModalCurrentRiders([]);
    setModalRequestedRiders([]);
    setModalRejectedRiders([]);
  };

  // if Delete clicked on Modal popup
  const handleDeleteRide = async (rideId) => {
    // calls app.py deleteride function (but is currently not working...???)
    try {
      await fetch("/api/deleteride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "rideid": rideId,
        }),
      });
      handleCloseModal();
      await fetchMyRidesData();
    } catch (error) {};
  };

  // if Save clicked on Modal popup
  const handleSaveRide = async (rideId) => {
    // POST for any states that were changed
    let accepting_riders = []
    let rejecting_riders = []

    modalCurrentRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        "requester_id": requester_id,
        "full_name": fullName,
        "mail": mail,
        "rideid": rideId
      };
      accepting_riders.push(rider);
    })

    modalRejectedRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        "requester_id": requester_id,
        "rideid": rideId
      };
      rejecting_riders.push(rider);
    })

    console.log(accepting_riders)
    console.log(rejecting_riders)
    
    try {
      await fetch("/api/batchupdateriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "accepting_riders": accepting_riders,
          "rejecting_riders": rejecting_riders
        }),
      });
      handleCloseModal();
      await fetchMyRidesData();
    }
    catch (error) {}
  };

  // Accepts rider in modal
  const handleAcceptRider = async (netid, fullName, email, rideId) => {
      setModalCurrentRiders((prevCurrentRiders) => [
        ...prevCurrentRiders, [ netid, fullName, email ]
      ])

      setModalRequestedRiders((prevRequestedRiders) => {
        // Remove requested rider from requested_riders
        return prevRequestedRiders.filter(([n, name, mail]) => n !== netid)
      })
  };

  // Rejects rider in modal
  const handleRejectRider = async (netid, fullName, email, rideId) => {
    setModalRejectedRiders((prevRejectedRiders) => [
      // add to rejected riders
      ...prevRejectedRiders, [netid, fullName, email]
    ])

    setModalRequestedRiders((prevRequestedRiders) => {
      // remove from requested riders
      return prevRequestedRiders.filter(([n, name, mail]) => n !== netid)
    })
  };

// removes rider from accepted back to pending
  const handleRemoveRider = async (netid, fullName, email, rideId) => {
    setModalCurrentRiders((prevCurrentRiders) => {
      return prevCurrentRiders.filter(([n, name, mail]) => n !== netid)
    });

    setModalRequestedRiders((prevRequestedRiders)=> [
      ...prevRequestedRiders, [ netid, fullName, email]
    ])

  };

  const handleCancelRideRequest = async (rideid) => {
    try {
      await fetch("/api/cancelriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideid,
        }),
      });
      await fetchMyRidesData();
    } catch (error) {}
  };

  console.log("my rides data is", myRidesData);
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-2">
        <IconButton type="back" onClick={() => navigate("/dashboard")} />
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
      ) : Object.keys(myRidesData).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {myRidesData.map((ride) => (
            <RideCard
              key={ride.id}
              buttonText={
                viewType === "posted" ? "Manage Ride" : "Cancel Request"
              }
              buttonOnClick={
                viewType === "posted"
                  ? () => handleManageRideClick(ride)
                  : () => handleCancelRideRequest(ride.id)
              }
              buttonClassName="bg-theme_medium_1 text-white font-medium hover:bg-theme_dark_1"
            >
              <div>Origin: {ride.origin_name}</div>
              <div>Destination: {ride.destination_name}</div>
              <div>Arrival Time: {ride.arrival_time}</div>
              <div>Admin Name: {ride.admin_name}</div>
              <div>Admin Email: {ride.admin_email}</div>
              <div>
                Capacity: {ride.current_riders?.length || 0}/{ride.max_capacity}
              </div>
              <p>
                {Array.isArray(ride.current_riders) && ride.current_riders.length > 0 ? (
                  <p>
                    <strong>Current Riders:</strong>
                    {ride.current_riders.map((rider) => (
                      <Pill>{rider[0] + " " + rider[1] + " " + rider[2]}</Pill>
                    ))}
                  </p>
                ):(
                  <p>
                    <strong>Current Riders:</strong>
                    <Pill>{<p> No current riders. </p>}</Pill>
                  </p>
                )}
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
             <p>
                <strong>Origin:</strong> {selectedRide.origin_name}
              </p>
              <p>
                <strong>Destination:</strong> {selectedRide.destination_name}
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
                <strong>Capacity:</strong> {selectedRide.current_riders?.length || 0}/
                {selectedRide.max_capacity}
              </p>
              <p>
                {Array.isArray(modalCurrentRiders) && modalCurrentRiders.length > 0 ? (
                    modalCurrentRiders.map((rider, index) => {
                      const [netid, fullName, email] = rider;
                      return (
                        <Pill key={index}>
                          <div className="flex items-center justify-between">
                            <div>{`${netid} ${fullName} ${email}`}</div>
                            <IconButton
                              type="xmark"
                              onClick={() =>
                                handleRemoveRider(netid, fullName, email, selectedRide.id)
                              }
                            />
                          </div>
                        </Pill>
                      );
                    })
                  ) : (
                    <p>No current riders.</p>
                  )}
                </p> 
            
              <div className="flex flex-col gap-2">
                <p>
                  <strong>Requests to Join:</strong>
                </p>
                <div className="overflow-y-auto bg-neutral-100 rounded-lg p-3 max-h-40 flex flex-col gap-2">
                    {Array.isArray(modalRequestedRiders) && modalRequestedRiders.length > 0 ? (
                      modalRequestedRiders.map((requested_rider, index) => {
                        const [netid, fullName, email] = requested_rider;
                        return (
                          <Pill key={index}>
                            <div className="p-1 flex justify-between items-center">
                              <div>{`${netid} ${fullName} ${email}`}</div>
                              <div className="flex items-center gap-2">
                                <IconButton
                                  type="checkmark"
                                  onClick={() =>
                                    handleAcceptRider(netid, fullName, email, selectedRide.id)
                                  }
                                />
                                <IconButton
                                  type="xmark"
                                  onClick={() => handleRejectRider(netid, fullName, email, selectedRide.id)}
                                />
                              </div>
                            </div>
                          </Pill>
                        );
                      })
                    ) : (
                      <p>No requests to join</p>
                    )}
              </div>
            </div>
                <div className="flex justify-between">
                  <Button onClick={() => handleDeleteRide(selectedRide.id)} className="hover:bg-red-600 border border-gray-300">
                    Delete this Ride
                  </Button>
                  <Button onClick={() => handleSaveRide(selectedRide.id)} className="hover:bg-green-600 border border-gray-300">
                    Save
                  </Button>
                </div>

            </div>
          </Modal>

      )}
    </div>
  );
}
