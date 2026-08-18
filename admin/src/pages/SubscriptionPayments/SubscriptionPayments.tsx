import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CopyIcon } from "../../icons";
import { useEffect, useState, useLayoutEffect } from "react";
import { getSubscriptions } from "./_requests";
import { SearchIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "../../components/form/input/SearchInput";

export default function SubscriptionPayments() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [subscriptionPayments, setSubscriptionPayments] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, success, failed

  useLayoutEffect(() => {
    startLoading();
  }, []);

  useEffect(() => {
    if (userInfo) {
      getAllpayments(page);
    }
  }, [page, userInfo, searchKeyword, statusFilter]);

  const getAllpayments = (page: number) => {
    startLoading();
    toast.dismiss();
    
    const params: any = {
      page,
      startDate: "",
      endDate: "",
      userId: "",
      search: searchKeyword,
    };

    // Add isSuccess filter if not 'all'
    if (statusFilter === "success") {
      params.isSuccess = "true";
    } else if (statusFilter === "failed") {
      params.isSuccess = "false";
    }

    getSubscriptions(params)
      .then((response: any) => {
        setSubscriptionPayments(response?.data?.data || []);
        setPagination(response?.data?.pagination || {});
      })
      .catch(() => {
        setSubscriptionPayments([]);
        setPagination({});
        toast.error("Failed to fetch payments");
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getStatusBadge = (payment: any) => {
    if (payment.isSuccess) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Success
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed
        </span>
      );
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Subscription Payments" />
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
            
            {/* Status Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter("all")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-white/[0.05] dark:text-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter("success")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === "success"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-white/[0.05] dark:text-gray-300"
                }`}
              >
                Success
              </button>
              <button
                onClick={() => handleStatusFilter("failed")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  statusFilter === "failed"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-white/[0.05] dark:text-gray-300"
                }`}
              >
                Failed
              </button>
            </div>
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
              <div className="min-w-[1300px]">
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
                          Customer
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Status
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Amount
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Billing
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Paid On
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Plan
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Attempts
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Stripe Subscription Id
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {subscriptionPayments?.length > 0 ? (
                        subscriptionPayments?.map(
                          (payment: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                <div className="relative group max-w-full">
                                  <div className="font-medium">
                                    {payment.user.fullName}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {payment.user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                <div className="flex flex-col gap-1">
                                  {getStatusBadge(payment)}
                                  {!payment.isSuccess && payment.failureReason && (
                                    <div 
                                      className="text-xs text-red-600 dark:text-red-400 cursor-help max-w-[200px] truncate"
                                      title={payment.failureReason}
                                    >
                                      {payment.failureReason}
                                    </div>
                                  )}
                                  {!payment.isSuccess && payment.failureCode && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Code: {payment.failureCode}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {payment?.amountPaid ? (
                                  <div>
                                    <div className={payment.isSuccess ? "" : "line-through text-gray-400"}>
                                      {(payment.amountPaid / 100).toFixed(2)}{" "}
                                      {payment.currency.toUpperCase()}
                                    </div>
                                    {payment.amountDue && payment.amountDue !== payment.amountPaid && (
                                      <div className="text-xs text-gray-400">
                                        Due: {(payment.amountDue / 100).toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-theme-xs">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {formatDate(payment.periodStart)} →{" "}
                                {formatDate(payment.periodEnd)}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {formatDate(payment.createdAt)}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                {payment.subscription?.plan?.title ?? "-"}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <span className={`font-medium ${
                                    payment.attemptCount > 1 
                                      ? "text-orange-600 dark:text-orange-400" 
                                      : ""
                                  }`}>
                                    {payment.attemptCount || 1}
                                  </span>
                                  {payment.attemptCount > 1 && (
                                    <span className="text-xs text-orange-600 dark:text-orange-400">
                                      (retry)
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  {payment.subscription?.stripeSubscriptionId ? (
                                    <>
                                      <span className="truncate max-w-[150px]">
                                        {payment.subscription.stripeSubscriptionId}
                                      </span>
                                      <CopyIcon
                                        className="cursor-pointer flex-shrink-0"
                                        onClick={() => {
                                          toast.dismiss();
                                          const value =
                                            payment.subscription
                                              ?.stripeSubscriptionId ?? "";
                                          if (value) {
                                            navigator.clipboard.writeText(value);
                                            toast.success(
                                              "Stripe Subscription Id copied to clipboard"
                                            );
                                          }
                                        }}
                                      />
                                    </>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            colSpan={8}
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