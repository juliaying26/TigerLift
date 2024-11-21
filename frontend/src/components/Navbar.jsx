import React, { useState, useRef } from "react";

export default function Navbar({ user_info }) {
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
          <div className="flex items-center gap-4">
            <p className="font-medium text-lg">{user_info.displayname}</p>
            <a
              href="/api/logout"
              className="bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1 self-end"
            >
              Log out
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
