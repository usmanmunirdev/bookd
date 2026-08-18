import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthBg from "../assets/auth-bg.png";
import { FaArrowLeft } from "react-icons/fa6";
import axios from "axios";
import { useAuth } from "../../utils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const emailFromQuery =
    query.get("email") || localStorage.getItem("signupEmail");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { setUser } = useAuth();

  useEffect(() => {
    if (!emailFromQuery) navigate("/signup");

    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      localStorage.removeItem("signupEmail");
      //   (async () => {
      //     try {
      //       await axios.post(`${BASE_URL}/auth/delete-user`, {
      //         email: emailFromQuery,
      //       });
      //       localStorage.removeItem("signupEmail");
      //     } catch (error) {
      //       console.error("Cleanup delete-user failed:", error);
      //     }
      //   })();
    };
  }, [navigate, emailFromQuery]);

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        email: emailFromQuery,
        otp,
      });

      const user = response.data.user;
      if (user?.token) {
        setUser(response.data.user);
        localStorage.setItem("authToken", user.token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      localStorage.removeItem("signupEmail");
      navigate("/assistant");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setTimer(60);
      await axios.post(`${BASE_URL}/auth/resend-otp`, {
        email: emailFromQuery,
      });
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
      {/* Left Side Image */}
      <div className="relative hidden lg:block lg:col-span-7 overflow-hidden">
        <img
          src={AuthBg}
          alt="Verify Email Background"
          className="w-full h-full object-cover absolute inset-0 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-[rgba(0,0,0,0.85)] z-10"></div>
        <div className="absolute inset-0 shadow-[inset_0px_0px_80px_rgba(0,0,0,0.8)] z-20"></div>

        <div className="absolute top-[50px] left-0 w-full flex justify-start px-10 z-40">
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-[#D4AF37] transition-colors font-gowun"
          >
            <FaArrowLeft size={16} />
            <span>Back to home page</span>
          </Link>
        </div>

        <div className="absolute inset-0 z-30 flex flex-col justify-center items-center text-center px-10">
          <h1 className="text-white xl:text-[56px] lg:text-[50px] md:text-[45px] text-[36px] font-carien mb-4">
            Verify Your Email
          </h1>
          <p className="text-white xl:text-[22px] lg:text-[20px] text-[16px] font-gowun">
            One last step before your
            <span className="text-[#D4AF37]"> AI journey </span> begins ✨
          </p>
        </div>
      </div>

      {/* Right Side OTP Card */}
      {/* Right Side Form */}
      <div className="w-full lg:col-span-5 flex justify-center items-center bg-[#E5E7EB]">
        <div className="max-w-lg w-full xl:p-8 lg:p-7 md:p-6 sm:p-5 p-4">
          {/* Mobile Back */}
          <div className="mb-2 lg:hidden">
            <Link
              to="/signup"
              className="flex items-center gap-2 font-gowun hover:text-[#D4AF37]"
            >
              <FaArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </div>

          <h2
            className="xl:text-[48px] lg:text-[38px] md:text-[35px] text-[30px] 
      font-normal font-carien text-[#333333]"
          >
            Verify Email
          </h2>

          <p
            className="xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] 
      text-[14px] font-normal font-gowun text-[#333333] mb-[20px]"
          >
            Enter the 6-digit code sent to
            <span className="block font-semibold mt-1">{emailFromQuery}</span>
          </p>

          {/* OTP Input */}
          <div className="mb-[10px]">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="******"
                className="w-full px-[20px] py-[12px] bg-[#F8F6F2]
    rounded-full border border-[#EEEEEE]
    placeholder:text-[#9CA3AF]   /* 👈 light placeholder */
    font-gowun text-[#333333]
    focus:outline-none focus:ring-2 focus:ring-[#C4A64E]
    text-center tracking-[8px]"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-gowun pl-2 mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className={`px-6 py-[12px] w-full flex justify-center rounded-full border 
        text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] 
        font-normal font-gowun transition-colors
        ${
          loading || otp.length !== 6
            ? "bg-gray-300 border-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#D4AF37] border-[#D4AF37] text-black hover:bg-white hover:text-[#D4AF37]"
        }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          {/* Footer */}
          <div className="flex justify-between items-center mt-3">
            <Link
              to="/sign-up"
              className="text-[14px] font-gowun underline hover:text-[#D4AF37]"
            >
              Back to Sign Up
            </Link>

            {timer > 0 ? (
              <span className="text-[14px] font-gowun text-[#333333]">
                Resend in {timer}s
              </span>
            ) : (
              <button
                onClick={resendOtp}
                className="text-[14px] font-gowun underline hover:text-[#D4AF37]"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
