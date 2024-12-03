import React from "react";

export default function NotificationsModal({ isOpen, onClose, notifications }){
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-start p-6">
      <div className="bg-white w-80 max-h-full rounded-lg shadow-lg overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Notifications</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4">
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li 
                key =""
                  className="border-b pb-2 border-gray-300"
                >
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
};
