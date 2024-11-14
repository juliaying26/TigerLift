import React, { useState, useEffect } from "react"; // Added React for consistency
import Navbar from "../components/Navbar";
import RideCard from "../components/RideCard";
import MyDateTimePicker from "../components/DateTimePicker";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Pill from "../components/Pill";
import IconButton from "../components/IconButton";
import { useNavigate } from "react-router-dom";

export default function MyRides() {
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

  function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

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

      let ride_data = viewType === "posted" ? data.myrides : data.myreqrides;
      console.log(ride_data);
      if (viewType === "requested") {
        console.log("efjsefojio");
        ride_data = ride_data.filter(
          (entry) => new Date(entry.arrival_time) >= new Date()
        );
      }
      ride_data.sort(
        (a, b) => new Date(b.arrival_time) - new Date(a.arrival_time)
      );
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
    try {
      const response = await fetch("/api/deleteride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideId,
        }),
      });
      handleCloseModal();
      await fetchMyRidesData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  // if Save clicked on Modal popup
  const handleSaveRide = async (rideId) => {
    // POST for any states that were changed
    let accepting_riders = [];
    let rejecting_riders = [];
    let pending_riders = [];

    modalCurrentRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        requester_id: requester_id,
        full_name: fullName,
        mail: mail,
        rideid: rideId,
      };
      accepting_riders.push(rider);
    });

    modalRejectedRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        requester_id: requester_id,
        rideid: rideId,
      };
      rejecting_riders.push(rider);
    });

    modalRequestedRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        requester_id: requester_id,
        full_name: fullName,
        mail: mail,
        rideid: rideId,
      };
      pending_riders.push(rider);
    });

    console.log("Accepting riders:", accepting_riders);
    console.log("Rejecting riders:", rejecting_riders);
    console.log("Pending riders:", pending_riders);

    try {
      const response = await fetch("/api/batchupdateriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accepting_riders: accepting_riders,
          rejecting_riders: rejecting_riders,
          pending_riders: pending_riders,
        }),
      });
      handleCloseModal();
      await fetchMyRidesData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  // Accepts rider in modal
  const handleAcceptRider = async (netid, fullName, email, rideId) => {
    setModalCurrentRiders((prevCurrentRiders) => [
      ...prevCurrentRiders,
      [netid, fullName, email],
    ]);

    setModalRequestedRiders((prevRequestedRiders) => {
      // Remove requested rider from requested_riders
      return prevRequestedRiders.filter(([n, name, mail]) => n !== netid);
    });
  };

  // Rejects rider in modal
  const handleRejectRider = async (netid, fullName, email, rideId) => {
    setModalRejectedRiders((prevRejectedRiders) => [
      // add to rejected riders
      ...prevRejectedRiders,
      [netid, fullName, email],
    ]);

    setModalRequestedRiders((prevRequestedRiders) => {
      // remove from requested riders
      return prevRequestedRiders.filter(([n, name, mail]) => n !== netid);
    });
  };

  // removes rider from accepted back to pending
  const handleRemoveRider = async (netid, fullName, email, rideId) => {
    setModalCurrentRiders((prevCurrentRiders) => {
      return prevCurrentRiders.filter(([n, name, mail]) => n !== netid);
    });

    setModalRequestedRiders((prevRequestedRiders) => [
      ...prevRequestedRiders,
      [netid, fullName, email],
    ]);
  };

  const handleCancelRideRequest = async (rideid) => {
    try {
      const response = await fetch("/api/cancelriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideid,
        }),
      });
      await fetchMyRidesData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  console.log("my rides data is", myRidesData);
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-4">
        <IconButton type="back" onClick={() => navigate("/dashboard")} />
        <Button
          className={`${
            viewType == "posted" ? "bg-theme_dark_1" : "bg-theme_medium_1"
          } text-white font-semibold px-4 py-2`}
          onClick={() => setViewType("posted")}
        >
          My Posted Rides
        </Button>
        <Button
          className={`${
            viewType == "requested" ? "bg-theme_dark_1" : "bg-theme_medium_1"
          } text-white font-semibold px-4 py-2`}
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
                new Date(ride.arrival_time) > new Date() &&
                (viewType === "posted"
                  ? "Manage Ride"
                  : ride.request_status !== "accepted" && "Cancel Request")
              }
              buttonOnClick={
                viewType === "posted"
                  ? () => handleManageRideClick(ride)
                  : ride.request_status === "accepted"
                  ? () => {}
                  : () => handleCancelRideRequest(ride.id)
              }
              buttonClassName={`${
                ride.request_status === "accepted" ||
                new Date(ride.arrival_time) <= new Date()
                  ? "cursor-auto"
                  : "bg-theme_medium_1 text-white font-medium hover:bg-theme_dark_1"
              }`}
              secondaryButtonText={
                viewType === "requested" &&
                capitalizeFirstLetter(ride.request_status)
              }
              secondaryButtonOnClick={() => {}}
              secondaryButtonClassName="cursor-auto"
              secondaryButtonStatus={ride.request_status}
            >
              <div>
                <p className="text-xl text-center">
                  <strong>
                    {ride.origin_name} → {ride.destination_name}
                  </strong>
                </p>
                <p className="text-center mb-2">
                  Arrival by{" "}
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
                  <strong>Admin Name:</strong> {ride.admin_name}
                </p>
                <p>
                  <strong>Admin Email:</strong> {ride.admin_email}
                </p>
                <p>
                  <strong>Seats Taken:</strong> {ride.current_riders.length}/
                  {ride.max_capacity}
                </p>
                {viewType === "posted" && (
                  <p>
                    <strong>
                      {new Date(ride.arrival_time) > new Date()
                        ? "Current Riders:"
                        : "Rode with:"}
                    </strong>
                    {Array.isArray(ride.current_riders) &&
                    ride.current_riders.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {ride.current_riders.map((rider) => (
                          <Pill>
                            {rider[0] + " " + rider[1] + " " + rider[2]}
                          </Pill>
                        ))}
                      </div>
                    ) : (
                      <p>
                        {new Date(ride.arrival_time) > new Date()
                          ? "No current riders."
                          : "None."}
                      </p>
                    )}
                  </p>
                )}
              </div>
            </RideCard>
          ))}
        </div>
      ) : (
        <p className="text-center">
          {viewType === "posted" ? "No posted rides." : "No requested rides."}
        </p>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={"Manage this Ride"}
        >
          <div className="flex flex-col gap-1">
            <p>
              <strong>Origin:</strong> {selectedRide.origin_name}
            </p>
            <p>
              <strong>Destination:</strong> {selectedRide.destination_name}
            </p>
            <p>
              <strong>Arrival Time:</strong>{" "}
              {new Date(selectedRide.arrival_time).toLocaleString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </p>
            <p>
              <strong>Admin Name:</strong> {selectedRide.admin_name}
            </p>
            <p>
              <strong>Admin Email:</strong> {selectedRide.admin_email}
            </p>
            <p>
              <strong>Seats Taken:</strong>{" "}
              {selectedRide.current_riders?.length || 0}/
              {selectedRide.max_capacity}
            </p>
            <p>
              <strong>Current Riders:</strong>
              {Array.isArray(modalCurrentRiders) &&
              modalCurrentRiders.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {modalCurrentRiders.map((rider, index) => {
                    const [netid, fullName, email] = rider;
                    return (
                      <Pill key={index}>
                        <div className="flex items-center justify-between">
                          <div>{`${netid} ${fullName} ${email}`}</div>
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
                </div>
              ) : (
                <p>No current riders.</p>
              )}
            </p>

            <div className="flex flex-col gap-2">
              <p>
                <strong>Requests to Join:</strong>
              </p>
              <div className="overflow-y-auto bg-neutral-100 rounded-lg p-3 max-h-40 flex flex-col gap-2">
                {Array.isArray(modalRequestedRiders) &&
                modalRequestedRiders.length > 0 ? (
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
                                handleRejectRider(
                                  netid,
                                  fullName,
                                  email,
                                  selectedRide.id
                                )
                              }
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
              <Button
                onClick={() => handleDeleteRide(selectedRide.id)}
                className="hover:bg-red-600 border border-gray-300"
              >
                Delete this Ride
              </Button>
              <Button
                onClick={() => handleSaveRide(selectedRide.id)}
                className="hover:bg-green-600 border border-gray-300"
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
