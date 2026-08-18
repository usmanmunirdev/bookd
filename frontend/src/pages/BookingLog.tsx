import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useAuth } from "../../utils";
import axios from "axios";
import { cn } from "@/lib/utils";
import { DebounceInput } from "react-debounce-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  Calendar,
  Clock,
  History,
  Filter,
  DollarSign,
  MapPin,
  Eye,
  Share,
  CalendarPlus,
  Download,
  Map,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_BASE_URL;

const Index = () => {
  const [activeTab, setActiveTab] = useState("hotels");
  const [bookingLog, setBookings] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    flights: true,
    hotels: true,
  });
  const [filters, setFilters] = useState({
    serviceType: "all",
    priceRange: "all",
    destination: "",
  });
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [addingToCalendar, setAddingToCalendar] = useState<string | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedMapBooking, setSelectedMapBooking] = useState<any>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-[#339933] text-[#FFFFFF]";
      case "pending":
        return "bg-[#FF8C00] text-[#FFFFFF]";
      case "cancelled":
        return "bg-[#D93636] text-[#FFFFFF]";
      default:
        return "bg-[#242016] text-[#808080]";
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      // Build query params
      const params = new URLSearchParams({
        userId: user.id,
      });

      // Add filters to query params
      if (filters.priceRange !== "all") {
        params.append("priceRange", filters.priceRange);
      }
      if (filters.destination) {
        params.append("destination", filters.destination);
      }

      const response = await axios.get(
        `${API}/booking/logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let bookingLogs = response?.data?.data;
      const hotelBookings = bookingLogs.filter(
        (b: any) => b?.bookingType === "hotel"
      );
      const flightBookings = bookingLogs.filter(
        (b: any) => b?.bookingType === "flight"
      );

      const categorized = {
        hotels: hotelBookings,
        flights: flightBookings,
      };
      setBookings(categorized);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id, filters.priceRange, filters.destination]);

  const handleAddToCalendar = async (booking: any) => {
    setAddingToCalendar(booking.id);
    try {
      // First check if Google Calendar is connected
      const connectionRes = await axios.get(`${API}/google/is-connected`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!connectionRes.data.connected) {
        const authRes = await axios.get(`${API}/google/auth`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (authRes.data.url) {
          window.location.href = authRes.data.url;
        }
        return;
      }

      let eventData;

      if (booking?.bookingType === "hotel") {
        const hotel = booking?.hotelBooking;
        eventData = {
          summary: `Hotel: ${hotel.hotelName}`,
          description: `Hotel Booking\nRoom Type: ${hotel.roomType}\nDestination: ${hotel.destinationName}\nBooking ID: ${booking.id}`,
          location: hotel.destinationName,
          start: {
            dateTime: new Date(hotel.checkInDate).toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: new Date(hotel.checkOutDate).toISOString(),
            timeZone: "UTC",
          },
        };
      } else if (booking?.bookingType === "flight") {
        const flight = booking?.flightBooking;
        eventData = {
          summary: `Flight: ${flight.departureAirport} → ${flight.arrivalAirport}`,
          description: `Flight Booking\nAirline: ${flight.airlineName}\nBooking ID: ${booking.id}`,
          location: `${flight.departureAirport} - ${flight.arrivalAirport}`,
          start: {
            dateTime: new Date(flight.departureTime).toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: new Date(
              new Date(flight.departureTime).getTime() + 2 * 60 * 60 * 1000
            ).toISOString(),
            timeZone: "UTC",
          },
        };
      }

      // Create the event
      await axios.post(`${API}/google/events`, eventData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Successfully added to Google Calendar!");
    } catch (err) {
      console.error("Error adding to calendar:", err);
      toast.error("Failed to add to Google Calendar. Please try again.");
    } finally {
      setAddingToCalendar(null);
    }
  };

  const handleOpenMap = (booking: any) => {
    setSelectedMapBooking(booking);
    setMapDialogOpen(true);
  };

  const getMapUrl = (booking: any) => {
    let location = "";

    if (booking?.bookingType === "hotel") {
      location = encodeURIComponent(
        `${booking.hotelBooking?.hotelName}, ${booking.hotelBooking?.destinationName}`
      );
    } else if (booking?.bookingType === "flight") {
      location = encodeURIComponent(
        booking.flightBooking?.departureAirport || ""
      );
    }

    return `https://www.google.com/maps/search/?api=1&query=${location}`;
  };

  const getEmbedMapUrl = (booking: any) => {
    let location = "";

    if (booking?.bookingType === "hotel") {
      location = encodeURIComponent(
        `${booking.hotelBooking?.hotelName}, ${booking.hotelBooking?.destinationName}`
      );
    } else if (booking?.bookingType === "flight") {
      location = encodeURIComponent(
        booking.flightBooking?.departureAirport || ""
      );
    }

    return `https://maps.google.com/maps?q=${location}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <motion.div
      key="booking-log"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="min-h-screen bg-black lg:py-[100px] md:py-[80px] sm:py-[60px] py-[40px]"
    >
      <div className="container mx-auto xl:py-[16px] xl:px-[40px] lg:px-[35px] md:px-[30px] sm:px-[20px] px-[16px]">
        <div className="mb-[30px] text-white">
          <h1 className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] tex-[28px] font-normal mb-[10px]">
            How can i assist today?
          </h1>
          <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun">
            A snapshot of everything BOOKD has secured for you — confirmed,
            curated, and ready to enjoy.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-6 pb-12">
          {(() => {
            const allBookings = [
              ...(bookingLog?.hotels || []),
              ...(bookingLog?.flights || []),
            ];

            return [
              {
                label: "Total Bookings",
                value: allBookings.length.toString(),
              },
              {
                label: "Total Spent",
                value: `$${allBookings
                  .reduce((sum, booking) => {
                    const amount =
                      booking?.hotelBooking?.totalPrice ||
                      booking?.flightBooking?.ticketPrice ||
                      0;
                    return sum + Number(amount);
                  }, 0)
                  .toLocaleString()}`,
              },
              {
                label: "Destinations",
                value: [
                  ...new Set(
                    allBookings.map((b) => {
                      return (
                        b?.hotelBooking?.destination ||
                        b?.flightBooking?.destination ||
                        "Unknown"
                      );
                    })
                  ),
                ].length.toString(),
              },
              {
                label: "This Month",
                value: allBookings
                  .filter((b) => {
                    const date = new Date(b.createdAt);
                    const now = new Date();
                    return (
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                    );
                  })
                  .length.toString(),
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-[#0F0E0E] bg-opacity-5 backdrop-blur-sm rounded-2xl border border-[#E5B84D] border-opacity-20 p-6 hover:bg-opacity-10 transition-all duration-300"
              >
                <div className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] tex-[28px] font-normal mb-2 text-white font-gowun">
                  {stat.value}
                </div>
                <span className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun text-white">
                  {stat.label}
                </span>
              </div>
            ));
          })()}
        </div>
        <div className="relative">
          <div className="bg-black border border-[#3A3219] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-[#E5B84D]" />
              <h3 className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-carien text-[#D4AF37]">
                Filter Bookings
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[12px] text-white flex items-center gap-1 font-gowun">
                  Price Range
                </Label>
                <div className="relative w-full">
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: e.target.value,
                      }))
                    }
                    className="bg-[#201C12] border border-[#403823] rounded-[5px] px-4 py-[10px] text-[#FFFFFF] text-[12px] font-gowun focus:outline-none focus:border-[#E5B84D] w-full cursor-pointer appearance-none pr-10"
                  >
                    <option value="all">Any Price</option>
                    <option value="0-1000">$0 - $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="5000-15000">$5,000 - $15,000</option>
                    <option value="15000+">$15,000+</option>
                  </select>
                  <FaChevronDown
                    size={12}
                    className="absolute top-1/2 -translate-y-1/2 right-[20px] text-[#FFFFFF] pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] text-white flex items-center gap-1 font-gowun">
                  Destination
                </Label>
                <DebounceInput
                  debounceTimeout={300}
                  placeholder="Enter destination..."
                  value={filters.destination}
                  className={cn(
                    "file:text-foreground placeholder:text-white selection:bg-primary selection:text-primary-foreground",
                    "flex h-9 w-full min-w-0 border bg-[#201C12] border-[#403823]",
                    "rounded-[5px] p-[19px] text-[#FFFFFF] font-gowun shadow-xs",
                    "transition-[color,box-shadow] outline-none",
                    "focus-visible:border-ring focus-visible:ring-[#E5B84D] focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  )}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-[#201C12] border-[#403823]">
              <TabsTrigger
                value="hotels"
                className="text-[12px] text-black flex items-center gap-1 font-gowun cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Hotels ({bookingLog?.hotels?.length || 0})
              </TabsTrigger>

              <TabsTrigger
                value="flights"
                className="text-[12px] !text-[#B9A94A] flex items-center gap-1 font-gowun cursor-pointer"
              >
                <History className="w-4 h-4 text-[#B9A94A]" />
                Flights ({bookingLog?.flights?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* HOTELS TAB */}
            <TabsContent value="hotels" className="space-y-4">
              {bookingLog?.hotels?.map((booking: any) => (
                <div
                  key={booking.id}
                  className="group bg-[#1F1A0D] border border-[#403823] rounded-lg p-[25px] hover:border-[#E5B84D] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="lg:flex items-start gap-4 flex-1 min-w-0">
                      <div className="mb-[30px] flex-1 min-w-0 lg:text-left text-center">
                        <h3 className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun text-white truncate">
                          {booking?.hotelBooking?.hotelName} —{" "}
                          {booking?.hotelBooking?.destinationName}
                        </h3>
                        <p className="text-white mb-1">
                          {booking?.hotelBooking?.roomType}
                        </p>
                        <p className="text-white mb-1">
                          {new Date(
                            booking?.hotelBooking?.checkInDate
                          ).toLocaleString()}{" "}
                          to{" "}
                          {new Date(
                            booking?.hotelBooking?.checkOutDate
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex lg:justify-between justify-center items-center gap-5 flex-wrap">
                        <span
                          className={`px-[20px] py-[11px] rounded-full text-[14px] font-gowun ${getStatusColor(
                            booking?.status
                          )}`}
                        >
                          {booking?.status?.charAt(0).toUpperCase() +
                            booking?.status?.slice(1)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D] cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D] cursor-pointer"
                            onClick={() => handleOpenMap(booking)}
                          >
                            <Map className="w-4 h-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D]"
                          >
                            <Share className="w-4 h-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D] cursor-pointer"
                            onClick={() => handleAddToCalendar(booking)}
                            disabled={addingToCalendar === booking.id}
                          >
                            <CalendarPlus
                              className={`w-4 h-4 ${
                                addingToCalendar === booking.id
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D]"
                          >
                            <Download className="w-4 h-4" />
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* FLIGHTS TAB */}
            <TabsContent value="flights" className="space-y-4">
              {bookingLog?.flights?.map((booking: any) => (
                <div
                  key={booking.id}
                  className="group bg-[#1F1A0D] border border-[#403823] rounded-lg p-[25px] hover:border-[#E5B84D] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="lg:flex items-start gap-4 flex-1 min-w-0">
                      <div className="mb-[30px] flex-1 min-w-0 lg:text-left text-center">
                        <h3 className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun text-white truncate">
                          {booking?.flightBooking?.departureAirport} —{" "}
                          {booking?.flightBooking?.arrivalAirport}
                        </h3>

                        <p className="text-white mb-1">
                          {booking?.flightBooking?.airlineName}
                        </p>

                        <p className="text-white mb-1">
                          Departure Time:{" "}
                          {new Date(
                            booking?.flightBooking?.departureTime
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex lg:justify-between justify-center items-center gap-5 flex-wrap">
                        <span
                          className={`px-[20px] py-[11px] rounded-full text-[14px] font-gowun ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking?.status?.charAt(0).toUpperCase() +
                            booking?.status?.slice(1)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D] cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D] cursor-pointer"
                            onClick={() => handleOpenMap(booking)}
                          >
                            <Map className="w-4 h-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D]"
                          >
                            <Share className="w-4 h-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D] cursor-pointer"
                            onClick={() => handleAddToCalendar(booking)}
                            disabled={addingToCalendar === booking.id}
                          >
                            <CalendarPlus
                              className={`w-4 h-4 ${
                                addingToCalendar === booking.id
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 text-[#E5B84D]"
                          >
                            <Download className="w-4 h-4" />
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Details Dialog */}
        <Dialog
          open={!!selectedBooking}
          onOpenChange={() => setSelectedBooking(null)}
        >
          <DialogContent className="bg-[#17140F] border-[#403823] text-[#FFFFFF] max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="xl:text-[24px] lg:text-[22px] md:text-[20px] text-[18px] font-normal font-gowun text-[#E5B84D]">
                {selectedBooking?.bookingType === "hotel"
                  ? `${selectedBooking?.hotelBooking?.hotelName}`
                  : `Flight: ${selectedBooking?.flightBooking?.departureAirport} → ${selectedBooking?.flightBooking?.arrivalAirport}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Hotel Details */}
              {selectedBooking?.bookingType === "hotel" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[18px] font-normal font-gowun text-[#E5B84D] mb-3">
                      Booking Details
                    </h4>
                    <div className="space-y-2 text-[14px] font-gowun">
                      <p className="flex justify-between">
                        <span className="text-gray-400">Hotel:</span>
                        <span className="text-white">
                          {selectedBooking?.hotelBooking?.hotelName}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Destination:</span>
                        <span className="text-white">
                          {selectedBooking?.hotelBooking?.destinationName}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Room Type:</span>
                        <span className="text-white">
                          {selectedBooking?.hotelBooking?.roomType}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Check-in:</span>
                        <span className="text-white">
                          {new Date(
                            selectedBooking?.hotelBooking?.checkInDate
                          ).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Check-out:</span>
                        <span className="text-white">
                          {new Date(
                            selectedBooking?.hotelBooking?.checkOutDate
                          ).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] ${getStatusColor(
                            selectedBooking?.status
                          )}`}
                        >
                          {selectedBooking?.status?.charAt(0).toUpperCase() +
                            selectedBooking?.status?.slice(1)}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Total Price:</span>
                        <span className="text-[#E5B84D] font-semibold">
                          ${selectedBooking?.hotelBooking?.totalPrice}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Booking ID:</span>
                        <span className="text-white text-[12px]">
                          {selectedBooking?.id}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[18px] font-normal font-gowun text-[#E5B84D] mb-3">
                      Location
                    </h4>
                    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[#403823]">
                      <iframe
                        src={getEmbedMapUrl(selectedBooking)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Flight Details */}
              {selectedBooking?.bookingType === "flight" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[18px] font-normal font-gowun text-[#E5B84D] mb-3">
                      Flight Details
                    </h4>
                    <div className="space-y-2 text-[14px] font-gowun">
                      <p className="flex justify-between">
                        <span className="text-gray-400">Airline:</span>
                        <span className="text-white">
                          {selectedBooking?.flightBooking?.airlineName}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">From:</span>
                        <span className="text-white">
                          {selectedBooking?.flightBooking?.departureAirport}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">To:</span>
                        <span className="text-white">
                          {selectedBooking?.flightBooking?.arrivalAirport}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Departure:</span>
                        <span className="text-white">
                          {new Date(
                            selectedBooking?.flightBooking?.departureTime
                          ).toLocaleString()}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] ${getStatusColor(
                            selectedBooking?.status
                          )}`}
                        >
                          {selectedBooking?.status?.charAt(0).toUpperCase() +
                            selectedBooking?.status?.slice(1)}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Ticket Price:</span>
                        <span className="text-[#E5B84D] font-semibold">
                          ${selectedBooking?.flightBooking?.ticketPrice}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Booking ID:</span>
                        <span className="text-white text-[12px]">
                          {selectedBooking?.id}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[18px] font-normal font-gowun text-[#E5B84D] mb-3">
                      Location
                    </h4>
                    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[#403823]">
                      <iframe
                        src={getEmbedMapUrl(selectedBooking)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Photos Section - Only show if images exist */}
              {selectedBooking?.images &&
                selectedBooking?.images.length > 0 && (
                  <div>
                    <h4 className="text-[18px] font-normal font-gowun text-[#E5B84D] mb-3">
                      Photos
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedBooking.images.map(
                        (image: string, i: number) => (
                          <div
                            key={i}
                            className="aspect-square rounded-lg overflow-hidden border border-[#403823]"
                          >
                            <img
                              src={image}
                              alt={`${selectedBooking?.bookingType} ${i + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Map Dialog */}
        <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
          <DialogContent className="bg-[#17140F] border-[#403823] text-[#FFFFFF] max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle className="xl:text-[24px] lg:text-[22px] md:text-[20px] text-[18px] font-normal font-gowun text-[#E5B84D]">
                {selectedMapBooking?.bookingType === "hotel"
                  ? `${selectedMapBooking?.hotelBooking?.hotelName} - ${selectedMapBooking?.hotelBooking?.destinationName}`
                  : `${selectedMapBooking?.flightBooking?.departureAirport} → ${selectedMapBooking?.flightBooking?.arrivalAirport}`}
              </DialogTitle>
            </DialogHeader>

            {/* Body wrapper */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Map container */}
              <div className="flex-1 rounded-lg overflow-hidden border border-[#403823]">
                <iframe
                  src={getEmbedMapUrl(selectedMapBooking)}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() =>
                    window.open(getMapUrl(selectedMapBooking), "_blank")
                  }
                  className="bg-[#E5B84D] hover:bg-[#D4AF37] text-black font-gowun px-6 py-2 rounded-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>

                <Button
                  onClick={() => setMapDialogOpen(false)}
                  className="border border-[#E5B84D] bg-transparent text-[#E5B84D] hover:bg-[#E5B84D] hover:text-black font-gowun px-6 py-2 rounded-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default Index;
