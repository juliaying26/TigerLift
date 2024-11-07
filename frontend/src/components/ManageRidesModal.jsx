import React from "react";
import IconButton from '../components/IconButton';
import Button from '../components/Button';

export default function ManageRidesModal({
  isOpen,
  onClose,
  rideDetails,
  onDeleteRide,
  onSave }) {
  if (!isOpen) return null; // means modal not open

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        
        <IconButton type='close' onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"></IconButton>

        <h2 className="text-2xl font-semibold mb-4">Manage this Ride</h2>

        <p><strong>Origin:</strong> {rideDetails.origin}</p>
        <p><strong>Destination:</strong> {rideDetails.destination}</p>
        <p><strong>Arrival Time:</strong> {rideDetails.arrival_time}</p>
        <p><strong>Admin Name:</strong> {rideDetails.admin_name}</p>
        <p><strong>Admin Email:</strong> {rideDetails.admin_email}</p>
        <p><strong>Capacity:</strong> {rideDetails.current_riders.length}/{rideDetails.max_capacity}</p>

        <div className="flex justify-between mt-6">
          <Button onClick={onDeleteRide} className="hover:bg-red-600" >
            Delete this Ride
          </Button>
          <Button onClick={onSave} className="hover:bg-green-600">
            Save
          </Button>
        </div>

      </div>
    </div>
  );
}
