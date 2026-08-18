import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hotelPlaceHolder from "../assets/hotelPlaceHolder.png";

interface Hotel {
  id?: number;
  name: string;
  categoryName: string;
  destinationName: string;
  zoneName: string;
  latitude: string;
  longitude: string;
  minRate?: string;
  maxRate?: string;
  currency?: string;
  images?: string[];
  description?: string;
  category?: string;
  price?: string;
  rating?: number;
  rateKey?: string;
  roomCode?: string;
  roomName?: string;
  boardCode?: string;
  boardName?: string;
  adults?: number;
  children?: number;
  childrenAges?: number[];
}

const API = import.meta.env.VITE_API_BASE_URL;

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const HotelSlider = ({ hotels, intent }: { hotels: Hotel[]; intent: any }) => {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [checking, setChecking] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const sortedHotels = [...hotels].sort((a, b) => {
    const aHas = !!(a.images?.length);
    const bHas = !!(b.images?.length);
    return aHas === bHas ? 0 : aHas ? -1 : 1;
  });

  const goToBooking = async (hotel: Hotel) => {
    if (!hotel.rateKey) {
      setAvailError("This hotel has no rate key. Please try another.");
      return;
    }

    setChecking(true);
    setAvailError(null);

    try {
      const res = await fetch(`${API}/booking/hotel/check-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rateKey: hotel.rateKey }),
      });

      if (res.status === 410) {
        setAvailError("This room is no longer available. Please search again.");
        return;
      }

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? "Availability check failed");
      }

      const avail = await res.json();

      // Build checkout URL with server-confirmed price
      const params = new URLSearchParams({
        rateKey: hotel.rateKey,
        hotelId: hotel.id?.toString() ?? "",
        hotelName: hotel.name,
        category: hotel.category ?? hotel.categoryName ?? "",
        rating: hotel.rating?.toString() ?? "",
        destinationName: hotel.destinationName ?? "",
        address: hotel.zoneName ?? "",
        boardName: avail.boardName ?? hotel.boardName ?? "",
        boardCode: hotel.boardCode ?? "",
        totalPrice: avail.confirmedPrice?.toString() ?? hotel.price ?? "0",
        currency: avail.currency ?? hotel.currency ?? "EUR",
        adults: (hotel.adults ?? intent?.adults ?? 1).toString(),
        children: (hotel.children ?? intent?.children ?? 0).toString(),
        paymentType: avail.paymentType ?? "",
        rateType: avail.rateType ?? "",
      });

      if (hotel.images?.length) {
        params.set("images", hotel.images.slice(0, 5).join(","));
      }
      if (hotel.childrenAges?.length) {
        params.set("childrenAges", hotel.childrenAges.join(","));
      }

      navigate(`/booking?${params.toString()}`);
    } catch (err: any) {
      setAvailError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div className="relative w-full">
        <button
          onClick={() => sliderRef.current?.scrollBy({ left: -350, behavior: "smooth" })}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => sliderRef.current?.scrollBy({ left: 350, behavior: "smooth" })}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>

        <motion.div
          ref={sliderRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex overflow-x-auto gap-4 py-4 scrollbar-hide scroll-smooth"
        >
          {sortedHotels.map((hotel, index) => (
            <div
              key={index}
              className="md:w-[342px] w-full bg-[#1e1e1e] rounded-2xl p-3 border border-[#333] text-white flex-shrink-0 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              onClick={() => {
                setSelectedHotel(hotel);
                setAvailError(null);
              }}
            >
              <img
                src={hotel.images?.[0] || hotelPlaceHolder}
                alt={hotel.name}
                className="w-full h-[180px] object-cover rounded-xl mb-3"
                onError={(e) => (e.currentTarget.src = hotelPlaceHolder as string)}
              />
              <h3 className="xl:text-[20px] lg:text-[18px] text-[#D4AF37] truncate font-carien">
                {hotel.name}
              </h3>
              <p className="text-sm font-gowun">{hotel.categoryName}</p>
              <p className="text-sm font-gowun">
                {hotel.destinationName} – {hotel.zoneName}
              </p>
              <p className="text-sm mt-2 font-gowun">
                💰 {hotel.price} {hotel.currency}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Detail + Book modal */}
      <AnimatePresence>
        {selectedHotel && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => { if (!checking) setSelectedHotel(null); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1f1f1f] text-white rounded-2xl p-5 w-full max-w-[700px] max-h-[85vh] overflow-y-auto relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { if (!checking) setSelectedHotel(null); }}
                disabled={checking}
                className="absolute top-3 right-3 text-gray-300 hover:text-white text-lg disabled:opacity-30"
              >
                ✕
              </button>

              {/* Images */}
              <div className="w-full h-[280px] mb-4">
                {selectedHotel.images?.length ? (
                  <div className="flex overflow-x-auto gap-2 scrollbar-hide h-full">
                    {selectedHotel.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="w-full max-w-[300px] h-[280px] object-cover rounded-xl flex-shrink-0"
                        alt={selectedHotel.name}
                        onError={(e) => (e.currentTarget.src = hotelPlaceHolder as string)}
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src={hotelPlaceHolder}
                    className="w-full h-[280px] object-cover rounded-xl"
                    alt={selectedHotel.name}
                  />
                )}
              </div>

              <h2 className="text-xl font-carien text-[#D4AF37]">
                {selectedHotel.name}
              </h2>
              <p className="text-sm text-gray-300">{selectedHotel.categoryName}</p>
              <p className="text-sm font-gowun mt-1">
                📍 {selectedHotel.destinationName} – {selectedHotel.zoneName}
              </p>

              {selectedHotel.description && (
                <p className="text-sm font-gowun mt-3 text-gray-400 line-clamp-3">
                  {selectedHotel.description}
                </p>
              )}

              {selectedHotel.boardName && (
                <p className="text-sm mt-2 text-gray-400">
                  🍽 {selectedHotel.boardName}
                </p>
              )}

              <div className="flex items-end justify-between mt-5">
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-2xl font-bold">
                    {selectedHotel.currency}{" "}
                    {Number(selectedHotel.price).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedHotel.adults ?? intent?.adults ?? 1} adult
                    {(selectedHotel.adults ?? intent?.adults ?? 1) > 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  onClick={() => goToBooking(selectedHotel)}
                  disabled={checking}
                  className="flex items-center gap-2 bg-[#D4AF37] text-black font-semibold py-2.5 px-8 rounded-xl hover:bg-[#c19c30] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {checking ? (
                    <>
                      <Spinner /> Checking…
                    </>
                  ) : (
                    "Book for Me"
                  )}
                </button>
              </div>

              {availError && (
                <p className="mt-3 text-sm text-red-400 text-center">
                  {availError}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HotelSlider;