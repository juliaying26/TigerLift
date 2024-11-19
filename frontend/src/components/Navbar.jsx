import React, { useState, useRef } from "react";
import ProfilePopup from "../components/ProfilePopUp.jsx";

export default function Navbar() {
  const [profileClicked, setProfileClicked] = useState(false);

  const handleProfileClick = async () => {
    setProfileClicked(!profileClicked);
  };

  return (
    <nav className="bg-theme_medium_1">
      <div className="w-full">
        <div className="relative flex h-16 items-center justify-between px-8">
          {/* Left Side - Dashboard and Logo */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center"></div>
            <div className="flex space-x-4">
              <a
                href="/"
                className="rounded-md theme_medium_1 text-3xl font-medium text-black"
                aria-current="page"
              >
                TigerLift
              </a>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Profile Button */}
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="My Profile"
              onClick={handleProfileClick}
            >
              <svg
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                4
                <path
                  fillRule="evenodd"
                  d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {profileClicked && (
              <div>
                <ProfilePopup
                  isOpen={profileClicked}
                  onClose={handleProfileClick}
                ></ProfilePopup>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
