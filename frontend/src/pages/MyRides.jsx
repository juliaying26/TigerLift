// importing necessary libraries and components
import React, { useState, useEffect } from "react";
import RideCard from "../components/RideCard";
import RideEditor from "../components/RideEditor";
import Button from "../components/Button";
import Pill from "../components/Pill";
import IconButton from "../components/IconButton";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import CopyEmailButton from "../components/CopyEmailButton";
import PopUpMessage from "../components/PopUpMessage";
import LoadingIcon from "../components/LoadingIcon";
import useAutoRefresh from "../utils/useAutoRefresh";
import {
  capitalizeFirstLetter,
  handleShowPopupMessage,
  renderRideCardInfo,
  bigButtonStyling1,
  getGoogleCalendarUrl,
  tapTargetInline,
} from "../utils/utils";
import useIsMobile from "../utils/useIsMobile";

// For parsing date
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

// tags each ride with whether the user posted or requested it, sorted by arrival
const mergeRides = (posted, requested, newestFirst) =>
  [
    ...posted.map((ride) => ({ ...ride, kind: "posted" })),
    ...requested.map((ride) => ({ ...ride, kind: "requested" })),
  ].sort((a, b) => {
    const diff = new Date(a.arrival_time) - new Date(b.arrival_time);
    return newestFirst ? -diff : diff;
  });

