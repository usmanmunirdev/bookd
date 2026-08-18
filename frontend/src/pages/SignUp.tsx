import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import AuthBg from "../assets/auth-bg.png";
import MailIcon from "../assets/mail-icon.svg";
import LockIcon from "../assets/lock-icon.svg";
import AuthUserIcon from "../assets/auth-user-icon.svg";
// import PhoneIcon from "../assets/phone-icon.svg"; // ✅ optional: if you have a phone icon
import { useAuth } from "../../utils";
import { FaArrowLeft } from "react-icons/fa6";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      profileImage: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "First name must contain only letters")
        .min(2, "First name must be at least 2 characters")
        .max(35, "First name must be at most 35 characters")
        .required("First name is required"),
      lastName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "Last name must contain only letters")
        .min(2, "Last name must be at least 2 characters")
        .max(35, "Last name must be at most 35 characters")
        .required("Last name is required"),
      phone: Yup.string().required("Phone number is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (signupData) => {
      setLoading(true);
      let fullName = `${signupData.firstName} ${signupData.lastName}`;
      try {
        const formData = new FormData();
        formData.append("firstName", signupData.firstName);
        formData.append("lastName", signupData.lastName);
        formData.append("fullName", fullName);
        formData.append("phone", signupData.phone);
        formData.append("email", signupData.email);
        formData.append("password", signupData.password);
        formData.append("timezone", signupData.timezone);
        if (signupData.profileImage) {
          formData.append("profileImage", signupData.profileImage);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        // setUser(response.data.user);
        // const user = response.data.user;
        // if (user?.token) {
        //   localStorage.setItem("authToken", user.token);
        //   localStorage.setItem("user", JSON.stringify(user));
        // }
        // setSuccess(response.data.message || "Account created successfully");
        // navigate("/assistant");

        localStorage.setItem("signupEmail", signupData.email);
        setSuccess(response.data.message || "OTP sent to your email");
        navigate(`/verify-email?email=${encodeURIComponent(signupData.email)}`);
      } catch (error: any) {
        console.error(error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "An error occurred. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
      {/* Left Side Image */}
      <div className="relative hidden lg:block lg:col-span-7 overflow-hidden">
        <img
          src={AuthBg}
          alt="Sign Up Background"
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
          <h1 className="text-white xl:text-[56px] lg:text-[50px] md:text-[45px] sm:text-[40px] text-[35px] font-normal font-carien mb-[20px]">
            Sign Up!
          </h1>
          <h2 className="text-white xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-gowun">
            Your <span className="text-[#D4AF37]">AI-Powered </span>
          </h2>
          <h3 className="text-white xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-gowun">
            Travel Companion awaits.
          </h3>
        </div>
      </div>

      {/* Right Side Form */}
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
          <h2 className="xl:text-[48px] lg:text-[38px] md:text-[35px] text-[30px] font-normal font-carien text-[#333333]">
            Sign Up!
          </h2>
          <p className="xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] text-[14px] font-normal font-gowun text-[#333333] mb-[20px]">
            Welcome to your journey
          </p>

          <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
            {/* First Name */}
            <div className="mb-[10px]">
              <div className="relative">
                <img
                  src={AuthUserIcon}
                  alt="Full Name"
                  className="absolute left-[20px] top-[25px] -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="First Name"
                  className={`w-full pl-[50px] pr-[20px] py-[10px] bg-[#F8F6F2] rounded-full border ${
                    formik.touched.firstName && formik.errors.firstName
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
                  } placeholder:text-[#333333] font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E] mb-[10px]`}
                  {...formik.getFieldProps("firstName")}
                />
              </div>
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="mb-[10px]">
              <div className="relative">
                <img
                  src={AuthUserIcon}
                  alt="Last Name"
                  className="absolute left-[20px] top-[25px] -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className={`w-full pl-[50px] pr-[20px] py-[10px] bg-[#F8F6F2] rounded-full border ${
                    formik.touched.lastName && formik.errors.lastName
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
                  } placeholder:text-[#333333] font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E] mb-[10px]`}
                  {...formik.getFieldProps("lastName")}
                />
              </div>
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.lastName}
                </p>
              )}
            </div>

            {/* Phone */}
            {/* <div className="mb-[10px]">
              <div className="relative">
                <img
                  src={AuthUserIcon}
                  alt="Preferred Name"
                  className="absolute left-[20px] top-[25px] -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className={`w-full pl-[50px] pr-[20px] py-[10px] bg-[#F8F6F2] rounded-full border ${
                    formik.touched.phone && formik.errors.phone
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
                  } placeholder:text-[#333333] font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E] mb-[10px]`}
                  {...formik.getFieldProps("phone")}
                />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.phone}
                </p>
              )}
            </div> */}
            <div className="mb-[10px]">
              <PhoneInput
                country={"us"} // default country
                value={formik.values.phone}
                onChange={(phone) => formik.setFieldValue("phone", phone)}
                inputStyle={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "9999px",
                  background: "#F8F6F2",
                  border: "1px solid #EEEEEE",
                  paddingLeft: "48px",
                  fontFamily: "Gowun Batang",
                }}
                buttonStyle={{
                  borderRadius: "9999px 0 0 9999px",
                  border: "1px solid #EEEEEE",
                }}
              />

              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.phone}
                </p>
              )}
            </div>

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
                  className={`w-full pl-[50px] pr-[20px] py-[10px] bg-[#F8F6F2] rounded-full border ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
                  } placeholder:text-[#333333] font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E] mb-[10px]`}
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-[10px]">
              <div className="relative">
                <img
                  src={LockIcon}
                  alt="Password"
                  className="absolute left-[20px] top-[25px] -translate-y-1/2"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`w-full pl-[50px] pr-[50px] py-[10px] bg-[#F8F6F2] rounded-full border mb-[10px] ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : "border-[#EEEEEE]"
                  } placeholder:text-[#333333] font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E]`}
                  {...formik.getFieldProps("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[20px] top-[25px] -translate-y-1/2 cursor-pointer text-[#333333] hover:text-[#D4AF37]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm font-gowun pl-2">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Profile Image */}
            {/* Profile Image */}
            <div className="mb-[20px]">
              <label className="block text-[#333333] font-gowun mb-2">
                Upload Profile Image
              </label>
              <div className="flex items-center gap-4">
                {/* Image Preview */}
                {formik.values.profileImage && (
                  <img
                    src={URL.createObjectURL(formik.values.profileImage)}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover border border-[#C4A64E]"
                  />
                )}

                {/* Upload Button */}
                <label
                  htmlFor="profileImage"
                  className="cursor-pointer px-4 py-2 bg-[#D4AF37] text-black rounded-full font-gowun hover:bg-white hover:text-[#D4AF37] border border-[#D4AF37] transition-colors"
                >
                  Choose Image
                </label>

                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      formik.setFieldValue("profileImage", file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-[12px] w-full flex justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun hover:bg-white hover:text-[#D4AF37]"
            >
              {loading ? "Sign Up..." : "Sign Up"}
            </button>
            {error && (
              <p className="text-red-600 text-sm text-center mb-3">{error}</p>
            )}
          </form>

          {success && (
            <p className="text-green-600 text-center mt-3 font-gowun">
              {success}
            </p>
          )}

          <div className="sm:flex justify-between items-center flex-wrap gap-4 mt-2 mb-4">
            <p className="text-[16px] font-gowun text-[#333333]">
              Already have an account?
              <a
                href="/login"
                className="underline hover:text-[#D4AF37] ml-[5px]"
              >
                Login
              </a>
            </p>
          </div>
          {/* <div className="block lg:hidden">
            <div className="flex flex-col justify-end items-center text-center px-10 text-black">
              <a
                href="/"
                className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun text-black"
              >
                <FaArrowLeft size={16} />
                <span>Back to home page</span>
              </a>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
