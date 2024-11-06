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
    <div className="container mx-auto p-4">
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
        <div className="text-center">
          <h1 className="text-2xl mb-4">Welcome to TigerLift</h1>

          <a
            href="/api/login"
            className="bg-theme_dark_2 text-white px-4 py-2 rounded"
          >
            Login with CAS
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
