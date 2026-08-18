import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import { BoxIconLine, MailIcon, ChatIcon, TimeIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getUsersStats } from "../Users/_requests";
import PlansChart from "../UiElements/PlansChart";
import { Link } from "react-router";

export default function Home() {
  const [usersStats, setUsersStats] = useState<any>({});

  useEffect(() => {
    getUsersStats()
      .then((res: any) => setUsersStats(res?.data?.stats))
      .catch(() => setUsersStats({}));
  }, []);
  const dummyPlans = {
    Free: 51,
    Premium: 9,
    Elite: 4,
  };

  return (
    <>
      <PageMeta
        title="BOOKD"
        description="BOOKD, Redefines booking tools, offering seamless access to extraordinary experiences."
      />
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            <Link to="/admin/users" className="hover:opacity-90 transition">
              <div
                className="rounded-2xl p-5 md:p-6 bg-[#f3fff3] border border-[#d7f8d7] dark:bg-white/[0.03] dark:border-white/[0.03]"
                // style={{
                //   backgroundColor: "#f3fff3",
                //   border: "1px solid #d7f8d7",
                // }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <BoxIconLine className="text-green-700 size-6" />
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-green-600">Total Users</span>
                    <h4 className="mt-2 font-bold text-green-800 text-title-sm">
                      {usersStats?.users ?? 0}
                    </h4>
                  </div>
                </div>
              </div>
            </Link>
            <Link
              to="/admin/booking-logs"
              className="hover:opacity-90 transition"
            >
              <div
                className="rounded-2xl p-5 md:p-6 bg-[#f3fff3] border border-[#d7f8d7] dark:bg-white/[0.03] dark:border-white/[0.03]"
                // style={{
                //   backgroundColor: "#f3fff3",
                //   border: "1px solid #d7f8d7",
                // }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <TimeIcon className="text-green-700 size-6" />
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-green-600">
                      Total Booking
                    </span>
                    <h4 className="mt-2 font-bold text-green-800 text-title-sm">
                      {usersStats?.bookings ?? 0}
                    </h4>
                  </div>
                </div>
              </div>
            </Link>
            <Link
              to="/admin/chat-with-agent"
              className="hover:opacity-90 transition"
            >
              <div
                className="rounded-2xl p-5 md:p-6 bg-[#f3fff3] border border-[#d7f8d7] dark:bg-white/[0.03] dark:border-white/[0.03]"
                // style={{
                //   backgroundColor: "#f3fff3",
                //   border: "1px solid #d7f8d7",
                // }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <MailIcon className="text-green-700 size-6" />
                </div>
                <div className="flex items-end justify-between mt-5">
                  <div>
                    <span className="text-sm text-green-600">
                      Agent Requests
                    </span>
                    <h4 className="mt-2 font-bold text-green-800 text-title-sm">
                      {usersStats?.agentChats ?? 0}
                    </h4>
                  </div>
                </div>
              </div>
            </Link>
          </div>
         
        </div>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Link to="/admin/users" className="hover:opacity-90 transition">
          <div className="rounded-2xl p-5 md:p-6 bg-white border border-[#d7f8d7] dark:bg-white/[0.03] dark:border-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
              <BoxIconLine className="text-green-700 size-6" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-[#D4AF37]">Total Users</span>
                <h4 className="mt-2 font-bold text-black dark:text-white/90 text-title-sm">
                  {usersStats?.users ?? 0}
                </h4>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/booking-logs" className="hover:opacity-90 transition">
          <div className="rounded-2xl p-5 md:p-6 bg-white border border-[#d7f8d7] dark:bg-white/[0.03] dark:border-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
              <TimeIcon className="text-green-700 size-6" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-[#D4AF37]">Total Booking</span>
                <h4 className="mt-2 font-bold text-black dark:text-white/90 text-title-sm">
                  {usersStats?.bookings ?? 0}
                </h4>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/chat-with-agent"
          className="hover:opacity-90 transition"
        >
          <div className="rounded-2xl p-5 md:p-6 bg-white border border-[#d7f8d7] dark:bg-white/[0.03] dark:border-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
              <MailIcon className="text-green-700 size-6" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-[#D4AF37]">Agent Requests</span>
                <h4 className="mt-2 font-bold text-black dark:text-white/90 text-title-sm">
                  {usersStats?.agentChats ?? 0}
                </h4>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 mt-6">
        <div className="col-span-12 xl:col-span-5">
          {/* {usersStats?.plans && <PlansChart plans={usersStats?.plans} />} */}
          <div className="dashboard-chart">
          <PlansChart plans={dummyPlans} />
          </div>
        </div>
      </div>
    </>
  );
}
