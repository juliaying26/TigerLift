import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 mx-auto max-w-md text-center px-4">
      <h1 className="text-4xl font-bold text-theme_dark_2 mb-4">Error 404</h1>
      <p className="text-lg text-gray-700 mb-4">
        Oops! The page you're looking for does not exist.
      </p>
      <Link
        to="/"
        className="text-theme_dark_1 underline hover:text-theme_medium_1 max-md:inline-flex max-md:items-center max-md:min-h-11"
      >
        Go back to the homepage
      </Link>
    </div>
  );
};

export default NotFound;
