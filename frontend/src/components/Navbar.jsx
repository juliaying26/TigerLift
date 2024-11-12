// src/components/Navbar.js

import React, { useState, useRef } from "react";
import Select from 'react-select'
import { Link } from "react-router-dom";

export default function Navbar() {

    return (
        <nav className="bg-theme_medium_1 shadow-md">
            <div className="mx-auto w-full">
                <div className="relative flex h-20 items-center justify-between">
              
              {/* Left Side - Dashboard and Logo */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center"></div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <a
                      href="/"
                      className="rounded-md theme_medium_1 text-4xl font-medium text-black"
                      aria-current="page"
                    >
                      TigerLift
                    </a>
                  </div>
                </div>
              </div>
      
              {/* Right Side */}
              <div className="flex items-center pr-2 space-x-4">
                {/* Profile Button */}
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  aria-label="My Profile"
                >
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      );
      
}