import IconButton from "./IconButton";
import LoadingIcon from "./LoadingIcon";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import useIsMobile from "../utils/useIsMobile";
import useLockBodyScroll from "../utils/useLockBodyScroll";

export default function NotificationsModal({
  isOpen,
  isLoading,
  onClose,
  new_notifs,
  past_notifs,
  handleReadNotif,
  markAllRead,
  clearAll,
}) {
  const navigate = useNavigate();

  const isMobile = useIsMobile();
  // full-screen sheet on phones, so stop the page behind it scrolling
  useLockBodyScroll(isOpen && isMobile);

  if (!isOpen) return null;

  // If click outside Notifications modal, automatically close it
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // "ride_request" covers everything sent to a poster about their own ride
  // (new and canceled requests); it links to My Posted Rides.
  const getNotifType = (notif) => {
    if (notif.subject.includes("accepted")) {
      return "ride_accept";
    } else if (
      notif.subject.includes("requested to join") ||
      notif.subject.includes("canceled their request")
    ) {
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
          <div key={index}>
            <div
              className={`${
                !isNew && "opacity-50"
              } border-zinc-300 cursor-pointer hover:bg-zinc-200 rounded-lg p-2 max-md:p-3`}
            >
              <li
                onClick={() =>
                  handleReadNotif(notification, getNotifType(notification))
                }
              >
                <div className="flex flex-col gap-2">
                  <p className="font-semibold">{notification.subject}</p>
                  <p>{notification.message}</p>
                  <Button
                    className="text-theme_medium_2 hover:text-theme_dark_2 !text-sm max-md:self-start max-md:-ml-3"
                    onClick={() => navigate("/myrides")}
                  >
                    Go to My Rideshares
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
      {/* popover under the bell on desktop; full-screen sheet on phones */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className="z-[25] bg-white rounded-xl shadow-lg border-2 border-theme_medium_2 md:absolute md:w-[360px] md:top-16 md:right-24 md:h-[480px] md:flex md:flex-col max-md:fixed max-md:inset-0 max-md:z-30 max-md:flex max-md:flex-col max-md:rounded-none max-md:border-0"
      >
        {/* phones: row 1 is the title and close button, row 2 the two actions */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 max-md:flex-wrap max-md:gap-y-1 max-md:pb-2 max-md:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <h2 className="text-lg font-semibold flex gap-4 md:gap-3 items-center max-md:contents">
            <span className="max-md:order-1 max-md:flex-1 max-md:text-xl">
              Notifications
            </span>
            <span className="flex gap-4 md:gap-2 items-center max-md:order-3 max-md:w-full max-md:gap-2 max-md:-ml-3 max-md:font-medium">
              <Button
                onClick={markAllRead}
                className="text-theme_medium_2 hover:text-theme_dark_2 text-sm py-0 px-0 mt-0.5 md:whitespace-nowrap md:!px-1.5 max-md:px-3 max-md:mt-0"
              >
                Mark All As Read
              </Button>
              <Button
                onClick={clearAll}
                className="text-theme_medium_2 hover:text-theme_dark_2 text-sm py-0 px-0 mt-0.5 md:whitespace-nowrap md:!px-1.5 max-md:px-3 max-md:mt-0"
              >
                Clear
              </Button>
            </span>
          </h2>
          <IconButton
            type="xmark"
            onClick={onClose}
            ariaLabel="Close notifications"
            className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 max-md:order-2"
          ></IconButton>
        </div>
        <div className="p-4 overflow-y-auto w-full md:flex-1 md:min-h-0 overscroll-contain max-md:flex-1 max-md:min-h-0 max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
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
