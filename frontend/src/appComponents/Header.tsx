import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Menu, Settings, LogOut } from "lucide-react";
import topImg from "../assets/banner-img.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "../../utils";
import { useNavigate, useLocation } from "react-router-dom";
import Sendres from "../assets/send.svg";
import Micblack from "../assets/microphone-black-shape.svg";
import Search from "../assets/search.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "../assets/bookd-logo-cropped.svg";
import BannerIcon01 from "../assets/banner-icon-01.png";
import BannerIcon02 from "../assets/banner-icon-02.png";
import SearchIcon from "../assets/search-iocn.png";
import AuthModal from "./AuthModal";
import LoginLogo from "../assets/login-icon.svg";

const Header = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Base public links
  const publicLinks = [
    { link: "Home", url: "/" },
    { link: "About Us", url: "/about-us" },
    { link: "Need To Know", url: "/need-to-know" },
    { link: "FAQ", url: "/faq" },
    { link: "Contact Us", url: "/contact-us" },
  ];

  const buildSidebarLinks = (plan: any) => {
    const links = [];

    if (plan?.aiPoweredSearch) {
      links.push({
        link: "Assistant",
        url: "/assistant",
      });
    }

    if (plan?.bookingHistory) {
      links.push({
        link: "Booking Log",
        url: "/assistant/booking-log",
      });
    }

    if (plan?.conciergeAccess) {
      links.push({
        link: "Concierge Chat",
        url: "/assistant/chat-with-agent",
      });
    }

    return links;
  };

  const privateLinks = buildSidebarLinks(user?.subscription?.plan);

  // Authenticated-only links
  // const privateLinks = [
  //   { link: "Your Membership", url: "/assistant/settings/membership-billing" },
  //   { link: "Booking Log", url: "/assistant/booking-log" },
  //   { link: "Concierge", url: "/assistant" },
  //   { link: "My Preferences", url: "/assistant/settings/personal-preferences" },
  // ];

  // Combine based on login state
  const links = isLoggedIn ? [...publicLinks, ...privateLinks] : publicLinks;

  const isHomePage = location.pathname === "/";

  const handleSend = () => {
    localStorage.setItem("searchQuery", inputValue);
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/assistant");
    }
  };

  const handleProtectedRoute = (url: string) => {
    // 🧩 Routes that should bypass login check
    const publicRoutes = [
      "/",
      "/about-us",
      "/need-to-know",
      "/sign-up",
      "/login",
      "/verify-email",
      "/faq",
      "/contact-us",
    ];

    if (publicRoutes.includes(url)) {
      navigate(url);
      return;
    }

    // 🔐 Check login for all other routes
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate(url);
    }
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
  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <div>
      <div
        style={{
          backgroundImage: isHomePage ? `url(${topImg})` : "none",
        }}
        className={`relative ${
          isHomePage
            ? "bg-cover bg-no-repeat xl:h-[756px] lg:h-[700px] md:h-[600px] sm:h-[500px] h-[400px] filter contrast-[1.2]"
            : ""
        }`}
      >
        {isHomePage && (
          <div className="absolute inset-0 bg-[rgba(28,28,28,0.6)]"></div>
        )}
        <div className="container w-full mx-auto">
          <div className="relative z-10 flex justify-between items-center py-7 px-4">
            <div className="font-bold text-2xl uppercase text-[#FFFFFF] md:w-[90px] w-[50px]">
                <a href="/">
                  <img
                    src={Logo}
                    alt="header logo"
                    className="w-[120px] h-[60px]"
                  />
                </a>
            </div>

            <div className="hidden lg:flex">
              <ul className="flex items-center xl:gap-8 lg:gap-4 gap-4">
                {links.map((link, index) => {
                  const isActive = location.pathname === link.url;

                  return (
                    <button
                      key={index}
                      className={`text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun 
          ${isActive ? "text-[#D6AF63]" : "text-white"} 
          hover:text-[#D6AF63]`}
                      onClick={() => handleProtectedRoute(link.url)}
                    >
                      {link.link}
                    </button>
                  );
                })}
              </ul>
            </div>
            <div className="lg:hidden">
              <div className="flex items-center">
                <div className="mr-[30px] lg:hidden">
                  {isLoggedIn ? (
                    <div className="mb-[6px]">
                      <button
                        className="text-[14px] self-start cursor-pointer text-black flex items-center hover:text-white bg-[#D4AF37] hover:bg-[#c59c30] rounded min-w-[50px] h-[30px] px-[10px] transition-colors duration-200"
                        onClick={() => {
                          handleLogout();
                          setIsSheetOpen(false);
                        }}
                      >
                        <span className="xl:me-[15px] lg:me-[10px] me-[10px]">
                          <img
                            src={LoginLogo}
                            alt="header logo"
                            className="max-w-full h-auto"
                          />
                        </span>
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mb-[6px]">
                      <button
                        className="text-[13px] self-start cursor-pointer text-black hover:text-white bg-[#D4AF37] hover:bg-[#c59c30] rounded min-w-[50px] h-[30px] px-[10px] transition-colors duration-200"
                        onClick={() => {
                          handleProtectedRoute("/login");
                          setIsSheetOpen(false);
                        }}
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
                <div className="lg:hidden">
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger className="cursor-pointer">
                      <Menu size={24} color="#fff" />
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="p-0 w-[320px] bg-black text-white"
                    >
                      <div className="flex flex-col h-full px-6 pb-4 pt-10">
                        <div className="font-bold text-2xl uppercase text-[#FFFFFF] flex justify-start mb-[40px] md:w-[90px] w-[70px]">
                            <a href="/">
                              <img
                                src={Logo}
                                alt="header logo"
                                className="max-w-full h-[60px]"
                              />
                            </a>
                        </div>
                        <div className="flex flex-col justify-between flex-1">
                          <ul className="flex flex-col gap-4 ">
                            {links.map((link, index) => {
                              const isActive = location.pathname === link.url;

                              return (
                                <button
                                  key={index}
                                  className={`text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun flex justify-start w-ful
            ${isActive ? "text-[#D6AF63]" : "text-white"} 
            hover:text-[#D6AF63]`}
                                  onClick={() => handleProtectedRoute(link.url)}
                                >
                                  {link.link}
                                </button>
                              );
                            })}
                          </ul>
                          {/* <div className="mt-4">
                          {isLoggedIn ? (
                            <button
                              className="text-[13px] self-start cursor-pointer text-[#C7C7C7] flex items-center hover:text-[#D6AF63]"
                              onClick={() => {
                                handleLogout();
                                setIsSheetOpen(false);
                              }}
                            >
                              <span className="xl:me-[15px] lg:me-[10px] me-[10px]">
                                <img
                                  src={LoginLogo}
                                  alt="header logo"
                                  className="max-w-full h-auto"
                                />
                              </span>
                              Logout
                            </button>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <button
                                className="text-[13px] self-start cursor-pointer text-[#C7C7C7] hover:text-white"
                                onClick={() => {
                                  handleProtectedRoute("/login");
                                  setIsSheetOpen(false);
                                }}
                              >
                                Sign In
                              </button>
                            </div>
                          )}
                        </div> */}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              {isLoggedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-transparent w-[120px] h-[43px] text-[16px] font-bold text-[#FFFFFF] cursor-pointer flex items-center justify-center transition-colors duration-200 object-cover p-2 focus-visible:outline-0">
                      {/* <span className="text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun text-white tracking-wide text-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-colors duration-200 hover:text-[#D4BC6D] truncate">
                        {user.firstName || user.fullName}
                      </span> */}
                      <img
                        src={
                          user?.profileImage
                            ? `${import.meta.env.VITE_API_BASE_URL.replace(
                                "/api",
                                ""
                              )}${user?.profileImage}`
                            : `https://ui-avatars.com/api/?name=${
                                user?.firstName
                                  ? user.firstName
                                  : user?.fullName
                              }&background=D6AF63&color=000`
                        }
                        alt="Avatar"
                        className="w-12 h-12 rounded-full mr-2 border-2 border-[#FFFFFF] shadow-[0_0_12px_rgba(212,188,109,0.6)] transition-transform duration-200 hover:scale-110"
                        loading="lazy"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#2A2A2A]/50 backdrop-blur-[20px] text-white border border-[#2E2D2D]/50 rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] mt-2 animate-slideDownAndFade p-1.5">
                    <DropdownMenuItem
                      onClick={() =>
                        handleProtectedRoute(
                          "/assistant/settings/personal-information"
                        )
                      }
                      className="px-6 text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun text-white hover:bg-[#232323]/80 hover:text-[#D4BC6D] transition-all duration-300 ease-out rounded-[10px] focus:bg-[#232323]/80 focus:text-[#D4BC6D] cursor-pointer flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2E2D2D]/50 my-1.5" />
                    <DropdownMenuItem
                      onClick={() =>
                        handleProtectedRoute(
                          "/assistant/settings/personal-preferences"
                        )
                      }
                      className="px-6 text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun text-white hover:bg-[#232323]/80 hover:text-[#D4BC6D] transition-all duration-300 ease-out rounded-[10px] focus:bg-[#232323]/80 focus:text-[#D4BC6D] cursor-pointer flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      My Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2E2D2D]/50 my-1.5" />
                    <DropdownMenuItem
                      onClick={() =>
                        handleProtectedRoute(
                          "/assistant/settings/membership-billing"
                        )
                      }
                      className="px-6 text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun text-white hover:bg-[#232323]/80 hover:text-[#D4BC6D] transition-all duration-300 ease-out rounded-[10px] focus:bg-[#232323]/80 focus:text-[#D4BC6D] cursor-pointer flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Your Membership
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2E2D2D]/50 my-1.5" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-6 text-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun text-white hover:bg-[#232323]/80 hover:text-[#D4BC6D] transition-all duration-300 ease-out rounded-[10px] focus:bg-[#232323]/80 focus:text-[#D4BC6D] cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => handleProtectedRoute("/login")}
                    className="flex items-center justify-center font-gowun bg-transparent w-[60px] h-[40px] border-none rounded-[34px] cursor-pointer transition-colors duration-200 text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] text-white hover:text-[#D6AF63]"
                  >
                    <span>Sign In</span>
                  </button>

                  <span className="mx-2 text-white">|</span>

                  <button
                    onClick={() => handleProtectedRoute("/sign-up")}
                    className="flex items-center justify-center font-gowun bg-transparent w-[60px] h-[40px] border-none rounded-[34px] cursor-pointer transition-colors duration-200 text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] text-white hover:text-[#D6AF63]"
                  >
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {isHomePage && (
            <div className="relative z-10 flex flex-col gap-2 justify-center items-center xl:h-[calc(756px-300px)] lg:h-[calc(700px-250px)] md:h-[calc(600px-250px)] sm:h-[calc(500px-200px)] h-[calc(400px-180px)] px-4">
              <h1
                className="xl:text-[80px] xl:leading-[91px] lg:text-[70px] lg:leading-[81px] md:text-[60px] md:leading-[71px] sm:text-[50px] sm:leading-[61px] text-[30px] leading-[41px] font-carien text-center text-white xl:max-w-[800px] lg:max-w-[700px] md:max-w-[650px] sm:max-w-[600px] max-w-[350px] "
                data-aos="fade-right"
                data-aos-duration="2000"
              >
                Book, Plan & Stay Inspired{" "}
                <span className="text-[#D4AF37]">with AI</span>
              </h1>

              <div
                className="w-full lg:max-w-[640px] sm:max-w-[540px] max-w-[300px] lg:h-[80px] md:h-[60px] h-[50px] mt-6 rounded-[16px] bg-white/90 backdrop-blur-[18px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex items-center lg:px-6 md:px-4 px-2 border-4 focus-within:border-[4px] focus-within:border-[#86b7fe] ffocus-within:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]"
                data-aos="fade-up"
                data-aos-duration="3000"
              >
                {/* 🔍 Left Icon */}
                <div className="cursor-pointer lg:mr-5 md:mr-4 mr-2 flex-shrink-0">
                  <img
                    src={Search}
                    alt="search icon"
                    className="lg:w-[28px] w-[20px] lg:h-[28px] h-[20px]"
                  />
                </div>

                {/* 📝 Input Field */}
                <div className="flex-1">
                  <input
                    placeholder="Where do you want to go?"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    className="bg-transparent border-none outline-none w-full xl:text-[18px] lg:text-[16px] text-[14px] font-gowun text-black placeholder:text-gray-500 placeholder:font-light"
                  />
                </div>

                {/* 🎯 Right Icons */}
                <div className="flex items-center lg:gap-3 gap-2 ml-3">
                  <div
                    className="lg:h-[40px] h-[30px] lg:w-[40px] w-[30px] rounded-[10px] bg-[#272B34] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={handleSend}
                  >
                    <img
                      src={Micblack}
                      alt="icon 2"
                      className="lg:w-[20px] w-[15px] lg:h-[20px] h-[15px]"
                    />
                  </div>
                  <div
                    className="lg:h-[40px] h-[30px] lg:w-[40px] w-[30px] rounded-[10px] bg-[#272B34] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={handleSend}
                  >
                    <img
                      src={Sendres}
                      alt="icon 1"
                      className="lg:w-[20px] w-[15px] lg:h-[20px] h-[15px]]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default Header;
