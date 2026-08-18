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
import { getPlans, deletePlans } from "./_requests";
import HandlePlansModal from "./HandlePlansModal";
import { useModal, useDeleteModal } from "../../hooks/useModal";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, PencilIcon, PlusIcon, SearchIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "../../components/form/input/SearchInput";

const FEATURE_LABELS: Record<string, string> = {
  aiPoweredSearch: "AI Powered Search",
  flightBooking: "Flight Booking",
  hotelBooking: "Hotel Booking",
  restaurantBooking: "Restaurant Booking",
  calendarReminder: "Calendar Reminders",
  emailReminder: "Email Reminders",
  smsReminder: "SMS Reminders",
  bookingHistory: "Booking History",
  smartRecommendations: "Smart Recommendations",
  prioritySupport: "Priority Support",
  earlyFeatureAccess: "Early Feature Access",
  conciergeAccess: "Concierge Access",
};

export default function Plans() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [plans, setPlans] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { isDeleteModalOpen, openDeleteModal, closeDeleteModal } =
    useDeleteModal();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPlans, setSelectedPlans] = useState<any>(null);
  const [selectedDeletedPlans, setSelectedDeletedPlans] = useState<any>(null);

  useLayoutEffect(() => {
    startLoading();
  }, []);

  // __ __ Getting all Plans __ __ //
  useEffect(() => {
    if (userInfo) {
      getAllPlans(page);
    }
  }, [page, userInfo, searchKeyword]);

  const getAllPlans = (page: number) => {
    // startLoading();
    // toast.dismiss();
    getPlans(page, searchKeyword)
      .then((response: any) => {
        setPlans(response?.data?.data);
        setPagination(response?.data?.pagination);
      })
      .catch((error) => {
        setPlans([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleOpenModal = (user: any = null) => {
    setSelectedPlans(user);
    openModal();
  };

  const handleDelete = (user: any = null) => {
    setSelectedDeletedPlans(user);
    openDeleteModal();
  };

  const handleDeletePlans = () => {
    toast.dismiss();
    deletePlans(selectedDeletedPlans?.id)
      .then((response: any) => {
        toast.warning("Plans deleted successfully");
        getAllPlans(page);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      })
      .finally(() => {
        setSelectedDeletedPlans(null);
        closeDeleteModal();
      });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };
  return (
    <>
      <PageBreadcrumb pageTitle="All Plans" />
      <div className="space-y-6">
        <HandlePlansModal
          selectedPlans={selectedPlans}
          onSubmit={(user: any) => {
            getAllPlans(page);
          }}
          isOpen={isOpen}
          // openModal={openModal}
          closeModal={closeModal}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          onSubmit={() => handleDeletePlans()}
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

            {userInfo?.type == "0" || userInfo?.role?.["Plans"]?.add ? (
              <Button
                onClick={() => handleOpenModal()}
                className="text-blue-500 hover:text-[#D4AF37] border hover:bg-transparent transition-all lg:mb-0 md:mb-0 mb-4"
              >
                Add <PlusIcon></PlusIcon>
              </Button>
            ) : null}
          </div>
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
                          Plans
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Description
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Price
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          AI Queries
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Features
                        </TableCell>
                        {userInfo?.type == "0" ||
                        userInfo?.role?.["Plans"]?.update ||
                        userInfo?.role?.["Plans"]?.delete ? (
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
                      {plans?.length > 0 ? (
                        plans?.map((plan: any) => (
                          <TableRow key={plan.id}>
                            {/* Plan Name */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {plan?.title ?? "-"}
                            </TableCell>
                            {/* Description */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="text-theme-sm dark:text-gray-400">
                                {plan?.description ? (
                                  <>
                                    {plan.description.split("").length > 50
                                      ? plan.description
                                          .split(" ")
                                          .slice(0, 7)
                                          .join(" ") + "..."
                                      : plan.description}
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-theme-xs">
                                    No Description
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Price + Duration */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="flex flex-col">
                                <span>
                                  {plan?.price ? `$${plan.price} / Month` : "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="flex flex-col">
                                <span>
                                  {plan?.aiQueryLimit
                                    ? `${plan.aiQueryLimit} / Month`
                                    : "Unlimited"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="flex flex-col gap-1">
                                {/* Boolean Features */}
                                {Object.keys(FEATURE_LABELS).some(
                                  (key) => plan[key]
                                ) ? (
                                  Object.keys(FEATURE_LABELS).map((key) =>
                                    plan[key] ? (
                                      <span key={key} className="block">
                                        {FEATURE_LABELS[key]}
                                      </span>
                                    ) : null
                                  )
                                ) : (
                                  <span className="text-gray-400 text-theme-xs">
                                    No Features
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Actions */}
                            {userInfo?.type == "0" ||
                            userInfo?.role?.["Plans"]?.update ||
                            userInfo?.role?.["Plans"]?.delete ? (
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center min-h-[70px]">
                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Plans"]?.update ? (
                                  <div
                                    onClick={() => handleOpenModal(plan)}
                                    className="text-xl cursor-pointer me-3"
                                  >
                                    <PencilIcon />
                                  </div>
                                ) : null}

                                {userInfo?.type == "0" ||
                                userInfo?.role?.["Plans"]?.delete ? (
                                  <div
                                    onClick={() => handleDelete(plan)}
                                    className="text-xl cursor-pointer"
                                  >
                                    <TrashBinIcon />
                                  </div>
                                ) : null}
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            colSpan={4}
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
          {/* <Pagination pagination={pagination} page={page} setPage={setPage} /> */}
        </ComponentCard>
      </div>
    </>
  );
}
