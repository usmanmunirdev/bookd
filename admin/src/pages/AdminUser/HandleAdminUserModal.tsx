import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { createAdminUser, updateAdminUser } from "./_requests";
import { toast } from "react-toastify";
import Select from "../../components/form/Select";
import { getRoles } from "../Roles/_requests";
import InputMask from "react-input-mask";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Validation Schema for Yup
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Wrong email format"
    )
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password should be at least 6 characters")
    .max(15, "Password cannot be more than 15 characters"),
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
  phone: Yup.string()
    .matches(/^(\+?\d{10,15})$/, "Invalid phone number")
    .required("Phone number is required"),
  roleId: Yup.string(),
});

const initialValues = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  roleId: "",
  phone: "",
};

interface HandleAdminUserModalProps {
  selectedAdminUser?: any;
  onSubmit: (user: any) => void;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export default function HandleAdminUserModal({
  selectedAdminUser,
  onSubmit,
  isOpen,
  closeModal,
}: HandleAdminUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<any>([]);

  useEffect(() => {
    formik.setValues(
      selectedAdminUser
        ? { ...initialValues, ...selectedAdminUser, roleId: selectedAdminUser.role?.id }
        : initialValues
    );
  }, [selectedAdminUser]);

  useEffect(() => {
    getAllRoles();
  }, []);

  const getAllRoles = () => {
    getRoles()
      .then((response: any) => {
        setRoles(response?.data?.roles);
      })
      .catch(() => {
        setRoles([]);
      });
  };

  const formik = useFormik({
    initialValues: selectedAdminUser ? { ...selectedAdminUser } : initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      toast.dismiss();
      try {
        if (selectedAdminUser) {
          delete values.createdBy;
          delete values.messages;
          await updateAdminUser(selectedAdminUser.id, values);
          toast.success("User updated successfully");
        } else {
          await createAdminUser(values);
          toast.success("User created successfully");
        }
        onSubmit(values);
        handleClose();
      } catch (error) {
        setSubmitting(false);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="w-full max-w-[700px] p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {selectedAdminUser ? "Edit User" : "Add User"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedAdminUser
              ? "Update the details of the user"
              : "Fill in the details to create a new user."}
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="info@example.com"
                value={formik.values.email || ""}
                onChange={formik.handleChange}
                autoComplete="off"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-error-500 text-sm">
                  {String(formik.errors.email)}
                </div>
              )}
            </div>

            {/* First Name Input */}
            <div>
              <Label>
                First Name <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="firstName"
                placeholder="John"
                value={formik.values.firstName || ""}
                onChange={formik.handleChange}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-error-500 text-sm">
                  {String(formik.errors.firstName)}
                </div>
              )}
            </div>

            {/* Last Name Input */}
            <div>
              <Label>
                Last Name <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formik.values.lastName || ""}
                onChange={formik.handleChange}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-error-500 text-sm">
                  {String(formik.errors.lastName)}
                </div>
              )}
            </div>
            {/* Phone Number Input */}
            <div>
              <Label>
                Phone Number <span className="text-error-500">*</span>
              </Label>

              <PhoneInput
                country={"us"}
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue("phone", value)}
                onBlur={formik.handleBlur}
                enableSearch={true}
                inputProps={{
                  name: "phone",
                  required: true,
                }}
                inputClass="!h-11 !w-full !rounded-lg !border !border-gray-300 dark:!border-gray-700 !bg-transparent dark:!bg-gray-900 !px-4 !py-2.5 !text-sm !text-gray-800 dark:!text-white/90 !placeholder:text-gray-400 dark:!placeholder:text-white/40 !pl-14 focus:!outline-none focus:!border-brand-300 focus:!ring-3 focus:!ring-brand-500/20 dark:focus:!border-brand-800"
              />

              {formik.touched.phone && formik.errors.phone && (
                <div className="text-error-500 text-sm">
                  {String(formik.errors.phone)}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formik.values.password || ""}
                  onChange={formik.handleChange}
                  autoComplete="new-password"
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
              {formik.touched.password && formik.errors.password && (
                <div className="text-error-500 text-sm">
                  {String(formik.errors.password)}
                </div>
              )}
            </div>
            {/* Role Selection */}
            <div>
              <Label>
                Role <span className="text-error-500">*</span>
              </Label>
              <Select
                options={roles?.map((role: any) => ({
                  label: role.name,
                  value: role.id,
                }))}
                onChange={(value: string) =>
                  formik.setFieldValue("roleId", value)
                }
                defaultValue={formik.values.roleId}
              />
              {formik.touched.roleId && formik.errors.roleId && (
                <div className="text-error-500 text-sm">
                  {String(formik.errors.roleId)}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <Button
                className="w-full"
                size="sm"
                type="submit"
                disabled={formik.isSubmitting || loading}
              >
                {loading
                  ? "Saving..."
                  : selectedAdminUser
                  ? "Update User"
                  : "Add User"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
