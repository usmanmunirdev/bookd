import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { resetPassword } from "./_requests";
import { toast } from "react-toastify";
import { EyeIcon, EyeCloseIcon } from "../../icons"; // Adjust path as needed

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Maximum 50 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      toast.dismiss();
      try {
        const res = await resetPassword(
          state.email,
          values.password,
          values.confirmPassword
        );
        if (res.data.status) {
          toast.success("Password updated successfully");
          navigate("/admin/signin");
        }
      } catch (error) {
        console.error("Reset error:", error);
        toast.error("Something went wrong. Try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f3f5f8]">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-md p-6 border rounded-lg shadow bg-white"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>

        {/* Password Field */}
        <div className="mb-3">
          <Label>
            New Password <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 size-5" />
              )}
            </span>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="text-error-500 text-sm mt-1">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4">
          <Label>
            Re-enter Password <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showConfirm ? (
                <EyeIcon className="fill-gray-500 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 size-5" />
              )}
            </span>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="text-error-500 text-sm mt-1">
              {formik.errors.confirmPassword}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2 bg-[#467ff7] hover:bg-[#1c244b] text-white"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
