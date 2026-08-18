import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState, useLayoutEffect } from "react";
import { getPermissions, deletePermission } from "./_requests";
import HandlePermissionModal from "./HandlePermissionModal";
import { useModal, useDeleteModal } from "../../hooks/useModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, PencilIcon, PlusIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export default function Permissions() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [permissions, setPermissions] = useState<any>([]);
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal } =
    useDeleteModal();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [selectedDeletedPermission, setSelectedDeletedPermission] =
    useState<any>(null);

  useLayoutEffect(() => {
    startLoading();
  }, []);

  // __ __ Getting all Admin Permission __ __ //
  useEffect(() => {
    if (userInfo) {
      getAllPermissions(page);
    }
  }, [page, userInfo]);

  const getAllPermissions = (page: number) => {
    // startLoading();
    getPermissions(page)
      .then((response: any) => {
        // let allPermissions = response?.data || [];

        // // Super admin has access to all
        // if (userInfo?.type !== "0") {
        //   allPermissions = allPermissions.filter((perm: any) => {
        //     const rolePerms = userInfo?.role;
        //     const allowed = rolePerms?.[perm.name];
        //     return allowed && Object.values(allowed).some(Boolean);
        //   });
        // }
        setPermissions(response?.data?.data);
        setPagination(response?.data?.pagination || {});
      })
      .catch((error) => {
        setPermissions([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleOpenModal = (permission: any = null) => {
    setSelectedPermission(permission);
    openModal();
  };

  const handleDelete = (permission: any = null) => {
    setSelectedDeletedPermission(permission);
    openDeleteModal();
  };

  const handleDeletePermission = () => {
    toast.dismiss();
    deletePermission(selectedDeletedPermission?.id)
      .then((response: any) => {
        toast.warning("Permission deleted successfully");
        getAllPermissions(page);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      })
      .finally(() => {
        setSelectedDeletedPermission(null);
        closeDeleteModal();
      });
  };

  return (
    <>
      <PageBreadcrumb pageTitle="All Permissions" />
      <div className="space-y-6">
        <HandlePermissionModal
          selectedPermission={selectedPermission}
          onSubmit={(permission: any) => {
            getAllPermissions(page);
          }}
          isOpen={isOpen}
          openModal={openModal}
          closeModal={closeModal}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          onSubmit={() => handleDeletePermission()}
        />
        {loading ? (
          <Loader />
        ) : (
          <ComponentCard>
            <div className="flex align-center justify-between">
              <h2 className="text-title-sm dark:text-white/90 font-medium">
                Permissions
              </h2>
              {userInfo?.type == "0" ||
              userInfo?.role?.["Permissions"]?.add ? (
                <Button
                  onClick={() => handleOpenModal()}
                  className="text-blue-500 hover:text-[#D4AF37] border hover:bg-transparent transition-all"
                >
                  Add <PlusIcon></PlusIcon>
                </Button>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1102px]">
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Permissions
                        </TableCell>
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["Permissions"]?.update ||
                        userInfo?.role?.["Permissions"]?.delete ? (
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            Action
                          </TableCell>
                        ) : null}
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {permissions?.length > 0 ? (
                        permissions?.map((permission: any) => (
                          <TableRow key={permission._id}>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {permission?.name ?? "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {permission?.actions
                                ? Object.entries(permission.actions)
                                    .map(([key, value]) => (value ? key : null))
                                    .filter(Boolean)
                                    .join(", ")
                                : "-"}
                            </TableCell>
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Permissions"]
                              ?.update ||
                            userInfo?.role?.["Permissions"]
                              ?.delete ? (
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center min-h-[70px]">
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Permissions"]
                                  ?.update ? (
                                  <div
                                    onClick={() => handleOpenModal(permission)}
                                    className="text-xl cursor-pointer me-3"
                                  >
                                    <PencilIcon></PencilIcon>
                                  </div>
                                ) : null}
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Permissions"]
                                  ?.delete ? (
                                  <div
                                    onClick={() => handleDelete(permission)}
                                    className="text-xl cursor-pointer"
                                  >
                                    <TrashBinIcon></TrashBinIcon>
                                  </div>
                                ) : null}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            colSpan={4}
                          >
                            No records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <Pagination pagination={pagination} page={page} setPage={setPage} />
          </ComponentCard>
        )}
      </div>
    </>
  );
}
