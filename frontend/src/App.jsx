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
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center gap-8 overflow-y-auto py-10">
            <div className="flex flex-col lg:absolute lg:top-1/2 left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-white w-4/5 max-h-fit lg:h-auto lg:w-1/2 rounded-lg px-4 py-8 lg:px-12 lg:py-16">
              <h1 className="text-4xl mb-6 font-serif">
                Welcome to TigerLift!
              </h1>
              <p className="text-lg mb-4 font-serif max-w-lg mx-auto">
                Tired of shelling out money on Lyft? Don't want to spam the
                ListServs to find other students going to the same place?
              </p>
              <p className="text-lg mb-6 font-serif max-w-lg mx-auto">
                Say goodbye to NJ Transit delays and expensive Ubers. TigerLift
                helps Princeton students connect with each other so they can
                split costs on rideshares!
              </p>
              <a
                href="/api/login"
                className="text-lg bg-theme_medium_2 text-white px-4 py-2 rounded hover:bg-theme_dark_2 hover:text-white self-center"
              >
                Login with CAS
              </a>
            </div>
            <p className="lg:fixed bottom-4 text-center text-sm text-zinc-500 lg:pt-10 mx-8">
              Created by Julia Ying, Grace Kim, Ritika Bhatnagar, Aasha Jain
            </p>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
