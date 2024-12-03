import { useState, useEffect } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MyRides from "./pages/MyRides";
import Navbar from "./components/Navbar";
import Button from "./components/Button";
import LoadingIcon from "./components/LoadingIcon";
import NotificationsPage from "../src/pages/NotificationsPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/isloggedin`)
      .then((res) => res.json())
      .then((data) => {
        if (data.is_logged_in !== false) {
          console.log(data);
          setUser(data.user_info);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingIcon carColor="bg-theme_medium_2" />;
  }

  return (
    <div className="flex flex-col">
      {user ? (
        <div>
          <Navbar user_info={user} />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/myrides" element={<MyRides />} />
            <Route path="/notifications" element={<NotificationsPage />} />;
          </Routes>
        </div>
      ) : (
        <div className="text-center h-screen flex items-center justify-center">
          <div className="bg-white py-20 w-1/2 rounded">
            <h1 className="text-4xl mb-4 font-serif">Welcome to TigerLift!</h1>
            <br />
            <br />
            {/* <Button
              onClick={handleLogin}
              className="text-lg bg-theme_dark_1 text-white px-4 py-2 rounded hover:text-theme_medium_1"
            >
              Login with CAS
            </Button> */}
            <a
              href="/api/login"
              className="text-lg bg-theme_dark_1 text-white px-4 py-2 rounded hover:bg-theme_medium_1 hover:text-white"
            >
              Login with CAS
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
