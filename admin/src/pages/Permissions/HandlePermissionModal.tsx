import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { createPermission, updatePermission, getPermissions } from "./_requests";
import { toast } from "react-toastify";
import Checkbox from "../../components/form/input/Checkbox";
import { useAuth } from "../../hooks/useAuth";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Please enter the title of the permission"),
});

interface HandlePermissionModalProps {
  selectedPermission?: any;
  onSubmit: (permission: any) => void;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export default function HandlePermissionModal({
  selectedPermission,
  onSubmit,
  isOpen,
  closeModal,
}: HandlePermissionModalProps) {
  const { userInfo } = useAuth();
  const [loader, setLoader] = useState(false);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await getPermissions();
        setPermissions(response?.data?.permissions || []);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions([]);
      }
    };

    fetchPermissions();
  }, []);

  const getInitialValues = () => {
    const defaultActions = ["view", "add", "update", "delete"];
    if (selectedPermission) {
      return {
        name: selectedPermission.name,
        actions: { ...selectedPermission.actions },
      };
    } else {
      return {
        name: "",
        actions: Object.fromEntries(defaultActions.map((key) => [key, false])),
      };
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setLoader(true);
      toast.dismiss();

      try {
        // ✅ Access control: only Super Admin or user with "Permissions.add"/"Permissions.update" can modify
        const canAdd =
          userInfo?.type === 0 ||
          userInfo?.role?.["Permissions"]?.add;
        const canUpdate =
          userInfo?.type === 0 ||
          userInfo?.role?.["Permissions"]?.update;

        if (selectedPermission && !canUpdate) {
          toast.error("You do not have permission to update this record.");
          return;
        }

        if (!selectedPermission && !canAdd) {
          toast.error("You do not have permission to add new permissions.");
          return;
        }

        let response;
        if (selectedPermission) {
          response = await updatePermission(selectedPermission?.id, values);
          toast.success("Permission updated successfully");
        } else {
          response = await createPermission(values);
          toast.success("Permission created successfully");
        }

        // ✅ Pass new/updated permission to parent
        onSubmit(response?.data || values);
        handleClose();
      } catch (error) {
        console.error("Error saving permission:", error);
      } finally {
        setLoader(false);
        setSubmitting(false);
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
      className="max-w-[700px] p-6 lg:p-10"
    >
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {selectedPermission ? "Edit Permission" : "Add Permission"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedPermission
              ? "Update the details of the permission."
              : "Fill in the details to create a new permission."}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <Label className="mb-1">Title</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                The title should match the sidebar module name.
              </p>
              <Input
                type="text"
                name="name"
                placeholder="Users"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </div>

            {/* Actions */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Permissions
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                {["view", "add", "update", "delete"].map((action) => (
                  <div key={action} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formik.values.actions?.[action] || false}
                      onChange={(checked) =>
                        formik.setFieldValue(`actions.${action}`, checked)
                      }
                      label={action.charAt(0).toUpperCase() + action.slice(1)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div>
              <Button
                className="w-full"
                size="sm"
                type="submit"
                disabled={formik.isSubmitting || loader}
              >
                {loader
                  ? "Saving..."
                  : selectedPermission
                  ? "Update Permission"
                  : "Add Permission"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
