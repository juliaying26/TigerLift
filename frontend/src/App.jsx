import { useState, useEffect } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AllRides from "./pages/AllRides";
import MyRides from "./pages/MyRides";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import tailwindConfig from "../tailwind.config.js";
import LoadingIcon from "./components/LoadingIcon";

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
    <ConfigProvider
      theme={{
        components: {
          DatePicker: {
            hoverBorderColor: tailwindConfig.theme.extend.colors.theme_medium_1,
            activeBorderColor:
              tailwindConfig.theme.extend.colors.theme_medium_1,
            activeShadow: "none",
            cellRangeBorderColor:
              tailwindConfig.theme.extend.colors.theme_medium_1,
          },
          Input: {
            hoverBorderColor: tailwindConfig.theme.extend.colors.theme_medium_1,
            activeBorderColor:
              tailwindConfig.theme.extend.colors.theme_medium_1,
            activeShadow: "none",
          },
        },
      }}
    >
      <div className="flex flex-col h-full">
        {user ? (
          <div className="h-full">
            <Navbar user_info={user} />
            <Routes>
              <Route path="/" element={<Navigate to="/allrides" replace />} />
              <Route path="/allrides" element={<AllRides />} />
              <Route path="/myrides" element={<MyRides />} />
              <Route path="/*" element={<NotFound />}/>
            </Routes>
          </div>
        ) : (
          <div className="text-center h-screen flex items-center justify-center">
            <div className="bg-white py-20 w-1/2 rounded">
              <h1 className="text-4xl mb-4 font-serif">
                Welcome to TigerLift!
              </h1>
              <br />
              <br />
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
    </ConfigProvider>
  );
}

export default App;
