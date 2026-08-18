import { cn } from "@/lib/utils";
import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../utils";

const SettingsLayout = () => {
  const { user } = useAuth();

  const buildSidebarLinks = (plan: any) => {
    const links = [
      { label: "Personal information", path: "personal-information" },
      { label: "Personal Preferences", path: "personal-preferences" },
      // { label: "Notifications", path: "notification" },
      { label: "Membership Billing", path: "membership-billing" },
    ];

    if (plan?.calendarReminder) {
      links.push({
        label: "Calendar Integration",
        path: "calendar-integration",
      });
    }

    return links;
  };

  const settingsKeys = buildSidebarLinks(user?.subscription?.plan);

  // const settingsKeys = [
  //   { label: "Personal information", path: "personal-information" },
  //   { label: "Personal Preferences", path: "personal-preferences" },
  //   { label: "Notifications", path: "notification" },
  //   { label: "Calendar Integration", path: "calendar-integration" },
  //   { label: "Membership Billing", path: "membership-billing" },
  // ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 * 0.1 }}
    >
      <div className="bg-[#000000] min-h-screen lg:py-[100px] md:py-[80px] sm:py-[60px] py-[40px]">
        <div className="container mx-auto xl:py-[16px] xl:px-[40px] lg:px-[35px] md:px-[30px] sm:px-[20px] px-[16px]">
          <h2 className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] tex-[28px] font-normal text-white font-carien mb-[20px] sm:mb-[30px]">
            Settings
          </h2>
          <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap pb-4">
            {settingsKeys.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "px-[29px] py-[15px] rounded-[45px] border border-[#D4AF37] text-white flex justify-center items-center  text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-gowun leading-[100%] cursor-pointer text-center",
                    isActive && "bg-[#D4AF37] text-[#0A0F19]"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsLayout;
