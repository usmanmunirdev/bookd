import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import { getBookingLogs } from "./_requests";
import { SearchIcon } from "../../icons";
import { useLoader } from "../../hooks/useLoader";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "../../components/form/input/SearchInput";

export default function BookingLogs() {
  const { userInfo } = useAuth();
  const { loading, startLoading, stopLoading } = useLoader();
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({});
  const [bookingLogs, setBookingLogs] = useState<any>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // __ __ Getting all Booking Logs __ __ //
  useEffect(() => {
    if (userInfo) {
      getAllBookingLogs(page);
    }
  }, [page, userInfo, searchKeyword]);

  const getAllBookingLogs = (page: number) => {
    startLoading();
    getBookingLogs(page, searchKeyword)
      .then((response: any) => {
        setBookingLogs(response?.data?.data);
        setPagination(response?.data?.pagination);
      })
      .catch((error) => {
        setBookingLogs([]);
        setPagination({});
      })
      .finally(() => {
        stopLoading();
      });
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };
  return (
    <>
      <PageBreadcrumb pageTitle="All Booking Logs" />
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
                          User
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Booking Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Details
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
                          Created At
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {bookingLogs?.length > 0 ? (
                        bookingLogs?.map((booking: any) => (
                          <TableRow key={booking.id}>
                            {/* User */}
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                              <div className="flex items-center gap-3">
                                <div>
                                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {booking.user
                                      ? `${booking.user.firstName || ""} ${
                                          booking.user.lastName || ""
                                        }`.trim() || "-"
                                      : "-"}
                                  </span>
                                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                    {booking.user?.email}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Booking Type */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {booking.bookingType || "-"}
                            </TableCell>

                            {/* Details */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {booking.bookingType === "hotel" &&
                              booking.hotelBooking ? (
                                <div>
                                  <p>
                                    <strong>Hotel:</strong>{" "}
                                    {booking.hotelBooking.hotelName}
                                  </p>
                                  <p>
                                    <strong>Room:</strong>{" "}
                                    {booking.hotelBooking.roomType}
                                  </p>
                                  <p>
                                    <strong>Check-in:</strong>{" "}
                                    {new Date(
                                      booking.hotelBooking.checkInDate
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Check-out:</strong>{" "}
                                    {new Date(
                                      booking.hotelBooking.checkOutDate
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Total Price:</strong>{" "}
                                    {booking.hotelBooking.totalPrice}{" "}
                                    {booking.hotelBooking.currency}
                                  </p>
                                </div>
                              ) : booking.bookingType === "flight" &&
                                booking.flightBooking ? (
                                <div>
                                  <p>
                                    <strong>Airline:</strong>{" "}
                                    {booking.flightBooking.airlineName} (
                                    {booking.flightBooking.airlineCode})
                                  </p>
                                  <p>
                                    <strong>Flight:</strong>{" "}
                                    {booking.flightBooking.flightNumber}
                                  </p>
                                  <p>
                                    <strong>From:</strong>{" "}
                                    {booking.flightBooking.departureAirport}{" "}
                                    <strong>To:</strong>{" "}
                                    {booking.flightBooking.arrivalAirport}
                                  </p>
                                  <p>
                                    <strong>Departure:</strong>{" "}
                                    {new Date(
                                      booking.flightBooking.departureTime
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Arrival:</strong>{" "}
                                    {new Date(
                                      booking.flightBooking.arrivalTime
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Ticket Price:</strong>{" "}
                                    {booking.flightBooking.ticketPrice}{" "}
                                    {booking.flightBooking.currency}
                                  </p>
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {booking.status || "-"}
                            </TableCell>

                            {/* Created At */}
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              {new Date(booking.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            colSpan={5}
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
