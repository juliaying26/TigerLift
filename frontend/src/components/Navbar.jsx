import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconButton from "./IconButton";

export default function Navbar({ user_info }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const navigateTo = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 h-full bg-white w-full z-30 flex flex-col justify-between p-8">
          <div className="flex flex-col gap-6 w-full">
            <div className="relative w-full items-center">
              <h2 className="text-center text-xl font-medium">Menu</h2>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <IconButton
                  type="xmark"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:bg-zinc-100"
                />
              </div>
            </div>
            <hr className="py-1" />
            <div className="flex flex-col gap-5">
              <button
                onClick={() => navigateTo("/dashboard")}
                className={`${
                  isActive("/dashboard") ? "bg-theme_light_1 font-medium" : ""
                } text-lg rounded-md py-3 hover:bg-theme_light_1`}
              >
                All Rides
              </button>
              <button
                onClick={() => navigateTo("/myrides")}
                className={`${
                  isActive("/myrides") ? "bg-theme_light_1 font-medium" : ""
                } text-lg rounded-md py-3 hover:bg-theme_light_1`}
              >
                My Rides
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-medium text-lg text-center">
              {user_info.displayname}
            </p>
            <a
              href="/api/logout"
              className="bg-theme_dark_1 text-white px-4 py-2 rounded-md text-center hover:bg-theme_light_1"
            >
              Log out
            </a>
          </div>
        </div>
      )}
      <nav className="bg-theme_medium_1">
        <div className="w-full">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            {/* Left Side - Dashboard and Logo */}
            <div className="md:hidden">
              <IconButton
                type="hamburger"
                onClick={() => setIsMobileMenuOpen(true)}
                className="hover:bg-theme_light_1"
              />
            </div>
            <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
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
            <div className="hidden md:flex items-center gap-4">
              <p className="font-medium text-lg">{user_info.displayname}</p>
              <a
                href="/api/logout"
                className="bg-theme_dark_1 text-white px-4 py-2 rounded-md self-end hover:bg-theme_light_1"
              >
                Log out
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
