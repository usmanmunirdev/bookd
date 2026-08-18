import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  LockIcon,
  GroupIcon,
  FileIcon,
  ChatIcon,
  TaskIcon,
  EnvelopeIcon,
  InfoIcon,
  SearchIcon,
  DollarLineIcon,
  TermCondition,
  PrivacyIcon,
  FaqIcon,
  ChatMessages,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth";
import { getUserByToken } from "../pages/Users/_requests";
import { useLoader } from "../hooks/useLoader";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?:
    | { name: string; path: string; pro?: boolean; new?: boolean }[]
    | undefined;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    name: "Users",
    icon: <GroupIcon />,
    subItems: [
      { name: "Admin User", path: "/admin/admin-users", pro: false },
      { name: "Users", path: "/admin/users", pro: false },
    ],
  },
  {
    name: "Roles & Permissions",
    icon: <LockIcon />,
    subItems: [
      { name: "Roles", path: "/admin/roles", pro: false },
      { name: "Permissions", path: "/admin/permissions", pro: false },
    ],
  },
  {
    name: "Plans",
    icon: <FileIcon />,
    path: "/admin/plans",
  },
  {
    name: "Subscription Payments",
    icon: <DollarLineIcon />,
    path: "/admin/subscription-payments",
  },
  {
    name: "Booking Logs",
    icon: <TaskIcon />,
    path: "/admin/booking-logs",
  },
  {
    name: "Chat Track",
    icon: <ChatIcon />,
    path: "/admin/chat-track",
  },
  {
    name: "User Messages",
    icon: <ChatMessages />,
    path: "/admin/chat-with-agent",
  },
  {
    name: "FAQs",
    icon: <FaqIcon />,
    path: "/admin/faqs",
  },
  {
    name: "Contact Queries",
    icon: <EnvelopeIcon />,
    path: "/admin/contact-queries",
  },
  {
    name: "Terms & Conditions",
    icon: <TermCondition />,
    path: "/admin/terms-and-conditions",
  },
  {
    name: "Privacy Policy",
    icon: <PrivacyIcon />,
    path: "/admin/privacy-policy",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();
  const { loading, startLoading, stopLoading } = useLoader();
  const location = useLocation();
  const { token } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    if (token) {
      startLoading();
      getUserByToken(token)
        .then((response: any) => {
          let user = response?.data?.user || {};
          let permissionsArray = user?.role?.permissions || [];

          const permissionsObject = permissionsArray.reduce(
            (acc: any, perm: any) => {
              acc[perm.name] = perm.actions;
              return acc;
            },
            {}
          );
          user.role = permissionsObject;
          setUserInfo(user);
        })
        .catch((error) => {
          setUserInfo({});
        })
        .finally(() => {
          stopLoading();
        });
    }
  }, [token]);

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = filteredNavItems;
      items.forEach((nav: any, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem: any) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[] | any, menuType: "main") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav: any, index: number) => (
        <li key={index}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-black dark:text-white "
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                onClick={() => {
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem: any, index: number) => (
                  <li key={index}>
                    <Link
                      to={subItem.path}
                      onClick={() => {
                        if (isMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const getFilteredNavItems = (items: NavItem[], userInfo: any) => {
    if (userInfo?.type == "0") {
      return items;
    }

    return items
      .map((item) => {
        const canViewMain = userInfo?.role?.[item.name]?.view ?? false;

        const filteredSubItems = item.subItems
          ? item.subItems.filter((subItem) => {
              const canViewSub = userInfo?.role?.[subItem.name]?.view ?? false;
              return canViewSub;
            })
          : [];

        if (canViewMain || filteredSubItems.length > 0) {
          return {
            ...item,
            subItems:
              filteredSubItems.length > 0 ? filteredSubItems : undefined,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredNavItems = getFilteredNavItems(navItems, userInfo);

  return (
    <React.Fragment>
      {/* {loading ? (
        <Loader />
      ) : ( */}
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[270px]"
            : isHovered
            ? "w-[270px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
        // style={{
        //   backgroundColor: document.documentElement.classList.contains("dark")
        //     ? undefined
        //     : "#ffffff",
        //   borderRightColor: document.documentElement.classList.contains("dark")
        //     ? undefined
        //     : "#e4e7ec",
        // }}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`py-8 flex ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
          }`}
        >
          <Link to="/admin">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <img
                  className="dark:hidden "
                  src="/admin/images/logo/bookd-logo-cropped.svg"
                  alt="Logo"
                  width={100}
                  height={60}
                />
                <img
                  className="hidden dark:block"
                  src="/admin/images/logo/bookd-logo-cropped.svg"
                  alt="Logo"
                  width={100}
                  height={60}
                />
              </>
            ) : (
              <img
                src="/admin/images/logo/bookd-logo-cropped.svg"
                alt="Logo"
                width={100}
                height={60}
              />
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    ""
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(filteredNavItems, "main")}
              </div>
              {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
            </div>
          </nav>
        </div>
      </aside>
      {/* )} */}
    </React.Fragment>
  );
};

export default AppSidebar;
