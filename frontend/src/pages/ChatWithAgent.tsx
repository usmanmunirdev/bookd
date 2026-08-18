import { FaCheck, FaXmark } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "@/appComponents/Loader";
import BannerIcon01 from "../assets/banner-icon-01.png";
import BannerIcon02 from "../assets/banner-icon-02.png";
import { motion } from "framer-motion";
import { useAuth } from "../../utils";
import Sendres from "../assets/send.svg";
import Micblack from "../assets/microphone-black-shape.svg";

const API = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = API.replace("/api", "");

type Message = {
  id: string;
  chatId: string;
  senderType: "USER" | "ADMIN";
  message: string;
};

const ChatWithAgent = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const [chatId, setChatId] = useState<string>(
    localStorage.getItem("chatId") || ""
  );

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server", chatId);
      if (chatId) socket.emit("joinThread", chatId);
    });

    socket.on("newMessage", (msg) => {
      console.log("Received message:", msg);
      if (msg.chatId == chatId && msg.senderType === "ADMIN") {
        setMessages((prev) => [...prev, msg]);

        // socket.emit("markAsRead", {
        //   chatId,
        //   readerType: "USER",
        // });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    if (socketRef.current && chatId) {
      socketRef.current.emit("joinThread", chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    fetchPreviousMessages();
  }, [chatId]);

  const fetchPreviousMessages = async () => {
    try {
      const savedChatId = localStorage.getItem("chatId");
      if (!savedChatId) return;
      setIsFetching(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `${API}/chat-with-agent/thread/${savedChatId}?side=USER`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      toast.error("Failed to load previous messages");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSend = async (value?: string) => {
    const messageText = value || input;
    if (!messageText.trim()) return;

    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const savedChatId = localStorage.getItem("chatId");

      // send message to UI immediately
      const tempMessage: Message = {
        id: uuidv4(),
        chatId: savedChatId || "",
        senderType: "USER",
        message: messageText,
      };
      setMessages((prev) => [...prev, tempMessage]);

      // API call → send chatId if it exists
      const { data } = await axios.post(
        `${API}/chat-with-agent/user`,
        {
          chatId: savedChatId || undefined,
          message: messageText,
          userId: user?.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.chatId) {
        if (socketRef.current) {
          socketRef.current.emit("joinThread", chatId);
          // socketRef.current?.emit("sendMessage", tempMessage);
        }
        localStorage.setItem("chatId", data.chatId);
        setChatId(data.chatId);
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!isSpeechSupported) return alert("Speech recognition not supported");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleCancelVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInput("");
  };

  const handleConfirmVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    handleSend(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#000] w-full flex flex-col lg:pt-[100px] md:pt-[80px] pt-[10px] pb-[20px] md:h-screen h-[calc(100vh-108px)]"
    >
      <div className="container mx-auto flex flex-col justify-between max-h-[830px] h-full pr-2 pl-2 relative">
        {/* Messages Area */}
        <div
          ref={chatBoxRef}
          className={`px-4 pt-[10px] py-3 space-y-3 flex flex-col pb-[170px] ${messages.length===0 ? "h-full" :  ""}` }
        >
          {isFetching ? (
            <div className="flex flex-col justify-center gap-4">
              {[1, 2, 3, 4, 5].map((_, i) => {
                const isRight = i % 2 === 0;

                return (
                  <div
                    key={i}
                    className={`
          w-full max-w-[75%]
          px-4 py-3
          rounded-xl shadow-lg
          ${isRight ? "ml-auto rounded-br-none" : "mr-auto rounded-bl-none"}
        `}
                  >
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 w-[95%] bg-[#656565] rounded"></div>
                      <div className="h-4 w-[60%] bg-[#656565] rounded"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center flex-col mb-[20px] h-full">
              <h2 className="font-bold text-[#D4AF37] text-center mb-0 xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] pb-2">
                Welcome to Support!
              </h2>
              <p className="text-white text-center">
                Describe the issue you are facing in the message field below.
                Our team is standing by to help you.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex w-full ${
                    msg.senderType === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[75%] px-4 py-2 rounded-xl shadow-lg break-words ${
                      msg.senderType === "USER"
                        ? `self-end bg-[#D4AF37] text-black text-left
         after:content-[''] after:absolute after:top-0 after:-right-[10px]
         after:w-0 after:h-0 after:border-t-0 after:border-r-0 after:border-b-[10px] after:border-l-[20px] after:border-l-[#D4AF37] after:border-transparent
         rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]`
                        : `self-start bg-[#1E1E1E] text-white text-left
         after:content-[''] after:absolute after:top-0 after:-left-[10px]
         after:w-0 after:h-0 after:border-t-0 after:border-l-[1px] after:border-b-[10px] after:border-r-[10px] after:border-r-[#1E1E1E] after:border-transparent
         rounded-tl-[0px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]`
                    }`}
                  >
                    {msg.message ? (
                      msg.message
                    ) : (
                      <div className="space-y-2 overflow-hidden">
                        <div className="h-4 w-48 rounded bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 animate-shimmer"></div>
                        <div className="h-4 w-36 rounded bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 animate-shimmer"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* ======= Loader at end (inside chat box) ======= */}
              {loading && (
                <div className="self-start py-3 rounded-[50px] w-fit max-w-[80%] flex items-center">
                  <div className="flex items-center animate-fadeIn">
                    <p className=" w-[10px] h-[10px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[13px] font-normal font-gowun text-white animate-pulse whitespace-nowrap">
                      Agent is typing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>
        <div className=" fixed bottom-4  md:left-[248px] left-0 right-0 mx-auto w-full lg:max-w-[800px] md:max-w-[500px] max-w-[450px] px-3 z-30">
          <div className="w-full border border-[#333333] rounded-[27px] p-4 mt-3 bg-[#141414]  pl-2 pr-2 mb-0">
            <div className="relative">
              <textarea
                rows={1}
                placeholder={
                  isListening
                    ? "Listening..."
                    : "Ask a question or describe your issue..."
                }
                className="flex-1  bg-transparent text-white outline-none px-3 resize-none rounded-[20px] overflow-y-auto transition-all duration-200 w-full mb-[20px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px] font-normal font-gowun"
                style={{ maxHeight: "100px" }}
                value={input}
                disabled={loading}
                // onChange={(e) => setInput(e.target.value)}
                onChange={(e) => {
                  setInput(e.target.value);

                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex items-center gap-2 justify-end mr-[15px]">
                {/* Mic / Voice Controls */}
                {!isListening ? (
                  <img
                    src={Micblack}
                    alt="mic"
                    className="cursor-pointer w-5 h-5 transition mr-2"
                    onClick={handleMicClick}
                  />
                ) : (
                  <div className="flex gap-2">
                    <FaCheck
                      className="cursor-pointer text-[#D4AF37] w-6 h-6"
                      onClick={handleConfirmVoice}
                    />
                    <FaXmark
                      className="cursor-pointer text-[#D4AF37] w-6 h-6"
                      onClick={handleCancelVoice}
                    />
                  </div>
                )}

                {/* Send Button */}
                <img
                  src={Sendres}
                  alt="send"
                  className="cursor-pointer w-5 h-5 transition mr-2 "
                  onClick={() => handleSend()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatWithAgent;
