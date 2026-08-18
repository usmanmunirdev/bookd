import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";
import HandleFaqCategoryForm from "./HandleFaqCategoryForm";
import { getFaqCategories, deleteFaqCategory } from "./_requests";
import { useAuth } from "../../hooks/useAuth";

export default function HandleFaqCategoryModal({
  isOpen,
  fetchCategories,
  closeModal,
}: {
  isOpen: boolean;
  fetchCategories: () => void;
  closeModal: () => void;
}) {
  const { userInfo } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const { isOpen: formOpen, openModal, closeModal: closeForm } = useModal();

  const fetchAllCategories = () => {
    getFaqCategories()
      .then((res: any) => setCategories(res?.data || []))
      .catch(() => toast.error("Failed to load categories"));
  };

  useEffect(() => {
    if (isOpen) fetchAllCategories();
  }, [isOpen]);

  const handleDeleteCategory = async (category: any) => {
    toast.dismiss();

    try {
      await deleteFaqCategory(category.id);
      toast.success("Category deleted successfully");
      fetchAllCategories();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete category"
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="w-full max-w-[600px] p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex flex-col w-full">
          <div className="mb-6">
            <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
              FAQ Categories
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your categories.
            </p>
          </div>
          <div className="flex justify-end mb-5">
            <Button onClick={() => openModal()}>
              Add Category <PlusIcon />
            </Button>
          </div>
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[510px]">
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
                      Description
                    </TableCell>
                    {userInfo?.type == "0" ||
                    userInfo?.role?.["Faqs"]?.update ||
                    userInfo?.role?.["Faqs"]?.delete ? (
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
                  {categories?.length > 0 ? (
                    categories?.map((category: any, index: number) => (
                      <TableRow key={index}>
                        {/* Name */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="text-theme-sm dark:text-gray-400">
                            {category?.name ?? "-"}
                          </div>
                        </TableCell>
                        {/* Description */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="text-theme-sm dark:text-gray-400">
                            {category?.description ? (
                              <>
                                {category.description.split("").length > 50
                                  ? category.description
                                      .split(" ")
                                      .slice(0, 7)
                                      .join(" ") + "..."
                                  : category.description}
                              </>
                            ) : (
                              <span className="text-gray-400 text-theme-xs">
                                No Description
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {/* Actions */}
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["Faqs"]?.update ||
                        userInfo?.role?.["Faqs"]?.delete ? (
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center min-h-[70px]">
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Faqs"]?.update ? (
                              <div
                                onClick={() => {
                                  setSelectedCategory(category);
                                  openModal();
                                }}
                                className="text-xl cursor-pointer me-3"
                              >
                                <PencilIcon />
                              </div>
                            ) : null}

                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Faqs"]?.delete ? (
                              <div
                                onClick={() => handleDeleteCategory(category)}
                                className="text-xl cursor-pointer"
                              >
                                <TrashBinIcon />
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
      </Modal>

      {/* Add/Edit Category Form */}
      <HandleFaqCategoryForm
        isOpen={formOpen}
        closeModal={() => {
          closeForm();
          setSelectedCategory(null);
        }}
        selectedCategory={selectedCategory}
        onSubmit={() => {
          fetchCategories();
          fetchAllCategories();
        }}
      />
    </>
  );
}
