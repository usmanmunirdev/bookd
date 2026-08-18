import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // or 'next/router' if using Next.js
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthBg from "../assets/auth-bg.png";
import LockIcon from "../assets/lock-icon.svg";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is Required"),
  });

  const onSubmit = async (values: typeof initialValues) => {
    if (!token) return toast.error("Invalid or missing token");

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`,
        {
          token,
          newPassword: values.password,
        },
      );
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
      {/* Left-side background */}
      <div className="relative hidden lg:block lg:col-span-7 overflow-hidden">
        <img
          src={AuthBg}
          alt="Login Background"
          className="w-full h-full object-cover absolute inset-0 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-[rgba(0,0,0,0.85)] z-10"></div>
        <div className="absolute inset-0 shadow-[inset_0px_0px_80px_rgba(0,0,0,0.8)] z-20"></div>
        <div className="absolute inset-0 z-30 flex flex-col justify-center items-center text-center px-10">
          <h1 className="text-white xl:text-[56px] lg:text-[50px] md:text-[45px] sm:text-[40px] text-[35px] font-normal font-carien mb-[20px]">
            Change Password
          </h1>
          <h2 className="text-white xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-gowun">
            Book, Plan & Stay
          </h2>
          <h3 className="text-white xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-gowun">
            Inspired <span className="text-[#D4AF37]">with AI</span>
          </h3>
        </div>
      </div>

      {/* Right-side form */}
      <div className="w-full lg:col-span-5 flex justify-center items-center bg-[#E5E7EB]">
        <div className="max-w-lg w-full xl:p-8 lg:p-7 md:p-6 sm:p-5 p-4">
          <h2 className="xl:text-[48px] lg:text-[38px] md:text-[35px] text-[30px] font-normal font-carien text-[#333333]">
            Change Password
          </h2>
          <p className="xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] text-[14px] font-normal font-gowun text-[#333333] xl:mb-[30px] lg:mb-[28px] md:mb-[26px] sm:mb-[24px] mb-[20px]">
            Enter a New Password
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form>
              <div className="mb-[20px] relative">
                <img
                  src={LockIcon}
                  alt="Lock"
                  className="absolute left-[20px] lg:top-[18px] md:top-[15px] top-[12px]"
                />
                <Field
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-[50px] pr-[50px] xl:py-[16px] lg:py-[14px] md:py-[12px] py-[10px] bg-[#F8F6F2] rounded-full border border-[#EEEEEE] placeholder:text-[#333333] placeholder:font-gowun font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[20px] lg:top-[18px] md:top-[16px] top-[12px] cursor-pointer text-[#333333] hover:text-[#D4AF37]"
                >
                  {showPassword  ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1 ml-2"
                />
              </div>

              <div className="mb-[20px] relative">
                <img
                  src={LockIcon}
                  alt="Lock"
                  className="absolute left-[20px] lg:top-[18px] md:top-[15px] top-[12px]"
                />
                <Field
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full pl-[50px] pr-[50px] xl:py-[16px] lg:py-[14px] md:py-[12px] py-[10px] bg-[#F8F6F2] rounded-full border border-[#EEEEEE] placeholder:text-[#333333] placeholder:font-gowun font-gowun text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C4A64E]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-[20px] lg:top-[18px] md:top-[15px] top-[12px] cursor-pointer text-[#333333] hover:text-[#D4AF37]"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1 ml-2"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-[12px] w-full flex justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] text-black transition-colors text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun hover:bg-white hover:text-[#D4AF37] cursor-pointer ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </Form>
          </Formik>

          <div className="text-end mt-3">
            <a
              href="/login"
              className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun text-[#333333] underline hover:text-[#D4AF37]"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
