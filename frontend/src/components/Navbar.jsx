import React, { useState } from "react";
import { Link } from "react-router-dom"; // Use react-router for navigation if needed
import "./Navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/">TigerLift</Link> <br />
        </li>

        <li>
          <Link to="/">My Profile</Link> <br />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
