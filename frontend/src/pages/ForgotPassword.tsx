import React, { useState } from "react";
import AuthBg from "../assets/auth-bg.png";
import MailIcon from "../assets/mail-icon.svg";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        toast.dismiss();
        setLoading(true);
        setMessage("");

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`,
          { email: values.email }
        );

        setMessage("Reset link sent to your email address.");
        toast.success("Reset link sent successfully!");
        formik.resetForm();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to reset password"
        );
        setMessage(error.response?.data?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
      {/* Left side */}
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

      {/* Right side form */}
      <div className="w-full lg:col-span-5 flex justify-center items-center bg-[#E5E7EB]">
        <div className="max-w-lg w-full xl:p-8 lg:p-7 md:p-6 sm:p-5 p-4">
          <h2 className="xl:text-[48px] lg:text-[38px] md:text-[35px] text-[30px] font-normal font-carien text-[#333333]">
            Forgot Password?
          </h2>
          <p className="xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] text-[14px] font-normal font-gowun text-[#333333] mb-[20px]">
            Please Enter Your Registered Email Address.
          </p>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-[20px] relative">
              <img
                src={MailIcon}
                alt="Email Icon"
                className="absolute left-[20px] top-[25px] -translate-y-1/2"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="w-full pl-[50px] pr-[20px] py-[12px] bg-[#F8F6F2] rounded-full border border-[#EEEEEE] placeholder:text-[#333333] font-gowun focus:outline-none focus:ring-2 focus:ring-[#C4A64E]"
              />

              {formik.errors.email && formik.touched.email && (
                <p className="text-red-500 text-sm mt-2 pl-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="mb-[20px]">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-[12px] w-full flex justify-center items-center rounded-full border border-[#D4AF37] bg-[#D4AF37] text-black transition-colors text-[16px] font-gowun hover:bg-white hover:text-[#D4AF37] ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {loading ? "Sending..." : "Request Reset Link"}
              </button>
            </div>
          </form>

          {message && (
            <p className="text-center text-green-700 font-gowun text-sm mt-2">
              {message}
            </p>
          )}

          <div className="lg:text-end text-center mt-2">
            <a
              href="/login"
              className="text-[16px] font-gowun text-[#333333] underline hover:text-[#D4AF37]"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
