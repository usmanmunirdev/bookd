import { FaCheck, FaXmark } from "react-icons/fa6";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils";
import Loader from "@/appComponents/Loader";
import { motion } from "framer-motion";
import HotelSlider from "../appComponents/HotelSlider";
import FlightSlider from "../appComponents/FlightSlider";
import BannerIcon01 from "../assets/banner-icon-01.png";
import BannerIcon02 from "../assets/banner-icon-02.png";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Micblack from "../assets/microphone-black-shape.svg";
import Sendres from "../assets/send.svg";
import { Navigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

type Message = {
  type: "user" | "system";
  text: string;
  hotels?: any[];
  flights?: any[];
  hotelIntent?: any;
  flightIntent?: any;
};

const Assistant = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [chatPreviews, setChatPreviews] = useState<any[]>([]);
  const savedTranscriptRef = useRef("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const [openNewChat, setOpenNewChat] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const newChatRef = useRef<any | null>(null);
  const profileRef = useRef<any | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        !newChatRef.current?.contains(e.target) &&
        !profileRef.current?.contains(e.target)
      ) {
        setOpenNewChat(false);
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Scroll to bottom when new messages appear
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ Auto-trigger a stored search query
  useEffect(() => {
    let searchQuery = localStorage.getItem("searchQuery");
    if (searchQuery) {
      setInput(searchQuery);
      handleSend(searchQuery);
    }
    localStorage.removeItem("searchQuery");
  }, []);

  useEffect(() => {
    getPreviousMessages();
    getUserPreviews();
  }, []);

  // ✅ Check if Speech Recognition is supported
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSpeechSupported(true);
    } else {
      console.warn("Speech Recognition not supported in this browser.");
      setIsSpeechSupported(false);
    }
  }, []);

  const showIntro = !loading && messages.length === 0;

  // ✅ Send message function
  const handleSend = async (searchQuery?: string) => {
    const value = searchQuery || input;
    if (!value.trim()) return;
    setInput("");
    try {
      setLoading(true);
      setMessages((prev) => [...prev, { type: "user", text: value }]);

      const token = localStorage.getItem("authToken");
      let threadId = localStorage.getItem("threadId");

      if (!threadId) {
        threadId = uuidv4();
        localStorage.setItem("threadId", threadId);
      }

      const res = await axios.post(
        `${API}/chat`,
        { prompt: value, threadId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }
      );

      if (res?.data) {
        setMessages((prev) => {
          const parsedIntent = res.data?.parsedIntent;

          const intentsArray = Array.isArray(parsedIntent?.intents)
            ? parsedIntent.intents
            : parsedIntent
            ? [parsedIntent]
            : [];
          console.log("intentsArray", intentsArray);
          return [
            ...prev,
            {
              type: "system",
              text: res.data?.response || res.data?.message,
              hotels: Array.isArray(res.data.hotelRecord)
                ? res.data.hotelRecord
                : [],
              flights: Array.isArray(res.data.flightRecord)
                ? res.data.flightRecord
                : [],
              hotelIntent:
                intentsArray.find((i: any) => i.intent === "hotel_search") ||
                null,
              flightIntent:
                intentsArray.find((i: any) => i.intent === "flight_search") ||
                null,
            },
          ];
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
      getUserPreviews();
    }
  };

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    // Stop listening if already active
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

    recognition.onstart = () => {
      setIsListening(true);
      // Do NOT clear savedTranscriptRef — continue where we left off
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Chrome auto-restarts on silence → do NOT clear transcript
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Add final transcript permanently
      if (finalTranscript) {
        savedTranscriptRef.current =
          savedTranscriptRef.current + finalTranscript + " ";
      }

      // Live text = saved + interim
      setInput(savedTranscriptRef.current + interimTranscript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleCancelVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);

    // Reset everything
    savedTranscriptRef.current = "";
    setInput("");
  };

  const handleConfirmVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);

    // Send the final combined transcript
    handleSend(savedTranscriptRef.current.trim());

    // Reset after sending
    savedTranscriptRef.current = "";
    setInput("");
  };

  const processSuggestion = (text: any) => {
    const today = new Date();

    // Find next weekend
    const nextSaturday = new Date(today);
    nextSaturday.setDate(
      today.getDate() + ((6 - today.getDay() + 7) % 7 || 7) // Next Saturday
    );

    const nextMonday = new Date(nextSaturday);
    nextMonday.setDate(nextSaturday.getDate() + 2); // 2-day checkout

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 2);

    // Format function
    const format = (d: any) => d.toISOString().split("T")[0];

    // Replace depending on which suggestion was clicked
    if (text.includes("next weekend")) {
      return `Find a luxury hotel in Paris from ${format(
        nextSaturday
      )} to ${format(nextMonday)}.`;
    }

    if (text.includes("flight") && text.includes("tomorrow")) {
      return `Book a flight from New York to London on ${format(tomorrow)}.`;
    }

    if (text.includes("family-friendly resorts")) {
      return `Find some family-friendly resorts in Dubai for dates ${format(
        nextSaturday
      )} to ${format(nextMonday)}.`;
    }

    if (text.includes("rooftop views")) {
      return `Show me top hotels in Dubai with rooftop views for ${format(
        nextSaturday
      )} to ${format(nextMonday)}.`;
    }

    return text;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto"; // reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // adjust to content
  };

  const getPreviousMessages = async (threadIdForData?: string) => {
    const token = localStorage.getItem("authToken");
    let threadId = localStorage.getItem("threadId");

    // if (!threadId) {
    //   threadId = uuidv4();
    //   localStorage.setItem("threadId", threadId);
    // }

    if (!threadId || !token) return;

    try {
      setPageLoader(true);

      const res = await axios.get(
        `${API}/chat/thread/${threadIdForData ?? threadId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.messages && Array.isArray(res.data.messages)) {
        const hydratedMessages = res.data.messages.flatMap((m: any) => {
          const parsedIntent = m.parsedIntent;

          const intentsArray = Array.isArray(parsedIntent?.intents)
            ? parsedIntent.intents
            : parsedIntent
            ? [parsedIntent]
            : [];

          return [
            { type: "user", text: m.prompt },
            {
              type: "system",
              text: m.response,
              hotels: Array.isArray(m.hotelRecord) ? m.hotelRecord : [],
              flights: Array.isArray(m.flightRecord) ? m.flightRecord : [],
              hotelIntent:
                intentsArray.find((i: any) => i.intent === "hotel_search") ||
                null,
              flightIntent:
                intentsArray.find((i: any) => i.intent === "flight_search") ||
                null,
            },
          ];
        });

        setMessages(hydratedMessages);
      }
    } catch (err) {
      console.error("Error fetching previous messages:", err);
    } finally {
      setPageLoader(false);
    }
  };

  const getUserPreviews = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) return;

    try {
      const res = await axios.get(`${API}/chat/preview`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data) {
        setChatPreviews(res.data);
      }
    } catch (err) {
      console.error("Error fetching previous previews:", err);
    }
  };

  const handleNewChat = () => {
    localStorage.removeItem("threadId");
    setMessages([]);
    setInput("");
    savedTranscriptRef.current = "";
  };

  const handleNavigation = (path: any) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Logout failed");
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <motion.div
      key="assistant"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`bg-cover bg-center bg-no-repeat w-full flex flex-col bg-[#000000] lg:pt-[90px] md:pt-[80px] h-auto overflow-y-auto  ${
        messages?.length == 0 ? " pt-[40px]" : "pt-[20px]"
      }  pb-[170px]  `}
    >
      <div className="relative">
        <div
          className="
      fixed md:top-[0px] sm:top-[30px] md:left-[248px] right-0 left-0
      px-[20px] md:px-[40px]
      flex justify-center md:justify-between items-center
      z-20  header-chat-drop 
    "
        >
          <div className="container m-auto">
            <div className="flex md:justify-between justify-center md:bg-[#0F0E0E] bg-transparent md:p-3 ">
              {/* LEFT / CENTER — New Chat & Select Chat */}
              <div
                className="relative flex items-center gap-2 mr-3"
                ref={newChatRef}
              >
                <button
                  onClick={() => {
                    handleNewChat();
                    setOpenNewChat(false);
                    setOpenProfile(false);
                  }}
                  className="
          px-4 py-2 rounded-xl border border-[#333]
          bg-[#0F0E0E] text-white
          hover:border-[#D4AF37] transition
          lg:text-[14px] text-[12px] header-chat-btn whit whitespace-nowrap cursor-pointer
        "
                >
                  + New Chat
                </button>

                <button
                  onClick={() => {
                    setOpenNewChat(!openNewChat);
                    setOpenProfile(false);
                  }}
                  className="
          flex items-center gap-2 px-4 py-2 max-w-[220px]
          rounded-xl border border-[#333] bg-[#0F0E0E]
          text-white hover:border-[#D4AF37]
          transition truncate cursor-pointer
        "
                >
                  <span className="truncate lg:text-[14px] font-gowun text-[12px]">
                    {chatPreviews.find(
                      (item) =>
                        localStorage.getItem("threadId") === item.threadId
                    )?.title || "Your Chats"}
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>

                {openNewChat && (
                  <div
                    className="
            absolute left-0 top-full mt-3 w-64
            bg-[#111] border border-[#333]
            rounded-xl shadow-lg overflow-hidden
            z-50
          "
                  >
                    {chatPreviews?.length ? (
                      chatPreviews.map((item, i) => (
                        <div
                          key={i}
                          className={`
                  px-4 py-3 text-[13px] cursor-pointer truncate
                  transition
                  hover:bg-[#1E1E1E] hover:text-[#D4AF37]
                  ${
                    localStorage.getItem("threadId") == item.threadId
                      ? "bg-[#1E1E1E] text-[#D4AF37]"
                      : "text-gray-300"
                  }
                `}
                          onClick={() => {
                            localStorage.setItem("threadId", item.threadId);
                            getPreviousMessages(item.threadId);
                            setOpenNewChat(false);
                          }}
                          title={item.title}
                        >
                          {item.title || "Untitled chat"}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-[13px] text-gray-500">
                        No chats yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT — Profile (hidden on mobile) */}
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => {
                    setOpenProfile(!openProfile);
                    setOpenNewChat(false);
                  }}
                  className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                >
                  <span className="text-white text-[14px] font-bold font-gowun cursor-pointer">
                    {user?.firstName ?? initials ?? ""}
                  </span>
                  <ChevronDown className="text-white w-4 h-4" />
                  <img
                    src={
                      user?.profileImage
                        ? `${import.meta.env.VITE_API_BASE_URL.replace(
                            "/api",
                            ""
                          )}${user?.profileImage}`
                        : `https://ui-avatars.com/api/?name=${
                            user?.fullName ? user.fullName : user?.firstName
                          }&background=D6AF63&color=000`
                    }
                    alt="User"
                    className="w-[43px] h-[43px] rounded-[10px] object-cover"
                  />
                </button>

                {openProfile && (
                  <div
                    className="
            absolute right-0 mt-3 w-40
            bg-white rounded-lg shadow-lg
            overflow-hidden z-20
          "
                  >
                    <ul className="text-gray-700">
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          handleNavigation(
                            "/assistant/settings/personal-information"
                          )
                        }
                      >
                        Profile
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={handleLogout}
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {pageLoader ? (
        <div
          className={`container mx-auto xl:py-[16px] xl:px-[40px] lg:px-[35px] md:px-[30px] sm:px-[20px] px-[16px] flex flex-col overflow-y-auto pb-0`}
        >
          <div className="flex flex-col gap-4">
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
        </div>
      ) : (
        <div
          className={`container mx-auto xl:py-[16px] xl:px-[40px] lg:px-[35px] md:px-[30px] sm:px-[20px] px-[16px] flex flex-col h-full pb-[100px] ${
            messages?.length == 0 ? " justify-center" : ""
          }`}
        >
          {(showIntro || messages?.length == 0) && (
            <div className="max-w-[800px] m-auto mb-0 lg:mt-[20px] mt-[80px]">
              {showIntro && (
                <div className="text-center space-y-3">
                  <h2 className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-carien text-[#D4AF37]">
                    Hello {user?.firstName ?? ""}!
                  </h2>
                  <h1 className="xl:text-[32px] lg:text-[31px] md:text-[30px] text-[20px] font-normal text-white mb-[30px]">
                    Your AI Travel Concierge. Anywhere. Anytime.
                  </h1>

                  <div className="grid grid-cols-2 gap-4 lg:mb-[50px] mb-[40px]">
                    {[
                      "Find a luxury hotel in Paris next weekend.",
                      "Show me top hotel in Dubai with rooftop views.",
                      "Book a flight from New York to London day after tomorrow.",
                      "What are some family-friendly resorts in Dubai?",
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        className="text-white hover:text-[#D4AF37] text-[14px] md:text-[18px] font-gowun transition-colors duration-200 border-1 border-solid px-[15px] py-[20px] cursor-pointer bg-[#0F0E0E] rounded-2xl border-[#333333] hover:border-[#D4AF37]"
                        onClick={() =>
                          handleSend(processSuggestion(suggestion))
                        }
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {messages?.length > 0 ? (
            <div
              className={`flex-1 ${messages?.length == 0 ? " " : ""} px-[20px]`}
              ref={chatBoxRef}
            >
              <div className="flex flex-col gap-4 justify-end mt-[50px]">
                {messages.map((msg: any, index) => (
                  <div key={index} className="flex flex-col">
                    <div
                      className={`relative max-w-[75%] px-4 py-2 rounded-xl shadow-lg break-words 
      ${
        msg.type === "user"
          ? `self-end bg-[#D4AF37] text-black text-left
         after:content-[''] after:absolute after:top-0 after:-right-[10px]
         after:w-0 after:h-0 after:border-t-0 after:border-r-0 after:border-b-[10px] after:border-l-[20px] after:border-l-[#D4AF37] after:border-transparent  rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]`
          : `self-start bg-[#1E1E1E] text-white text-left
         after:content-[''] after:absolute after:top-0 after:-left-[10px]
         after:w-0 after:h-0 after:border-t-0 after:border-l-[1px] after:border-b-[10px] after:border-r-[10px] after:border-r-[#1E1E1E] after:border-transparent  rounded-tl-[0px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]`
      }`}
                    >
                      {msg.text}
                    </div>

                    {msg?.flights?.length > 0 && (
                      <div className={`mt-4`}>
                        <FlightSlider
                          flights={msg.flights}
                          intent={msg.flightIntent}
                        />
                      </div>
                    )}

                    {msg?.hotels?.length > 0 && (
                      <div className={`mt-4`}>
                        <HotelSlider
                          hotels={msg.hotels}
                          intent={msg.hotelIntent}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="self-start py-3 rounded-[50px] w-fit max-w-[80%] flex items-center">
                    <Loader />
                  </div>
                )}
              </div>
              <div ref={bottomRef} />
            </div>
          ) : null}
        </div>
      )}
      <div className="fixed bottom-[0px] left-0 md:left-[248px] right-0 mx-auto w-full lg:max-w-[800px] md:max-w-[500px] max-w-[450px] px-3 z-30">
        <div className="w-full mb-4 mt-0 ">
          <div className="relative">
            <div className="flex-1 p-4 pl-2 pr-2 w-full border rounded-[27px] border-[#333333] relative mt-4 bg-[#0F0E0E]">
              <textarea
                rows={1}
                placeholder={
                  isListening ? "Listening..." : "Where do you want to go next?"
                }
                className="px-2 h-[45px] mb-[20px] w-full bg-transparent text-white outline-none placeholder:text-[#656565] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px] font-normal font-gowun resize-none scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-transparent pr-[20px]"
                style={{ maxHeight: "100px" }}
                disabled={loading}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
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
            </div>

            <div className="flex justify-between items-center px-[30px] absolute w-full bottom-[10px]">
              {/* <div className="w-[30px] h-[26px] flex justify-center items-center rounded-[4px]" /> */}
              <div className="flex justify-end w-full items-center gap-2 pb-2">
                {/* 🎙️ Mic Button */}
                {!isListening ? (
                  <div
                    className="h-[20px] w-[20px] cursor-pointer transition-all duration-300 mr-2"
                    onClick={handleMicClick}
                    title="Start voice input"
                  >
                    <img
                      src={Micblack}
                      alt="mic icon"
                      className="max-w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <FaCheck
                      onClick={handleConfirmVoice}
                      className="text-[#D4AF37] cursor-pointer hover:text-green-400 transition"
                      size={18}
                      title="Confirm voice"
                    />
                    <FaXmark
                      onClick={handleCancelVoice}
                      className="text-[#D4AF37] cursor-pointer hover:text-red-400 transition"
                      size={18}
                      title="Cancel voice"
                    />
                  </div>
                )}

                {/* 📤 Send Button */}
                <div
                  className="h-[20px] w-[20px] cursor-pointer"
                  onClick={() => handleSend()}
                >
                  <img
                    src={Sendres}
                    alt="send icon"
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Assistant;
