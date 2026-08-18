import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { createPortal } from "react-dom";
import { useEffect, useState, useLayoutEffect } from "react";
import { getContacts, deleteContact } from "./_requests";
import { useModal } from "../../hooks/useModal";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, MailIcon, SearchIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "../../components/form/input/SearchInput";
import HandleContactUsModal from "./HandleContactUsModal";

export default function ContactUsQuery() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [contacts, setContacts] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedContact, setSelectedContact] = useState<any>(null);

  useLayoutEffect(() => {
    startLoading();
  }, []);

  useEffect(() => {
    if (userInfo) {
      getAllContacts(page);
    }
  }, [page, userInfo, searchKeyword]);

  const getAllContacts = (page: number) => {
    startLoading();
    getContacts({
      page,
      search: searchKeyword,
    })
      .then((response: any) => {
        setContacts(response?.data?.data || []);
        setPagination(response?.data?.pagination || {});
      })
      .catch(() => {
        setContacts([]);
        setPagination({});
        toast.error("Failed to fetch contacts");
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleOpenModal = (contact: any = null) => {
    setSelectedContact(contact);
    openModal();
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="All Contacts" />
      <div className="space-y-6">
        <HandleContactUsModal
          isOpen={isOpen}
          closeModal={closeModal}
          selectedContact={selectedContact}
          onSubmit={() => getAllContacts(page)}
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
            <div className="max-w-full overflow-x-auto  overflow-y-visible relative">
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
                          Full Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Email
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Subject
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Message
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                          Reply
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400  whitespace-nowrap"
                        >
                          Replied By
                        </TableCell>
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["Contact Queries"]?.update ? (
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
                      {contacts?.length > 0 ? (
                        contacts?.map((contact: any, index: number) => (
                          <TableRow key={index}>
                            {/* Full Name */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {contact?.fullName || (
                                <span className="text-gray-400 text-theme-xs">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Email */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {contact?.email || (
                                <span className="text-gray-400 text-theme-xs">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Subject */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {contact?.subject ? (
                                contact.subject.length > 50 ? (
                                  contact.subject.slice(0, 50) + "..."
                                ) : (
                                  contact.subject
                                )
                              ) : (
                                <span className="text-gray-400 text-theme-xs">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Message */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {contact?.message ? (
                                <div className="relative group max-w-full">
                                  <span className="cursor-help">
                                    {contact.message.length > 50
                                      ? contact.message
                                          .split(" ")
                                          .slice(0, 7)
                                          .join(" ") + "..."
                                      : contact.message}
                                  </span>
                                  {/* <div className="absolute left-0 bottom-full mb-2 hidden w-max max-w-sm rounded-lg bg-gray-900 text-white text-xs px-3 py-2 shadow-lg group-hover:block z-50">
                                    {contact.message}
                                  </div> */}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-theme-xs">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Reply */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {contact?.reply ? (
                                <div className="relative group max-w-full">
                                  <span className="cursor-help">
                                    {contact.reply.length > 50
                                      ? contact.reply
                                          .split(" ")
                                          .slice(0, 7)
                                          .join(" ") + "..."
                                      : contact.reply}
                                  </span>
                                  {/* <div className="absolute left-0 top-full hidden mb-2  w-max max-w-sm rounded-lg bg-gray-900 text-white text-xs px-3 py-2 shadow-lg group-hover:block z-50">
                                    {contact.reply}
                                  </div> */}
                                  
                                </div>
                              ) : (
                                <span className="text-gray-400 text-theme-xs">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Replied By */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {contact?.repliedBy
                                ? contact.repliedBy.id == userInfo?.id
                                  ? "You"
                                  : contact.repliedBy.fullName
                                : "-"}
                            </TableCell>

                            {/* Actions */}
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Contact Queries"]?.update ? (
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center min-h-[70px]">
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Contact Queries"]?.update ? (
                                  <div
                                    onClick={() => handleOpenModal(contact)}
                                    className="text-xl cursor-pointer me-3"
                                  >
                                    <MailIcon />
                                  </div>
                                ) : null}
                                {/* {userInfo?.type == "0" ||
                                userInfo?.role?.["Contact Queries"]?.delete ? (
                                  <div
                                    onClick={() => handleDelete(contact.id)}
                                    className="text-xl cursor-pointer text-red-500"
                                  >
                                    <TrashBinIcon />
                                  </div>
                                ) : null} */}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            colSpan={7}
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
