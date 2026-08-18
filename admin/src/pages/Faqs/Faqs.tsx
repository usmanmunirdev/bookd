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
import { getFaqs, deleteFaq, getFaqCategories } from "./_requests";
import HandleFaqsModal from "./HandleFaqModal";
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
import HandleFaqCategoryModal from "./HandleCategoryModal";

export default function Faqs() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [faqs, setFaqs] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal } =
    useDeleteModal();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedFaqs, setSelectedFaqs] = useState<any>(null);
  const [selectedDeletedFaqs, setSelectedDeletedFaqs] = useState<any>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(undefined);
  useLayoutEffect(() => {
    startLoading();
  }, []);

  // __ __ Getting all Faqs __ __ //
  useEffect(() => {
    if (userInfo) {
      fetchCategories();
      getAllFaqs(page);
    }
  }, [page, userInfo, searchKeyword, selectedCategory]);

  const fetchCategories = () => {
    getFaqCategories()
      .then((res: any) => setCategories(res?.data || []))
      .catch(() => setCategories([]));
  };

  const getAllFaqs = (page: number) => {
    startLoading();
    toast.dismiss();
    getFaqs({
      page,
      search: searchKeyword,
      categoryId: selectedCategory,
    })
      .then((response: any) => {
        console.log("Faqs response:", response.data);
        setFaqs(response?.data?.data);
        setPagination(response?.data?.pagination);
      })
      .catch((error) => {
        setFaqs([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleOpenModal = (user: any = null) => {
    setSelectedFaqs(user);
    openModal();
  };

  const handleDelete = (user: any = null) => {
    setSelectedDeletedFaqs(user);
    openDeleteModal();
  };

  const handleDeleteFaqs = () => {
    toast.dismiss();
    deleteFaq(selectedDeletedFaqs?.id)
      .then((response: any) => {
        toast.warning("Faqs deleted successfully");
        getAllFaqs(page);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      })
      .finally(() => {
        setSelectedDeletedFaqs(null);
        closeDeleteModal();
      });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="All FAQs" />
      <div className="space-y-6">
        <HandleFaqsModal
          isOpen={isOpen}
          closeModal={closeModal}
          selectedFaq={selectedFaqs}
          categories={categories}
          onSubmit={() => getAllFaqs(page)}
        />
        <HandleFaqCategoryModal
          isOpen={categoryModalOpen}
          closeModal={() => setCategoryModalOpen(false)}
          fetchCategories={() => fetchCategories()}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          onSubmit={() => handleDeleteFaqs()}
        />
        <ComponentCard>
          <div className="flex items-center justify-between flex-wrap sm:mb-4 mb-2 ">
            <div className="flex items-center xl:mb-0 mb-4">
              <div className="relative table-search mr-3 lg:mb-0 md:mb-0 mb-4">
                <SearchIcon className="absolute top-[14px] right-[13px] dark:invert-100"></SearchIcon>
                <SearchInput
                  handleSearch={handleSearch}
                  searchKey={searchKeyword}
                />
              </div>
              <div className="w-[220px] md:mr-0 mr-3 lg:mb-0 md:mb-0 mb-4 relative">
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => handleCategoryFilter(e.target.value || "")}
                  className="border p-2 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400 custom-select-items"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center">
              {userInfo?.type == "0" || userInfo?.role?.["FAQs"]?.add ? (
                <Button
                  onClick={() => handleOpenModal()}
                  className="text-blue-500 hover:text-[#D4AF37] border hover:bg-transparent transition-all lg:mb-0 md:mb-0 mb-4 mr-3"
                >
                  Add <PlusIcon></PlusIcon>
                </Button>
              ) : null}
              {userInfo?.type == "0" || userInfo?.role?.["FAQs"]?.add ? (
                <Button
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-blue-500 hover:text-[#D4AF37] border hover:bg-transparent transition-all lg:mb-0 md:mb-0 mb-4"
                >
                  Manage Category <PlusIcon />
                </Button>
              ) : null}
            </div>
          </div>
          <div
            className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
            style={{
              backgroundColor: document.documentElement.classList.contains(
                "dark",
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
                          Question
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Answer
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Category
                        </TableCell>
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["FAQs"]?.update ||
                        userInfo?.role?.["FAQs"]?.delete ? (
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
                      {faqs?.length > 0 ? (
                        faqs?.map((faq: any, index: number) => (
                          <TableRow key={index}>
                            {/* Question */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="text-theme-sm dark:text-gray-400">
                                {faq?.question ? (
                                  <div className="relative group max-w-full">
                                    <span className="cursor-help">
                                      {faq.question.length > 50
                                        ? faq.question
                                            .split(" ")
                                            .slice(0, 7)
                                            .join(" ") + "..."
                                        : faq.question}
                                    </span>
                                    {/* <div className="absolute left-0 bottom-full mb-2 hidden w-max max-w-sm rounded-lg bg-gray-900 text-white text-xs px-3 py-2 shadow-lg group-hover:block z-50">
                                      {faq.question}
                                    </div> */}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-theme-xs">
                                    No Question
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Answer */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="text-theme-sm dark:text-gray-400">
                                {faq?.answer ? (
                                  <div className="relative group max-w-full">
                                    <span className="cursor-help">
                                      {faq.answer.length > 50
                                        ? faq.answer
                                            .split(" ")
                                            .slice(0, 7)
                                            .join(" ") + "..."
                                        : faq.answer}
                                    </span>
                                    {/* <div className="absolute left-0 bottom-full mb-2 hidden w-max max-w-sm rounded-lg bg-gray-900 text-white text-xs px-3 py-2 shadow-lg group-hover:block z-50">
                                      {faq.answer}
                                    </div> */}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-theme-xs">
                                    No Answer
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Category */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="flex flex-col">
                                <span>
                                  {faq?.category ? faq.category?.name : "-"}
                                </span>
                              </div>
                            </TableCell>
                            {/* Actions */}
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["FAQs"]?.update ||
                            userInfo?.role?.["FAQs"]?.delete ? (
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center min-h-[70px]">
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["FAQs"]?.update ? (
                                  <div
                                    onClick={() => handleOpenModal(faq)}
                                    className="text-xl cursor-pointer me-3"
                                  >
                                    <PencilIcon />
                                  </div>
                                ) : null}

                                {userInfo?.type == "0" ||
                                userInfo?.role?.["FAQs"]?.delete ? (
                                  <div
                                    onClick={() => handleDelete(faq)}
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
