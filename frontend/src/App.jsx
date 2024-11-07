import { useState, useEffect } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MyRides from "./pages/MyRides";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/isloggedin")
      .then((res) => res.json())
      .then((data) => {
        if (data.is_logged_in !== false) {
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto">
      {user ? (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <div>
                <Navbar />
                <Dashboard />
              </div>
            }
          />
          <Route
            path="/myrides"
            element={
              <div>
                <Navbar />
                <MyRides netid={user.netid} />
              </div>
            }
          />
        </Routes>
      ) : (
        <div className="text-center h-screen flex items-center justify-center">
          <div className="bg-white py-20 w-1/2 rounded">
            <h1 className="text-4xl mb-4 font-serif">Welcome to TigerLift!</h1>
            <br />
            <br />
            <a
              href="/api/login"
              className="text-lg bg-theme_dark_1 text-white px-4 py-2 rounded"
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
