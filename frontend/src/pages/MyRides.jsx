import React, { useState, useEffect } from "react"; // Added React for consistency
import RideCard from "../components/RideCard";
import DateTimePicker from "../components/DateTimePicker";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Pill from "../components/Pill";
import IconButton from "../components/IconButton";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import dayjs from "dayjs";
import WarningModal from "../components/WarningModal";
import Input from "../components/Input";
import TextArea from "../components/TextArea";

export default function MyRides() {
  // myRidesData = array of dictionaries
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({});
  const [myRidesData, setMyRidesData] = useState([]);
  const [viewType, setViewType] = useState("posted");
  const [loading, setLoading] = useState(true);

  const [selectedRide, setSelectedRide] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningModalInfo, setWarningModalInfo] = useState({
    title: "",
    buttonText: "",
  });
  const [deleteRideMessage, setDeleteRideMessage] = useState("");

  const [modalRequestedRiders, setModalRequestedRiders] = useState([]);
  const [modalCurrentRiders, setModalCurrentRiders] = useState([]);
  const [modalRejectedRiders, setModalRejectedRiders] = useState([]);

  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(null);

  const [isEditingArrivalTime, setIsEditingArrivalTime] = useState(false);
  const [newArrivalDate, setNewArrivalDate] = useState(null);
  const [newArrivalTime, setNewArrivalTime] = useState(null);

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
      setUserInfo(data.user_info);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRidesData();
  }, [viewType]);

  useEffect(() => {
    if (selectedRide) {
      setNewCapacity({
        value: selectedRide.max_capacity,
        label: selectedRide.max_capacity,
      });
      setNewArrivalDate(dayjs(selectedRide.arrival_time));
      setNewArrivalTime(dayjs(selectedRide.arrival_time));
    }
  }, [selectedRide]);

  // states for modal
  const handleManageRideClick = (ride) => {
    setSelectedRide(ride);
    setModalCurrentRiders(ride.current_riders || []);
    setModalRequestedRiders(ride.requested_riders || []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (hasRideChanges()) {
      setIsWarningModalOpen(true);
      setWarningModalInfo({
        title: "Unsaved Changes",
        buttonText: "Discard Changes",
      });
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    if (isWarningModalOpen) {
      handleCloseWarningModal();
    }
    setIsModalOpen(false);
    setSelectedRide(null);
    setModalCurrentRiders([]);
    setModalRequestedRiders([]);
    setModalRejectedRiders([]);
    setIsEditingCapacity(false);
    setNewCapacity(null);
    setIsEditingArrivalTime(false);
    setNewArrivalDate(null);
    setNewArrivalTime(null);
  };

  const handleCloseWarningModal = () => {
    setIsWarningModalOpen(false);
    setWarningModalInfo({
      title: "",
      buttonText: "",
    });
    setDeleteRideMessage("");
  };

  const handleDeleteRide = () => {
    setIsWarningModalOpen(true);
    setWarningModalInfo({
      title: "Delete this Ride?",
      buttonText: "Delete Ride",
    });
  };

  const deleteRide = async (rideId) => {
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
      closeModal();
      await fetchMyRidesData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const hasRideChanges = () => {
    if (
      (newCapacity && newCapacity.label !== selectedRide.max_capacity) ||
      !dayjs(newArrivalDate).isSame(dayjs(selectedRide.arrival_time), "day") ||
      !dayjs(newArrivalTime).isSame(dayjs(selectedRide.arrival_time), "time") ||
      modalCurrentRiders?.length !== selectedRide.current_riders.length ||
      modalRequestedRiders?.length !== selectedRide.requested_riders.length ||
      modalRejectedRiders?.length !== 0
    ) {
      return true;
    } else return false;
  };

  useEffect(() => {
    console.log(deleteRideMessage);
  }, [deleteRideMessage]);

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
      };
      accepting_riders.push(rider);
    });

    modalRejectedRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        requester_id: requester_id,
      };
      rejecting_riders.push(rider);
    });

    modalRequestedRiders.forEach(([requester_id, fullName, mail]) => {
      const rider = {
        requester_id: requester_id,
        full_name: fullName,
        mail: mail,
      };
      pending_riders.push(rider);
    });

    console.log("Accepting riders:", accepting_riders);
    console.log("Rejecting riders:", rejecting_riders);
    console.log("Pending riders:", pending_riders);

    const new_arrival_time_string = `${newArrivalDate.format(
      "YYYY-MM-DD"
    )}T${newArrivalTime.format("HH:mm:ss")}`;
    const new_arrival_time_iso = new Date(
      new_arrival_time_string
    ).toISOString();

    console.log(new_arrival_time_iso);

    if (!hasRideChanges()) {
      handleCloseModal();
      return;
    }

    try {
      const response = await fetch("/api/batchupdateriderequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideid: rideId,
          accepting_riders: accepting_riders,
          rejecting_riders: rejecting_riders,
          pending_riders: pending_riders,
          new_capacity: newCapacity?.label,
          new_arrival_time: new_arrival_time_iso,
        }),
      });
      closeModal();
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
    if (
      (newCapacity && modalCurrentRiders.length >= newCapacity.label) ||
      (!newCapacity && modalCurrentRiders.length >= selectedRide.max_capacity)
    ) {
      setWarningModalInfo({
        title: "Capacity Full",
        buttonText: "Okay",
      });
      setIsWarningModalOpen(true);
    } else {
      setModalCurrentRiders((prevCurrentRiders) => [
        ...prevCurrentRiders,
        [netid, fullName, email],
      ]);

      setModalRequestedRiders((prevRequestedRiders) => {
        // Remove requested rider from requested_riders
        return prevRequestedRiders.filter(([n, name, mail]) => n !== netid);
      });
    }
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
    <div className="flex flex-col gap-6 p-8">
      <div className="flex gap-4">
        <IconButton type="back" onClick={() => navigate("/dashboard")} />
        <Button
          className={`${
            viewType == "posted"
              ? "bg-theme_dark_1 font-medium"
              : "bg-theme_medium_1"
          } text-white px-4 py-2 hover:bg-theme_dark_1`}
          onClick={() => setViewType("posted")}
        >
          My Posted Rides
        </Button>
        <Button
          className={`${
            viewType == "requested"
              ? "bg-theme_dark_1 font-medium"
              : "bg-theme_medium_1"
          } text-white px-4 py-2 hover:bg-theme_dark_1`}
          onClick={() => setViewType("requested")}
        >
          My Requested Rides
        </Button>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : Object.keys(myRidesData).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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
                  : "bg-theme_medium_2 text-white font-medium hover:bg-theme_dark_2"
              }`}
              secondaryButtonText={
                viewType === "requested" &&
                "Status: " + capitalizeFirstLetter(ride.request_status)
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
                {viewType === "posted" && (
                  <div>
                    <p>
                      <span className="font-semibold">
                        {new Date(ride.arrival_time) > new Date()
                          ? "Current Riders:"
                          : "Rode with:"}
                      </span>
                    </p>
                    {Array.isArray(ride.current_riders) &&
                    ride.current_riders.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {ride.current_riders.map((rider, index) => {
                          const [netid, fullName, email] = rider;
                          return (
                            <Pill key={index}>{`${fullName} ${email}`}</Pill>
                          );
                        })}
                      </div>
                    ) : (
                      <p>
                        {new Date(ride.arrival_time) > new Date()
                          ? "No current riders."
                          : "None."}
                      </p>
                    )}
                  </div>
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

      {isWarningModalOpen && (
        <WarningModal
          isOpen={isWarningModalOpen}
          title={warningModalInfo.title}
        >
          <div className="flex flex-col gap-3">
            <p>
              {warningModalInfo.title === "Unsaved Changes"
                ? "You have unsaved changes. Do you want to discard them?"
                : warningModalInfo.title === "Delete this Ride?"
                ? "Are you sure you want to delete this ride?"
                : "The capacity for this ride is full. Please remove a rider before accepting another, or increase the capacity of the ride (maximum 5)."}
            </p>
            {warningModalInfo.title === "Delete this Ride?" &&
              selectedRide.current_riders.length != 0 && (
                <div className="flex flex-col gap-4">
                  <p>
                    Please give a reason for deleting this ride. The riders you
                    have currently accepted will be notified that this ride was
                    deleted.
                  </p>
                  <TextArea
                    placeholder={"List reason here."}
                    inputValue={deleteRideMessage}
                    setInputValue={setDeleteRideMessage}
                  />
                </div>
              )}
            <div className="flex items-center self-end gap-2">
              {warningModalInfo.title !== "Capacity Full" && (
                <Button
                  className="border-[1px] border-gray-300 text-theme_dark_1 hover:bg-zinc-100"
                  onClick={handleCloseWarningModal}
                >
                  Cancel
                </Button>
              )}
              <Button
                className={`${
                  warningModalInfo.title !== "Capacity Full"
                    ? "bg-red-400 text-white hover:bg-red-500"
                    : "bg-theme_medium_2 text-white hover:bg-theme_dark_2"
                }`}
                onClick={
                  warningModalInfo.title === "Unsaved Changes"
                    ? closeModal
                    : warningModalInfo.title === "Delete this Ride?"
                    ? () => deleteRide(selectedRide.id)
                    : handleCloseWarningModal
                }
              >
                {warningModalInfo.buttonText}
              </Button>
            </div>
          </div>
        </WarningModal>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={"Manage this Ride"}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-zinc-700 mb-2 rounded-md bg-info_light p-2">
              Any changes you make in this pop up will remain unsaved until you
              click "Save".
            </p>
            <p className="text-xl my-1">
              <strong>
                {selectedRide.origin_name} → {selectedRide.destination_name}
              </strong>
            </p>
            <div className="flex items-center gap-1">
              <p>
                <span className="font-semibold">Arrive by:</span>{" "}
              </p>
              {isEditingArrivalTime ? (
                <DateTimePicker
                  date={newArrivalDate}
                  setDate={setNewArrivalDate}
                  time={newArrivalTime}
                  setTime={setNewArrivalTime}
                  allowClear={false}
                />
              ) : newArrivalDate || newArrivalTime ? (
                new Date(
                  `${newArrivalDate.format(
                    "YYYY-MM-DD"
                  )}T${newArrivalTime.format("HH:mm:ss")}`
                ).toLocaleString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })
              ) : (
                new Date(selectedRide.arrival_time).toLocaleString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })
              )}
              {isEditingArrivalTime ? (
                <Button
                  className="flex items-center gap-1 text-theme_medium_2 hover:text-theme_dark_2"
                  onClick={() => setIsEditingArrivalTime(false)}
                >
                  {!dayjs(newArrivalDate).isSame(
                    dayjs(selectedRide.arrival_time),
                    "day"
                  ) ||
                  !dayjs(newArrivalTime).isSame(
                    dayjs(selectedRide.arrival_time),
                    "time"
                  )
                    ? "Save"
                    : "Cancel"}
                </Button>
              ) : (
                <Button
                  className="flex items-center gap-1 text-theme_medium_2 hover:text-theme_dark_2"
                  onClick={() => setIsEditingArrivalTime(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <p>
              <span className="font-semibold">Posted by:</span>{" "}
              {selectedRide.admin_name}, {selectedRide.admin_email}
            </p>
            <div className="flex items-center gap-1">
              <span className="font-semibold">Seats Taken:</span>{" "}
              {modalCurrentRiders.length || 0}
              {"/"}
              {isEditingCapacity ? (
                <Dropdown
                  inputValue={newCapacity}
                  setInputValue={setNewCapacity}
                  options={Array.from({ length: 5 }, (_, i) => {
                    const start =
                      modalCurrentRiders?.length > 1
                        ? modalCurrentRiders.length
                        : 1;
                    const value = i + start;
                    return {
                      value,
                      label: value,
                    };
                  }).slice(0, 6 - (modalCurrentRiders?.length || 0))}
                  isClearable
                ></Dropdown>
              ) : (
                newCapacity?.label || selectedRide.max_capacity
              )}
              {isEditingCapacity ? (
                <Button
                  className="text-theme_medium_2 hover:text-theme_dark_2"
                  onClick={() => setIsEditingCapacity(false)}
                >
                  {newCapacity?.label !== selectedRide.max_capacity
                    ? "Save"
                    : "Cancel"}
                </Button>
              ) : (
                <Button
                  className="text-theme_medium_2 hover:text-theme_dark_2"
                  onClick={() => setIsEditingCapacity(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <p>
              <span className="font-semibold">Current Riders:</span>
            </p>
            {Array.isArray(modalCurrentRiders) &&
            modalCurrentRiders.length > 0 ? (
              <div className="flex flex-col gap-2 mt-1">
                {modalCurrentRiders.map((rider, index) => {
                  const [netid, fullName, email] = rider;
                  return (
                    <Pill key={index}>
                      <div className="flex items-center justify-between">
                        <div>{`${fullName} ${email}`}</div>
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
                          className="text-zinc-700 hover:text-zinc-500"
                        />
                      </div>
                    </Pill>
                  );
                })}
              </div>
            ) : (
              <p>No current riders.</p>
            )}
            <div className="flex flex-col gap-2 mt-1 mb-4">
              <p className="-mb-1">
                <span className="font-semibold">Requests to Join:</span>
              </p>
              <div className="overflow-y-auto bg-zinc-100 rounded-lg p-3 max-h-40 flex flex-col gap-2">
                {Array.isArray(modalRequestedRiders) &&
                modalRequestedRiders.length > 0 ? (
                  modalRequestedRiders.map((requested_rider, index) => {
                    const [netid, fullName, email] = requested_rider;
                    return (
                      <Pill key={index}>
                        <div className="flex justify-between items-center">
                          <div>{`${fullName} ${email}`}</div>
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
                              className="bg-theme_medium_2 text-theme_dark_2 hover:bg-theme_light_2"
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
                              className="bg-theme_medium_1 text-theme_dark_1 hover:bg-theme_light_1"
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
                className="hover:bg-red-300 border border-zinc-300 text-zinc-700"
              >
                Delete this Ride
              </Button>
              <Button
                onClick={() => handleSaveRide(selectedRide.id)}
                className="hover:bg-theme_light_2 border border-zinc-300 text-zinc-700"
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
