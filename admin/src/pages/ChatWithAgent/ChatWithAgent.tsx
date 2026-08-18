import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  getAllChats,
  getChat,
  createChatMessage,
  getAiStatus,
  toggleAi,
} from "./_requests";
import { useAuth } from "../../hooks/useAuth";
import { io } from "socket.io-client";
import { DebounceInput } from "react-debounce-input";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");
const PAGE_LIMIT = 10;

export default function ChatWithAgent() {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const { userInfo } = useAuth();
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedChatIdRef = useRef<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [chatListLoading, setChatListLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Pagination state ──────────────────────────────────────────────────────
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Use refs for values the IntersectionObserver callback needs — avoids stale closures
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const isFetchingRef = useRef(false); // prevents duplicate concurrent fetches
  const initialLoadDoneRef = useRef(false); // prevents observer firing on mount

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelNodeRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef(search);
  searchRef.current = search;

  /**
   * 🔥 Initialize Socket ONLY ONCE
   */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newMessage", (msg: any) => {
      console.log("New message received:", msg);
      if (msg.chatId == selectedChatIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("newNotification", (payload: any) => {
      const { chatId, user } = payload;

      setChats((prev) => {
        const exists = prev.find((c) => c.chatId === chatId);

        if (exists) {
          const updated = prev
            .map((c) =>
              c.chatId === chatId ? { ...c, hasNewMessage: true } : c
            )
            .sort((a, b) =>
              a.chatId === chatId ? -1 : b.chatId === chatId ? 1 : 0
            );
          return updated;
        }

        const newChat = {
          chatId,
          id: chatId,
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: new Date(),
          hasNewMessage: true,
        };

        return [newChat, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
  }, [selectedChat]);

  /**
   * Reset to page 1 whenever search changes
   */
  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = false;
    initialLoadDoneRef.current = false;
    setHasMore(false);
    setChats([]);

    sentinelNodeRef.current?.parentElement?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    loadChats(search, 1, true);
  }, [search]);

  /**
   * Load chats — replace=true overwrites the list (page 1 / new search),
   *              replace=false appends (infinite scroll)
   */
  const loadChats = useCallback(
    async (searchTerm: string, targetPage: number, replace = false) => {
      if (isFetchingRef.current) return; // guard against concurrent fetches
      isFetchingRef.current = true;

      try {
        if (replace) {
          setChatListLoading(true);
        } else {
          setLoadingMore(true);
        }

        const res: any = await getAllChats(searchTerm, targetPage, PAGE_LIMIT);

        if (res?.data?.success) {
          const incoming: any[] = res.data.users ?? [];
          const more: boolean = res.data.hasMore ?? false;

          setChats((prev) => (replace ? incoming : [...prev, ...incoming]));

          // Update both state (for UI) and ref (for observer callback)
          hasMoreRef.current = more;
          setHasMore(more);
          pageRef.current = targetPage;
          initialLoadDoneRef.current = true;
        }
      } catch (err) {
        console.error("Failed to load users", err);
        if (replace) setChats([]);
      } finally {
        isFetchingRef.current = false;
        setChatListLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );


  // Callback ref — runs when the sentinel element mounts/unmounts in the DOM
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelNodeRef.current = node;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (
            entry.isIntersecting &&
            initialLoadDoneRef.current &&
            hasMoreRef.current &&
            !isFetchingRef.current
          ) {
            const nextPage = pageRef.current + 1;
            loadChats(searchRef.current, nextPage, false);
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [loadChats]
  );

  /**
   * Auto scroll to last message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * 🔥 Open chat + join room
   */
  const openChat = async (chatId: string) => {
    selectedChatIdRef.current = chatId;
    setChatLoading(true);
    getChat(chatId)
      .then((res: any) => {
        if (res?.data) {
          setSelectedChat({
            ...res.data?.message?.[0],
            chatId: chatId,
          });

          setMessages(res.data.messages || []);
          socketRef.current?.emit("joinThread", chatId);

          setChats((prev) =>
            prev.map((c) =>
              c.chatId == chatId ? { ...c, hasNewMessage: false } : c
            )
          );
        }
      })
      .catch((error) => {
        console.error("Error loading chat:", error);
      })
      .finally(() => {
        setChatLoading(false);
      });

    try {
      const res = await getAiStatus(chatId);
      setAiEnabled(res.data.aiEnabled);
    } catch (err) {
      console.error("Failed to fetch AI status", err);
      setAiEnabled(true);
    }
  };

  /**
   * 🔥 SEND MESSAGE
   */
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      chatId: selectedChat.chatId,
      message,
      adminId: userInfo?.id,
      senderType: "ADMIN",
      createdAt: new Date().toISOString(),
    };

    setMessage("");

    try {
      await createChatMessage(newMessage);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleAI = async () => {
    if (!selectedChat) return;

    const newStatus = !aiEnabled;
    setAiEnabled(newStatus);

    try {
      await toggleAi(selectedChat.chatId, newStatus);
    } catch (err) {
      console.error("Failed to update AI status", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <PageBreadcrumb pageTitle="Chat With Users" />

      <div className="lg:flex h-[85vh] gap-4 p-4 pl-0">
        {/* CHAT LIST */}
        <div className="lg:w-90 w-full bg-white dark:bg-white/[0.03] rounded-2xl shadow p-4 flex flex-col lg:mb-0 mb-[20px] chat-list-box-h">
          <h2 className="text-xl font-semibold mb-4 dark:text-white/90">
            Chats
          </h2>
          <DebounceInput
            minLength={0}
            debounceTimeout={500}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="mb-3 w-full px-3 py-2 rounded-lg bg-gray-100 text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             dark:bg-black dark:text-white"
          />

          {/* Scrollable list */}
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0 scroll-smooth">
            {chatListLoading && chats.length === 0 ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : chats.length === 0 ? (
              <p className="text-gray-400 text-sm dark:text-white/90">
                No chats available
              </p>
            ) : (
              <>
                {chats.map((chat: any) => (
                  <div
                    key={chat.chatId}
                    className={`relative flex items-center gap-3 p-2 rounded-xl cursor-pointer ${
                      selectedChat?.chatId === chat.chatId
                        ? "bg-blue-100 dark:bg-black"
                        : "hover:bg-gray-100 hover:dark:bg-black"
                    }`}
                    onClick={() => openChat(chat.chatId)}
                  >
                    {chat.hasNewMessage && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                    <img
                      src={
                        chat?.profileImage
                          ? `${SOCKET_URL + chat?.profileImage}`
                          : "/admin/images/placeHolder.png"
                      }
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold dark:text-white/90">
                        {chat?.fullName ?? "User"}
                      </p>
                      <p className="dark:text-white/90 text-sm">
                        {chat?.email ?? "-"}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={sentinelRef} className="py-1">
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <Spinner small />
                    </div>
                  )}
                  {!hasMore && chats.length > 0 && (
                    <p className="text-center text-xs text-gray-400 dark:text-white/40 py-2">
                      No more chats
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 bg-white dark:bg-white/[0.03] rounded-2xl shadow flex flex-col">
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b">
            {selectedChat ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedChat?.user?.profileImage
                        ? `${SOCKET_URL + selectedChat?.user?.profileImage}`
                        : "/admin/images/placeHolder.png"
                    }
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white/90">
                      {selectedChat?.user?.fullName ?? "User"}
                    </h3>
                  </div>
                </div>

                {/* AI Toggle */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm dark:text-white/90">
                    AI Auto Reply
                  </span>
                  <div
                    onClick={toggleAI}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                      aiEnabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                        aiEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <h3 className="text-gray-400">Select any chat to continue</h3>
            )}
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.senderType === "ADMIN" ? (
                  <div className="flex justify-end">
                    <div className="bg-[#d4af37] text-white px-4 py-2 rounded-xl max-w-sm">
                      {msg.message}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        msg?.user?.profileImage
                          ? `${SOCKET_URL + msg?.user?.profileImage}`
                          : "/admin/images/placeHolder.png"
                      }
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="bg-gray-100 px-4 py-2 rounded-xl">
                      {msg.message}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BOX */}
          {selectedChat && (
            <div className="p-4 border-t flex items-center gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="flex-1 bg-gray-100 px-4 py-4 rounded-xl focus:outline-none dark:bg-black dark:text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
              />
              <button
                className="bg-[#d4af37] text-white p-4 rounded-xl"
                onClick={sendMessage}
              >
                ➤
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small reusable spinner ────────────────────────────────────────────────────
function Spinner({ small = false }: { small?: boolean }) {
  const size = small ? "w-4 h-4 border-2" : "w-6 h-6 border-2";
  return (
    <div
      className={`${size} border-gray-300 border-t-blue-500 rounded-full animate-spin`}
    />
  );
}
