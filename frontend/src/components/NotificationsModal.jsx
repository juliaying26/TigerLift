import React from "react";
import IconButton from "./IconButton";

export default function NotificationsModal({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  // If click outside Notifications modal, automatically close it
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-800 bg-opacity-20"
      onClick={handleBackdropClick}
    >
      <div className="absolute top-16 right-24 w-80 bg-white rounded-xl shadow-lg overflow-y-auto border-2 border-theme_medium_2">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Notifications</h2>
          <IconButton
            type="xmark"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
          ></IconButton>
        </div>
        <div className="p-4">
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key="" className="border-b pb-2 border-gray-300">
                  <p className="font-bold">{notification.subject}</p>
                  <p>{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.notification_time).toLocaleString()}
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
