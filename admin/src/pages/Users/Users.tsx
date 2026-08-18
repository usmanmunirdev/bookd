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
import { getUsers, deleteUser } from "./_requests";
import HandleUserModal from "./HandleUserModal";
import { useModal, useDeleteModal } from "../../hooks/useModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, PencilIcon, PlusIcon, SearchIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "../../components/form/input/SearchInput";

export default function Users() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [users, setUsers] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal } =
    useDeleteModal();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDeletedUser, setSelectedDeletedUser] = useState<any>(null);

  useLayoutEffect(() => {
    startLoading();
  }, []);

  // __ __ Getting all Admin User __ __ //
  useEffect(() => {
    if (userInfo) {
      getAllUsers(page);
    }
  }, [page, userInfo, searchKeyword]);

  const getAllUsers = (page: number) => {
    startLoading();
    getUsers(page, searchKeyword)
      .then((response: any) => {
        setUsers(response?.data?.users);
        setPagination(response?.data?.pagination);
      })
      .catch((error) => {
        setUsers([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleOpenModal = (user: any = null) => {
    setSelectedUser(user);
    openModal();
  };

  const handleDelete = (user: any = null) => {
    setSelectedDeletedUser(user);
    openDeleteModal();
  };

  const handleDeleteUser = () => {
    toast.dismiss();
    deleteUser(selectedDeletedUser?.id)
      .then((response: any) => {
        toast.warning("User deleted successfully");
        getAllUsers(page);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      })
      .finally(() => {
        setSelectedDeletedUser(null);
        closeDeleteModal();
      });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };
  return (
    <>
      <PageBreadcrumb pageTitle="All Users" />
      <div className="space-y-6">
        <HandleUserModal
          selectedUser={selectedUser}
          onSubmit={(user: any) => {
            getAllUsers(page);
          }}
          isOpen={isOpen}
          openModal={openModal}
          closeModal={closeModal}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          onSubmit={() => handleDeleteUser()}
        />
        <ComponentCard>
          <div className="flex items-center justify-between flex-wrap sm:mb-4 mb-2 ">
            <div className="relative table-search mr-3 lg:mb-0 md:mb-0 mb-4">
              <SearchIcon className="absolute top-[14px] right-[13px] dark:invert-100"></SearchIcon>
              <SearchInput
                handleSearch={handleSearch}
                searchKey={searchKeyword}
              />
            </div>

            {/* {userInfo?.type == "0" ||
            userInfo?.role?.["Users"]?.add ? (
              <Button
                onClick={() => handleOpenModal()}
                className="text-blue-500 hover:text-[#D4AF37] border hover:bg-transparent transition-all lg:mb-0 md:mb-0 mb-4"
              >
                Add <PlusIcon></PlusIcon>
              </Button>
            ) : null} */}
          </div>
          <div
            className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
            style={{
              backgroundColor: document.documentElement.classList.contains(
                "dark"
              )
                ? undefined
                : "",
              borderColor: document.documentElement.classList.contains("dark")
                ? undefined
                : "",
            }}
          >
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                {loading ? (
                  <Loader />
                ) : (
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          User
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Selected Plans
                        </TableCell>
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["Users"]?.update ||
                        userInfo?.role?.["Users"]?.delete ? (
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
                      {users?.length > 0 ? (
                        users?.map((user: any) => (
                          <TableRow key={user._id}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <div className="flex items-center gap-3">
                                <div>
                                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {user
                                      ? `${user.firstName || ""} ${
                                          user.lastName || ""
                                        }`.trim() || "-"
                                      : "-"}
                                  </span>
                                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                    {user?.email}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {user?.plan ?? "-"}
                            </TableCell>
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Users"]
                              ?.update ||
                            userInfo?.role?.["Users"]
                              ?.delete ? (
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center min-h-[70px]">
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Users"]
                                  ?.update ? (
                                  <div
                                    onClick={() => handleOpenModal(user)}
                                    className="text-xl cursor-pointer me-3"
                                  >
                                    <PencilIcon></PencilIcon>
                                  </div>
                                ) : null}
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Users"]
                                  ?.delete ? (
                                  <div
                                    onClick={() => handleDelete(user)}
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
                )}
              </div>
            </div>
          </div>
          <Pagination pagination={pagination} page={page} setPage={setPage} />
        </ComponentCard>
      </div>
    </>
  );
}
