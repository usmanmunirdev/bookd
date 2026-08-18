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
import { getChatHistory } from "./_requests";
import { SearchIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "../../components/form/input/SearchInput";
import ChatHistoryModal from "./ViewChatHistoryModal";
import Button from "../../components/ui/button/Button";

export default function ChatHistory() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [chatHistory, setChatHistory] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useLayoutEffect(() => {
    startLoading();
  }, []);

  // __ __ Getting all chat Logs __ __ //
  useEffect(() => {
    if (userInfo) {
      getAllChatHistory(page);
    }
  }, [page, userInfo, searchKeyword]);

  const getAllChatHistory = (page: number) => {
    startLoading();
    getChatHistory(page, searchKeyword)
      .then((response: any) => {
        setChatHistory(response?.data?.data?.data);
        setPagination(response?.data?.data?.pagination);
      })
      .catch((error) => {
        setChatHistory([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  const openChatModal = async (messages: any) => {
    setChatMessages(messages || []);
    setChatModalOpen(true);
  };

  const closeChatModal = () => {
    setChatModalOpen(false);
    setChatMessages([]);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Chat Track" />
      <div className="space-y-6">
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
          <ChatHistoryModal
            isOpen={chatModalOpen}
            onClose={closeChatModal}
            messages={chatMessages}
          />
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
                          Chat Message
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Chat Time
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {chatHistory?.length > 0 ? (
                        chatHistory.map((chat: any) => (
                          <TableRow key={chat.id}>
                            {/* User */}
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <div className="flex items-center gap-3">
                                <div>
                                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {chat.user
                                      ? `${chat.user.name || ""}`.trim() ||
                                        "-"
                                      : "-"}
                                  </span>
                                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                    {chat.user?.email}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* chat Type */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <Button
                                onClick={() => openChatModal(chat.messages)}
                                className="hover:text-[#D4AF37] border hover:bg-transparent transition-all"
                              >
                                View Chat
                              </Button>
                            </TableCell>
                            {/* Created At */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {new Date(chat.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            colSpan={5}
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
