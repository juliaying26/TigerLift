import { useState, useEffect } from "react";

export default function MyRides() {
  const [myRidesData, setMyRidesData] = useState([]);
  const [viewType, setViewType] = useState("posted");
  const [loading, setLoading] = useState(true);

  const fetchMyRidesData = async () => {
    if (viewType === "posted") {
      try {
        const response = await fetch("/api/mypostedrides");
        const data = await response.json();
        setMyRidesData(data);
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    } else {
      try {
        const response = await fetch("/api/myrequestedrides");
        const data = await response.json();
        setMyRidesData(data);
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRidesData();
  }, [viewType]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => setViewType("posted")}>My Posted Rides</button>
      <button onClick={() => setViewType("requested")}>
        My Requested Rides
      </button>
      {myRidesData.view_type}
      {myRidesData.myrides}
      {myRidesData.myreqrides}
    </div>
  );
}
