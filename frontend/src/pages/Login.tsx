import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import AuthBg from "../assets/auth-bg.png";
import MailIcon from "../assets/mail-icon.svg";
import LockIcon from "../assets/lock-icon.svg";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../utils";
import { FaArrowLeft } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";
// import * as jwt_decode from "jwt-decode";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
          values,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (response.data.status == "unverified") {
          localStorage.setItem("signupEmail", values.email);
          setSuccess(
            response.data.message || "Please verify an OTP sent to your email"
          );
          navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }
        setUser(response.data.user);
        const user = response.data.user;
        if (user?.token) {
          localStorage.setItem("authToken", user.token);
          localStorage.setItem("user", JSON.stringify(user));
        }
        setSuccess(response.data.message || "Login successful");
        navigate("/assistant");
      } catch (err: any) {
        setError(err.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Send token to backend
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/google-login`,
        { token: credentialResponse.credential, timezone },
        { headers: { "Content-Type": "application/json" } }
      );

      setUser(res.data.user);
      localStorage.setItem("authToken", res.data.user.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/assistant");
    } catch (error) {
      console.log("Google Login Error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was unsuccessful. Please try again.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
      {/* Left Section (same as before) */}
      <div className="relative hidden lg:block lg:col-span-7 overflow-hidden">
        <img
          src={AuthBg}
          alt="Login Background"
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
          <h1 className="text-white text-[50px] font-carien mb-[20px]">
            LOGIN!
          </h1>
          <h2 className="text-white text-[38px] font-gowun">
            Book, Plan & Stay <br /> Inspired{" "}
            <span className="text-[#D4AF37]">with AI</span>
          </h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:col-span-5 flex justify-center items-center bg-[#E5E7EB]">
        <div className="max-w-lg w-full xl:p-8 lg:p-7 md:p-6 sm:p-5 p-4">
          <div className="mb-2 lg:hidden">
            <Link
              to="/"
              className="flex items-center gap-2 font-gowun hover:text-[#D4AF37]"
            >
              <FaArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </div>
          <h2 className="text-[38px] font-carien text-[#333333]">Sign In!</h2>
          <p className="text-[16px] font-gowun text-[#333333] mb-[25px]">
            Welcome Back
          </p>

          <form onSubmit={formik.handleSubmit}>
            {/* Email */}
            <div className="mb-[10px]">
              <div className="relative">
                <img
                  src={MailIcon}
                  alt="Email"
                  className="absolute left-[20px] top-[25px] -translate-y-1/2"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className={`w-full pl-[50px] pr-[20px] py-[12px] bg-[#F8F6F2] rounded-full border mb-[10px] ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
                  } focus:outline-none focus:ring-2 focus:ring-[#C4A64E]`}
                  {...formik.getFieldProps("email")}
                />

                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm font-gowun pl-2">
                    {formik.errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="mb-[10px] relative">
              <img
                src={LockIcon}
                alt="Password"
                className="absolute left-[20px] top-[25px] -translate-y-1/2"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`w-full pl-[50px] pr-[50px] py-[12px] bg-[#F8F6F2] rounded-full border mb-[10px] ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-[#EEEEEE]"
                } focus:outline-none focus:ring-2 focus:ring-[#C4A64E]`}
                {...formik.getFieldProps("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[20px] top-[25px] -translate-y-1/2 cursor-pointer text-[#333333] hover:text-[#D4AF37]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[12px] rounded-full bg-[#D4AF37] text-black font-gowun hover:bg-white hover:text-[#D4AF37] border border-[#D4AF37] transition-colors mb-2 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="flex justify-between items-center flex-wrap gap-4 mb-[20px]">
            <p className="text-[14px] font-gowun text-[#333333]">
              New here?
              <a
                href="/sign-up"
                className="underline hover:text-[#D4AF37] ml-[5px]"
              >
                Sign Up
              </a>
            </p>
            <a
              href="/forgot-password"
              className="text-[14px] font-gowun text-[#333333] underline hover:text-[#D4AF37]"
            >
              Forgot Password
            </a>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-[#CCCCCC]" />
            <span className="mx-2 text-[#333333] font-gowun">OR</span>
            <hr className="flex-grow border-[#CCCCCC]" />
          </div>
          {/* Google Login Button */}
          <div className="google-btn-wrapper w-full py-[12px] rounded-full text-black font-gowun transition-colors mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="pill"
            />
          </div>

          {success && (
            <p className="text-green-600 text-sm text-center mb-3">{success}</p>
          )}
          {error && (
            <p className="text-red-600 text-sm text-center mb-3">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
