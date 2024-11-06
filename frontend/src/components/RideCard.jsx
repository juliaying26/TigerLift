import React from "react";
import Button from './Button';

export default function RideCard({ id, my_netid, admin_netid, admin_name, admin_email, max_capacity, origin, destination, arrival_time, current_riders }) {

    // needs to be fixed
    const isCurrentRider = Array.isArray(current_riders) && (
        typeof current_riders[0] === 'string'
            ? current_riders.includes(my_netid)
            : current_riders.some(rider => rider.netid === my_netid) 
    );

    return (
        <div className="ridecard">
            <div className="bottom-container">
                <h3>Origin: {origin}</h3>
                <h3>Destination: {destination} </h3>
                <h3>Admin Name: {admin_name} </h3>
                <h3>Admin Email: {admin_email} </h3>
                <h3>Filled Capacity: {current_riders.length}/{max_capacity} </h3>
                <h3>Arrival Time: {arrival_time}</h3>
                <h3> Below this is for debugging </h3>
                <h3> {current_riders} </h3>

                {my_netid === admin_netid ? (
                <Button onClick={() => console.log('Managing ride...')} className="manage-ride-button">
                    Manage Ride
                </Button>
                // THIS IS WRONG. NEED TO FIND A WAY TO INDEX my_netid
                ) : isCurrentRider ? (
                    <Button onClick={() => console.log('Leaving ride...')} className="leave-ride-button">
                        Leave Ride
                    </Button>
                ) : (
                    <Button onClick={() => console.log('Cancelling ride request...')} className="cancel-ride-button">
                        Cancel Ride Request
                    </Button>
                )}

                <h3>For debugging-Is My Ride: {my_netid === admin_netid ? "Yes" : "No"}</h3>
            </div>
            <br/>
        </div>
    );
};
