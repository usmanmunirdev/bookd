import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { createRole, updateRole, getPermissions } from "./_requests";
import { toast } from "react-toastify";
import Checkbox from "../../components/form/input/Checkbox";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Please enter the title of the role"),
});

interface HandleRoleModalProps {
  selectedRole?: any;
  onSubmit: (role: any) => void;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export default function HandleRoleModal({
  selectedRole,
  onSubmit,
  isOpen,
  closeModal,
}: HandleRoleModalProps) {
  const [loader, setLoader] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  /** Fetch all available permissions */
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await getPermissions();
        setPermissions(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions([]);
      }
    };
    fetchPermissions();
  }, []);

  /** Prepare initial values after permissions are fetched */
  useEffect(() => {
    if (permissions.length > 0) {
      formik.setValues(getInitialValues());
      setInitialLoaded(true);
    }
  }, [permissions, selectedRole]);

  /** Build initial form values */
  const getInitialValues = () => {
    // Default: all permissions with all actions = false
    let initialActions: Record<
      string,
      Record<string, boolean>
    > = permissions.reduce((acc: any, permission: any) => {
      acc[permission.id] = { name: permission.name };
      Object.keys(permission.actions || {}).forEach((actionKey) => {
        acc[permission.id][actionKey] = false;
      });
      return acc;
    }, {});

    // Fill existing actions from selectedRole (for Edit)
    if (selectedRole && selectedRole.permissions) {
      selectedRole.permissions.forEach((perm: any) => {
        if (initialActions[perm.permissionId]) {
          initialActions[perm.permissionId] = {
            ...initialActions[perm.permissionId],
            ...perm.actions,
          };
        }
      });
    }

    return {
      name: selectedRole?.name || "",
      actions: initialActions,
    };
  };

  /** Formik setup */
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoader(true);
      toast.dismiss();
      try {
        const permissionsToSend = Object.entries(values.actions).map(
          ([permissionId, actions]) => {
            const { name, ...restActions } = actions;
            return {
              permissionId,
              name,
              actions: restActions,
            };
          }
        );

        const roleData = {
          name: values.name,
          permissions: permissionsToSend,
        };

        if (selectedRole) {
          await updateRole(selectedRole.id, roleData);
          toast.success("Role updated successfully");
        } else {
          await createRole(roleData);
          toast.success("Role created successfully");
        }

        onSubmit(roleData);
        handleClose();
      } catch (error) {
        console.error("Error saving role:", error);
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
      <div className="flex flex-col flex-1 w-full">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {selectedRole ? "Edit Role" : "Add Role"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedRole
              ? "Update the details of the role"
              : "Fill in the details to create a new role."}
          </p>
        </div>

        {!initialLoaded && permissions.length === 0 ? (
          <p className="text-center text-gray-500">Loading permissions...</p>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6 max-h-[400px] pr-[20px] overflow-y-auto">
              <div>
                <Label>Title</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Admin"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.name as string}
                  </p>
                )}
              </div>

              {permissions.map((permission: any) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-4"
                >
                  <h5 className="w-28 font-medium dark:text-white/90">{permission.name}:</h5>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(permission.actions || {}).map(
                      (actionKey) =>
                        permission.actions?.[actionKey] && (
                          <Checkbox
                            key={permission.id + "_" + actionKey}
                            checked={
                              formik.values.actions?.[permission.id]?.[
                                actionKey
                              ] || false
                            }
                            onChange={(checked) =>
                              formik.setFieldValue(
                                `actions[${permission.id}].${actionKey}`,
                                checked
                              )
                            }
                            label={
                              actionKey.charAt(0).toUpperCase() +
                              actionKey.slice(1)
                            }
                          />
                        )
                    )}
                  </div>
                </div>
              ))}

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  type="submit"
                  disabled={formik.isSubmitting || loader}
                >
                  {loader
                    ? "Saving..."
                    : selectedRole
                    ? "Update Role"
                    : "Add Role"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
