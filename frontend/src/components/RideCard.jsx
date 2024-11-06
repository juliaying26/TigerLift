import React from "react";
import Button from './Button';

// pass in props as children instead :D
export default function RideCard({ children, buttonText, buttonOnClick }) {
    return (
        <div id="ridecard" className="flex flex-col p-4 bg-white rounded-lg">
            <div>
                {children}
                <div className="float-right"><Button onClick={buttonOnClick}>{buttonText}</Button></div>
            </div>
        </div>
    );
};
