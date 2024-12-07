import React from "react";
import IconButton from "./IconButton";
import LoadingIcon from "./LoadingIcon";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function NotificationsModal({
  isOpen,
  isLoading,
  onClose,
  new_notifs,
  past_notifs,
  handleReadNotif,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // If click outside Notifications modal, automatically close it
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  console.log(new_notifs);

  const getNotifType = (notif) => {
    if (notif.subject.includes("accepted")) {
      return "ride_accept";
    } else if (notif.subject.includes("requested to join")) {
      return "ride_request";
    } else if (notif.subject.includes("canceled")) {
      return "ride_cancellation";
    } else if (notif.subject.includes("changed arrival time")) {
      return "ride_timechange";
    }
  };

  const renderNotifs = (notifs, isNew) => {
    return notifs.length > 0 ? (
      <ul className="">
        <p className="text-md font-medium pb-2">
          {isNew ? "New notifications" : "Past notifications"}
        </p>
        <hr className="mb-2" />
        {notifs.map((notification, index) => (
          <div>
            <div
              className={`${
                !isNew && "opacity-50"
              } border-zinc-300 cursor-pointer hover:bg-zinc-200 rounded-lg p-2`}
            >
              <li
                key={index}
                onClick={() =>
                  handleReadNotif(notification, getNotifType(notification))
                }
              >
                <div className="flex flex-col gap-2">
                  <p className="font-bold">{notification.subject}</p>
                  <p>{notification.message}</p>
                  <Button
                    className="text-theme_medium_2 hover:text-theme_dark_2 !text-sm"
                    onClick={
                      getNotifType(notification) === "ride_request"
                        ? () =>
                            navigate("/myrides", {
                              state: { viewType: "posted" },
                            })
                        : () =>
                            navigate("/myrides", {
                              state: { viewType: "requested" },
                            })
                    }
                  >
                    {getNotifType(notification) === "ride_request"
                      ? "Go to My Posted Rides"
                      : "Go to My Requested Rides"}
                  </Button>
                  <p className="text-sm text-zinc-500">
                    {new Date(notification.notification_time).toLocaleString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      }
                    )}
                  </p>
                </div>
              </li>
            </div>
            <hr className="my-2" />
          </div>
        ))}
      </ul>
    ) : (
      <p className="text-zinc-500 pb-2">No new notifications available.</p>
    );
  };

  return (
    <div>
      <div
        className="fixed inset-0 z-20 bg-zinc-800 bg-opacity-20 h-full"
        onClick={handleBackdropClick}
      ></div>
      <div className="z-[25] absolute top-16 right-24 w-80 bg-white rounded-xl shadow-lg overflow-y-auto border-2 border-theme_medium_2 max-h-[480px]">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200">
          <h2 className="text-lg font-bold">Notifications</h2>
          <IconButton
            type="xmark"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
          ></IconButton>
        </div>
        <div className="p-4">
          {isLoading ? (
            <LoadingIcon carColor="bg-theme_medium_2" />
          ) : (
            <div>
              {renderNotifs(new_notifs, true)}
              {past_notifs.length > 0 && renderNotifs(past_notifs, false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