// Displaying and managing all Rides that user requested or created
export default function MyRides() {
  const navigate = useNavigate();
  const location = useLocation();

  // state variables that manage RidesData
  const [activeRides, setActiveRides] = useState([]);
  const [pastRides, setPastRides] = useState([]);
  const [showPastRides, setShowPastRides] = useState(false);
  const [loading, setLoading] = useState(true); // loading indicator

  const [editingRideId, setEditingRideId] = useState(null);
  const [cancelRequestRideId, setCancelRequestRideId] = useState(null);
  const isMobile = useIsMobile();

  // on phones the editor can open far down the page; bring it into view
  useEffect(() => {
    if (editingRideId === null || !isMobile) return;
    document
      .querySelector('[data-testid="ride-editor"]')
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [editingRideId, isMobile]);

  const [popupMessageInfo, setPopupMessageInfo] = useState({
    status: "",
    message: "",
  });

  // fetch user's rides data from the server
  const fetchMyRidesData = async () => {
    const endpoint = "/api/myrides";
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();

      setActiveRides(
        mergeRides(
          data.upcoming_posted_rides,
          data.upcoming_requested_rides,
          false
        )
      );
      setPastRides(
        mergeRides(data.past_posted_rides, data.past_requested_rides, true)
      );
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  // pick up changes made by other users, e.g. the poster removing this rider
  useAutoRefresh(fetchMyRidesData);

  // load rides data, including when navigated to again from notifications
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchMyRidesData();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.key]);

  // called by the editor after a save or delete finishes
  const handleEditDone = async (responseData) => {
    handleShowPopupMessage(
      setPopupMessageInfo,
      responseData.success,
      responseData.message
    );
    await fetchMyRidesData();
    setEditingRideId(null);
  };

  // cancel user's ride request of rideid
  const handleCancelRideRequest = async (rideid) => {
    setCancelRequestRideId(rideid);
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
      const responseData = await response.json();
      handleShowPopupMessage(
        setPopupMessageInfo,
        responseData.success,
        responseData.message
      );
      await fetchMyRidesData();
      if (!response.ok) {
        console.error("Request failed:", response.status);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
    setCancelRequestRideId(null);
  };

  const renderKindLabel = (kind) => (
    <span
      className={`inline-block mb-2 px-2.5 py-0.5 rounded-full text-sm font-medium ${
        kind === "posted"
          ? "bg-theme_light_1 text-theme_dark_1"
          : "bg-zinc-200 text-zinc-700"
      }`}
    >
      {kind === "posted" ? "Posted" : "Requested"}
    </span>
  );

  const renderPostedRideDetails = (ride, isUpcoming) => (
    <div>
      <p>
        <span className="flex items-center justify-between">
          <span className="font-semibold">
            {isUpcoming ? "Current Riders:" : "Rode with:"}
          </span>
          {isUpcoming && ride.current_riders.length > 0 && (
            <CopyEmailButton
              copy={ride.current_riders.map((rider) => rider[2])}
              text="Copy All Rider Emails"
              className={`inline-flex text-theme_medium_2 hover:text-theme_dark_2 align-middle ${tapTargetInline}`}
            />
          )}
        </span>
      </p>
      {ride.current_riders.length > 0 ? (
        <div className="flex flex-col gap-2 mt-1">
          {ride.current_riders.map(([netid, fullName, email]) => (
            <Pill email={email} key={netid} className="max-md:py-0">
              <div className="w-full flex items-center justify-between">
                {fullName}
                {isUpcoming && (
                  <CopyEmailButton
                    copy={[email]}
                    text="Copy Email"
                    className={`text-zinc-800 hover:text-zinc-600 ${tapTargetInline}`}
                  />
                )}
              </div>
            </Pill>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">
          {isUpcoming ? "No current riders." : "None."}
        </p>
      )}
      {isUpcoming && ride.requested_riders.length > 0 && (
        <p className="mt-2 text-sm font-medium text-theme_dark_1">
          {ride.requested_riders.length} pending{" "}
          {ride.requested_riders.length === 1 ? "request" : "requests"}. Click
          Edit to respond.
        </p>
      )}
    </div>
  );

  const renderRideCard = (ride, isUpcoming) => {
    const isPosted = ride.kind === "posted";
    if (isPosted && ride.id === editingRideId) {
      return (
        <RideEditor
          key={`${ride.kind}-${ride.id}`}
          ride={ride}
          onDone={handleEditDone}
          onCancel={() => setEditingRideId(null)}
        />
      );
    }

    const canCancelRequest =
      !isPosted && isUpcoming && ride.request_status === "pending";

    return (
      <RideCard
        key={`${ride.kind}-${ride.id}`}
        buttonText={
          isUpcoming && (isPosted ? "Edit" : canCancelRequest && "Cancel Request")
        }
        buttonOnClick={
          isPosted
            ? () => editingRideId === null && setEditingRideId(ride.id)
            : canCancelRequest
            ? () => handleCancelRideRequest(ride.id)
            : () => {}
        }
        buttonClassName={
          isUpcoming && (isPosted || canCancelRequest)
            ? isPosted && editingRideId !== null
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              : "bg-theme_medium_1 text-white font-medium hover:bg-theme_dark_1"
            : "cursor-auto"
        }
        buttonLoading={ride.id === cancelRequestRideId}
        secondaryButtonText={
          !isPosted && "Status: " + capitalizeFirstLetter(ride.request_status)
        }
        secondaryButtonOnClick={() => {}}
        secondaryButtonClassName="cursor-auto"
        secondaryButtonStatus={!isPosted ? ride.request_status : ""}
      >
        <div>
          {renderKindLabel(ride.kind)}
          {renderRideCardInfo(ride, {
            showRiders: !isPosted,
            status: !isPosted ? ride.request_status : "",
          })}
          {isUpcoming && (isPosted || ride.request_status === "accepted") && (
            <a
              href={getGoogleCalendarUrl(ride)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block my-1 text-theme_medium_2 hover:text-theme_dark_2 underline ${tapTargetInline}`}
            >
              Add to Google Calendar
            </a>
          )}
          {isPosted && renderPostedRideDetails(ride, isUpcoming)}
        </div>
      </RideCard>
    );
  };

  const renderRideCards = (rides, isUpcoming) => (
    <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-md:gap-4">
      {rides.map((ride) => renderRideCard(ride, isUpcoming))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 pb-14 md:p-8 max-md:gap-4">
      {popupMessageInfo.message && (
        <PopUpMessage
          status={popupMessageInfo.status}
          message={popupMessageInfo.message}
        />
      )}
      <div className="flex gap-4 items-center">
        {/* phones use the menu to go back, so only the title shows there */}
        <IconButton
          type="back"
          onClick={() => navigate("/allrides")}
          ariaLabel="Back to All Rideshares"
          className="max-md:hidden w-9 h-9 hover:bg-theme_medium_2"
        />
        <h2 className="text-2xl font-semibold">My Rideshares</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        <h3 className="text-lg font-medium">
          Active rideshares ({activeRides.length})
        </h3>
        {activeRides.length > 0 ? (
          renderRideCards(activeRides, true)
        ) : loading ? (
          <LoadingIcon carColor="bg-theme_medium_2" />
        ) : (
          <p className="text-center">
            No active rideshares. Post or request one from All Rideshares.
          </p>
        )}
        <Button
          className={`self-start mt-4 ${bigButtonStyling1} max-md:self-stretch`}
          onClick={() => setShowPastRides(!showPastRides)}
        >
          {showPastRides
            ? "Hide past rides"
            : `Show past rides (${pastRides.length})`}
        </Button>
        {showPastRides &&
          (pastRides.length > 0 ? (
            renderRideCards(pastRides, false)
          ) : (
            <p className="text-center">No past rideshares.</p>
          ))}
      </div>
    </div>
  );
}
