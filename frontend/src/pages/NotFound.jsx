import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 mx-auto max-w-md text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Error 404</h1>
      <p className="text-lg text-gray-700 mb-6">
        Oops! The page you're looking for does not exist.
      </p>
      <Link
        to="/"
        className="text-blue-600 underline hover:text-blue-800"
      >
        Go back to the homepage
      </Link>
    </div>
  );
};

export default NotFound;
