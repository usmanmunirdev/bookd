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
import { getRoles, deleteRole } from "./_requests";
import HandleRoleModal from "./HandleRoleModal";
import { useModal, useDeleteModal } from "../../hooks/useModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, PencilIcon, PlusIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export default function Roles() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [roles, setRoles] = useState<any>([]);
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal } =
    useDeleteModal();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedDeletedRole, setSelectedDeletedRole] = useState<any>(null);

  useLayoutEffect(() => {
    startLoading();
  }, []);

  // __ __ Getting all Admin Role __ __ //
  useEffect(() => {
    if (userInfo) {
      getAllRoles(page);
    }
  }, [page, userInfo]);

  const getAllRoles = (page: number) => {
    // startLoading();
    getRoles(page)
      .then((response: any) => {
        setRoles(response?.data?.roles);
        setPagination(response?.data?.pagination);
      })
      .catch((error) => {
        setRoles([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };
  const handleOpenModal = (role: any = null) => {
    setSelectedRole(role);
    openModal();
  };

  const handleDelete = (role: any = null) => {
    setSelectedDeletedRole(role);
    openDeleteModal();
  };

  const handleDeleteRole = () => {
    toast.dismiss();
    deleteRole(selectedDeletedRole?.id)
      .then((response: any) => {
        toast.warning("Role deleted successfully");
        getAllRoles(page);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      })
      .finally(() => {
        setSelectedDeletedRole(null);
        closeDeleteModal();
      });
  };
  return (
    <>
      <PageBreadcrumb pageTitle="All Roles" />
      <div className="space-y-6">
        <HandleRoleModal
          selectedRole={selectedRole}
          onSubmit={(role: any) => {
            getAllRoles(page);
          }}
          isOpen={isOpen}
          openModal={openModal}
          closeModal={closeModal}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          onSubmit={() => handleDeleteRole()}
        />
        {loading ? (
          <Loader />
        ) : (
          <ComponentCard>
            <div className="flex align-center justify-between">
              <h2 className="text-title-sm dark:text-white/90 font-medium">
                Roles
              </h2>
              {userInfo?.type == "0" ||
              userInfo?.role?.["Roles"]?.add ? (
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
                <div className="min-w-[700px]">
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
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["Roles"]?.update ||
                        userInfo?.role?.["Roles"]?.delete ? (
                          <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-right text-theme-xs dark:text-gray-400"
                          >
                            Action
                          </TableCell>
                        ) : null}
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {roles?.length > 0 ? (
                        roles?.map((role: any) => (
                          <TableRow key={role.id}>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {role?.name ?? "-"}
                            </TableCell>
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Roles"]?.update ||
                            userInfo?.role?.["Roles"]?.delete ? (
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center justify-end min-h-[70px]">
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Roles"]
                                  ?.update ? (
                                  <div
                                    onClick={() => handleOpenModal(role)}
                                    className="text-xl cursor-pointer me-3"
                                  >
                                    <PencilIcon></PencilIcon>
                                  </div>
                                ) : null}
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Roles"]
                                  ?.delete ? (
                                  <div
                                    onClick={() => handleDelete(role)}
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
