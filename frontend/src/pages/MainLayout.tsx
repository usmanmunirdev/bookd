import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "../../utils";
import axios from "axios";
import Logo from "../assets/bookd-logo-cropped.svg";
import LoginLogo from "../assets/login-icon.svg";
import { ChevronDown } from "lucide-react";
import { Menu, Settings, LogOut } from "lucide-react";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "";
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const buildSidebarLinks = (plan: any) => {
    const links = [
      { link: "Home", url: "/" },
      { link: "About us", url: "/about-us" },
      { link: "Need to Know", url: "/need-to-know" },
      {
        link: "Your Membership",
        url: "/assistant/settings/membership-billing",
      },
    ];

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

    links.push({
      link: "My Preferences",
      url: "/assistant/settings/personal-preferences",
    });

    return links;
  };

  const links = buildSidebarLinks(user?.subscription?.plan);

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Logout failed");
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: any) => {
    navigate(path);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="relative flex flex-col md:flex-row h-screen w-full ">
        <div className="md:hidden flex justify-between items-center bg-black text-white p-4 w-full">
          <div className="md:w-[65px] w-[50px]">
              <a href="/">
                <img
                  src={Logo}
                  alt="header logo"
                  className="max-w-full h-[60px]"
                />
              </a>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger className="cursor-pointer z-[9999] relative">
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-[320px] md:w-[248px] bg-black text-white h-screen border-none"
            >
              <div className="flex flex-col justify-between items-start px-6 pb-4 pt-10 w-full h-full flex-1">
                <div className="w-full">
                  <div className="font-bold text-2xl uppercase text-[#FFFFFF] mb-[40px] flex justify-start md:w-[90px] w-[70px]">
                      <a href="/">
                        <img
                          src={Logo}
                          alt="header logo"
                          className="max-w-full h-[120px]"
                        />
                      </a>
                  </div>
                  <nav>
                    <ul className="flex flex-col gap-4">
                      {links?.map((link, index) => (
                        <li
                          key={index}
                          className={`cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-gowun flex justify-start ${
                            location.pathname === link.url
                              ? "text-[#D6AF63]" // active
                              : "text-[#C7C7C7]" // inactive
                          }`}
                        >
                          <Link
                            to={link.url}
                            onClick={() => setIsSheetOpen(false)}
                            className="hover:text-[#D6AF63]"
                          >
                            {link.link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
                <div className="flex justify-start w-full">
                  <button
                    onClick={handleLogout}
                    className="flex items-center font-gowun bg-transparent w-[100px] h-[40px] border-none rounded-[34px] cursor-pointer transition-colors duration-200 text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] text-white hover:text-[#D6AF63]"
                  >
                    <span className="xl:me-[15px] lg:me-[10px] me-[10px]">
                      <img
                        src={LoginLogo}
                        alt="header logo"
                        className="max-w-full h-auto"
                      />
                    </span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {location.pathname == "/assistant" ? null : (
            <div
              className="absolute top-[25px] right-[50px] hidden md:block"
              ref={dropdownRef}
            >
              <button
                onClick={() => setIsOpen(!isOpen)}
                className=" flex items-center space-x-2 focus:outline-none"
              >
                <span className="text-white text-[12px] font-bold font-gowun">
                  {user?.fullName ?? initials ?? ""}
                </span>
                <ChevronDown className="text-white w-4 h-4" />
                <img
                  src={
                    user?.profileImage
                      ? `${import.meta.env.VITE_API_BASE_URL.replace(
                          "/api",
                          "",
                        )}${user?.profileImage}`
                      : `https://ui-avatars.com/api/?name=${
                          user?.fullName ? user.fullName : user?.firstName
                        }&background=D6AF63&color=000`
                  }
                  alt="User"
                  className="w-[43px] h-[43px] rounded-[10px] object-cover"
                />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg overflow-hidden z-20">
                  <ul className="text-gray-700">
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        handleNavigation(
                          "/assistant/settings/personal-information",
                        )
                      }
                    >
                      <Settings className="w-4 h-4" />
                      Profile
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <aside className="hidden md:flex flex-col justify-between items-start text-white p-[30px] w-[248px] bg-[#0F0E0E]">
          <div>
            <div className="font-bold text-2xl uppercase text-[#FFFFFF] mb-[70px]">
                <a href="/">
                  <img
                    src={Logo}
                    alt="header logo"
                    className="max-w-full h-[120px]"
                  />
                </a>
            </div>
            <nav>
              <ul className="flex flex-col gap-4">
                {links?.map((link, index) => (
                  <Link key={index} to={link.url}>
                    <li
                      className={`cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-gowun flex items-center gap-2 hover:text-[#D6AF63]
                        ${
                          location.pathname === link.url
                            ? "text-[#D6AF63] "
                            : "text-[#C7C7C7]"
                        }`}
                    >
                      {link.link}
                    </li>
                  </Link>
                ))}
              </ul>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center font-gowun bg-transparent w-[100px] h-[40px] border-none rounded-[34px] cursor-pointer transition-colors duration-200 text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] text-white hover:text-[#D6AF63]"
          >
            <span className="xl:me-[15px] lg:me-[10px] me-[10px]">
              <img
                src={LoginLogo}
                alt="header logo"
                className="max-w-full h-auto"
              />
            </span>
            <span>Logout</span>
          </button>
        </aside>

        <main className="flex-1 overflow-auto scrollbar-hide">
          <Outlet />
        </main>
        {location.pathname == "/assistant" ? null : (
            <div
              className="fixed top-[0px] right-[50px] hidden md:block bg-black md:p-3"
              ref={dropdownRef}
            >
              <button
                onClick={() => setIsOpen(!isOpen)}
                className=" flex items-center space-x-2 focus:outline-none"
              >
                <span className="text-white text-[14px] font-bold font-gowun">
                  {user?.firstName ?? initials ?? ""}
                </span>
                <ChevronDown className="text-white w-4 h-4" />
                <img
                  src={
                    user?.profileImage
                      ? `${import.meta.env.VITE_API_BASE_URL.replace(
                          "/api",
                          "",
                        )}${user?.profileImage}`
                      : `https://ui-avatars.com/api/?name=${
                          user?.fullName ? user.fullName : user?.firstName
                        }&background=D6AF63&color=000`
                  }
                  alt="User"
                  className="w-[43px] h-[43px] rounded-[10px] object-cover"
                />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg overflow-hidden z-20">
                  <ul className="text-gray-700">
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        handleNavigation(
                          "/assistant/settings/personal-information",
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
        )}
      </div>
    </div>
  );
}
export default MainLayout;
