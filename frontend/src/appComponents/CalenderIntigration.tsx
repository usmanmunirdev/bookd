import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const CalenderIntigration = () => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    checkConnection();
  }, [token]);

  const checkConnection = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/google/is-connected`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGoogleConnected(res.data.connected);
    } catch (error) {
      console.error("Error checking Google connection:", error);
    }
  };

  const handleGoogleConnect = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/google/auth`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Error connecting Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/google/disconnect`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGoogleConnected(false);
      toast.success("Google Calendar disconnected successfully!");
    } catch (error: any) {
      console.error("Error disconnecting Google:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to disconnect Google Calendar. Please try again."
      );
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <motion.div
      key="calendar-integration"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <div>
        <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px]">
          Never miss a booking. Automatically sync confirmed plans to your
          calendar.
        </p>
        <h2 className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px]">
          Connect your calendar
        </h2>
        <div className="flex flex-col gap-3 mt-5">
          {!googleConnected ? (
            <button
              onClick={handleGoogleConnect}
              disabled={loading}
              className="p-5 w-full sm:max-w-[280px] cursor-pointer rounded-[50px] border border-[#2E2D2D] text-white h-[45px] flex items-center gap-3 group hover:bg-[#D4AF37] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-[#D4AF37] text-[18px] group-hover:text-black transition" />
              <span className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun group-hover:text-black transition">
                {loading ? "Connecting..." : "One-click Connect Google"}
              </span>
            </button>
          ) : (
            <button
              onClick={handleGoogleDisconnect}
              disabled={disconnecting}
              className="p-5 w-full sm:max-w-[280px] cursor-pointer rounded-[50px] border border-red-500 text-white h-[45px] flex items-center gap-3 group hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-red-400 text-[18px] group-hover:text-white transition" />
              <span className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun group-hover:text-white transition">
                {disconnecting ? "Disconnecting..." : "Disconnect Google"}
              </span>
            </button>
          )}
        </div>
        <div className="mt-8 flex items-center gap-4 flex-wrap mb-[20px]">
          <span
            className={`px-3 py-1 rounded-full text-[12px] ${
              googleConnected
                ? "bg-green-600/20 text-green-400"
                : "bg-gray-600/30 text-gray-300"
            }`}
          >
            Google {googleConnected ? "Connected" : "Not Connected"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CalenderIntigration;
