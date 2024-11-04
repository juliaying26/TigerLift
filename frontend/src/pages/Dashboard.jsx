import { useState, useEffect } from "react";
// import RidesTable from "./RidesTable";
// import AddRideForm from "./AddRideForm";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    user_info: null,
    rides: [],
    locations: [],
    ridereqs: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">
          Welcome, {dashboardData.user_info?.displayname}
        </h1>
      </div>
      <a
        href="/logout"
        className="bg-theme_dark_1 text-white px-4 py-2 rounded"
      >
        Log out
      </a>
      <br />
      <br />
      <a href="/myrides">My Rides</a>

      {/* <AddRideForm
        locations={dashboardData.locations}
        onSubmit={fetchDashboardData}
      />
      <RidesTable
        rides={dashboardData.rides}
        ridereqs={dashboardData.ridereqs}
        userId={dashboardData.user_info?.netid}
        onAction={fetchDashboardData}
      /> */}
    </div>
  );
}
