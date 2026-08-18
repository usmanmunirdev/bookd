import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { toast } from "react-toastify";
import { updateAdminProfile } from "../../pages/Users/_requests";

// Validation Schema for Yup
const validationSchema = Yup.object().shape({
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
  role: Yup.string().required("Bio is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

interface EditProfileModalProps {
  selectedUser?: any;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  getUserinfo: () => void;
}

export default function HandleUserProfileModal({
  isOpen,
  onClose,
  user,
  getUserinfo,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      role: user?.role?.name
        ? user?.role?.name
        : !user?.role?.name
        ? "Super Admin"
        : "",
      email: user?.email || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        toast.dismiss();
        delete values.role;
        delete values.email;
        values.firstName = values.firstName.trim();
        values.lastName = values.lastName.trim();
        await updateAdminProfile(values as any);
        toast.success("Profile updated successfully!");
        getUserinfo();
        onClose();
      } catch (error: any) {
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details to keep your profile up-to-date.
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="flex flex-col">
          <div className="custom-scrollbar h-auto overflow-y-auto px-2 pb-3">
            <div className="mt-2">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <div className="text-red-500 text-sm">
                      {String(formik.errors.firstName)}
                    </div>
                  )}
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <div className="text-red-500 text-sm">
                      {String(formik.errors.lastName)}
                    </div>
                  )}
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Role</Label>
                  <Input
                    type="text"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    disabled
                  />
                  {formik.touched.role && formik.errors.role && (
                    <div className="text-red-500 text-sm">
                      {String(formik.errors.role)}
                    </div>
                  )}
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    disabled
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm">
                      {String(formik.errors.email)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
