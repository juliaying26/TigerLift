import React from "react";
import IconButton from "./IconButton";
import LoadingIcon from "./LoadingIcon";

export default function NotificationsModal({
  isOpen,
  isLoading,
  onClose,
  notifications,
}) {
  if (!isOpen) return null;

  // If click outside Notifications modal, automatically close it
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div>
      <div
        className="fixed inset-0 z-50 bg-zinc-800 bg-opacity-20 h-full"
        onClick={handleBackdropClick}
      ></div>
      <div className="z-50 absolute top-16 right-24 w-80 bg-white rounded-xl shadow-lg overflow-y-auto border-2 border-theme_medium_2">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
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
          ) : notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification, index) => (
                <li key={index} className="border-b pb-2 border-gray-300">
                  <p className="font-bold">{notification.subject}</p>
                  <p>{notification.message}</p>
                  <p className="text-sm text-gray-500">
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
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No notifications available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
