import { useState } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { login } from "./_requests";
import * as Yup from "yup";
import { ENV } from "../../utils/config";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { updateToken } = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        const { data: user } = await login(
          values.email,
          values.password,
          rememberMe
        );

        let permissionsArray = user?.admin?.role?.permissions || [];

        const permissionsObject = permissionsArray.reduce(
          (acc: any, perm: any) => {
            acc[perm.name] = perm.actions;
            return acc;
          },
          {}
        );
        user.admin.role = permissionsObject;
        ENV.encryptAdminData(user);
        setLoading(false);
        updateToken(user.token);
        navigate("/admin");
      } catch (error: any) {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex flex-col flex-1 bg-[#f3f5f8] dark:bg-gray-900">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto min-h-[100vh]">
        <div
          className="shadow p-[20px] rounded-2xl border-2 dark:border-white/[0.03] dark:bg-white/[0.03]"
          // style={{
          //   backgroundColor: document.documentElement.classList.contains("dark")
          //     ? undefined
          //     : "#f3f5f8",
          //   borderColor: document.documentElement.classList.contains("dark")
          //     ? undefined
          //     : "#e4e7ec",
          // }}
        >
          <div className="mb-5 sm:mb-8 text-center">
            <img
              className="mx-auto mb-4 dark:hidden"
              src="/admin/images/logo/bookd-logo-cropped.svg"
              alt="Logo"
              width={100}
              height={60}
            />
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="info@gmail.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-error-500 text-sm">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-error-500 text-sm">
                      {formik.errors.password}
                    </div>
                  ) : null}
                </div>
                {/* <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember Me</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div> */}

                <div>
                  <Button
                    className="w-full bg-[#467ff7] hover:bg-[#1c244b] text-white"
                    size="sm"
                    type="submit"
                    disabled={formik.isSubmitting || loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
