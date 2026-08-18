import React, { useRef } from "react";
import { Modal } from "../../components/ui/modal";

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] h-[90vh] overflow-hidden p-6"
    >
      <h2 className="text-xl font-semibold mb-4 dark:text-white/90">Chat History</h2>
      <div className="h-[75vh] overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* USER MESSAGE */}
            {msg.prompt && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-[75%]">
                  <p className="font-semibold dark:text-white/90">User</p>
                  <p className="dark:text-white/90">{msg.prompt}</p>
                </div>
              </div>
            )}

            {/* AI MESSAGE */}
            {msg.response && (
              <div className="flex justify-end py-4">
                <div className="bg-[#D4AF37] dark:bg-[#d4af37] text-white px-4 py-2 rounded-lg max-w-[75%]">
                  <p className="font-semibold dark:text-white/90">BOOKD:</p>
                  <p className="dark:text-white/90">{msg.response}</p>
                </div>
              </div>
            )}

            {/* 🏨 HOTEL SLIDER */}
            {msg.hotelRecord?.length > 0 && (
              <HorizontalSlider title="🏨 Hotels">
                {msg.hotelRecord.map((hotel: any) => (
                  <HotelSliderCard key={hotel.hotelId} hotel={hotel} />
                ))}
              </HorizontalSlider>
            )}

            {/* ✈️ FLIGHT SLIDER */}
            {msg.flightRecord?.length > 0 && (
              <HorizontalSlider title="✈️ Flights">
                {msg.flightRecord.map((flight: any) => (
                  <FlightSliderCard key={flight.id} flight={flight} />
                ))}
              </HorizontalSlider>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

const HorizontalSlider = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xl font-semibold dark:text-white/90 mb-2">{title}</p>
      </div>

      {/* LEFT ARROW */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-[2px] top-1/2 -translate-y-1/2 z-10 bg-[#D4AF37] text-white shadow rounded-full p-2 hover:scale-105 transition w-[40px]"
      >
        ◀
      </button>

      {/* SLIDER */}
      <div
        ref={sliderRef}
        className="flex gap-3 overflow-x-hidden px-8 pb-2"
      >
        {children}
      </div>

      {/* RIGHT ARROW */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#D4AF37] text-white shadow rounded-full p-2 hover:scale-105 transition w-[40px]"
      >
        ▶
      </button>
    </div>
  );
};

const HOTEL_PLACEHOLDER =
  "https://via.placeholder.com/400x250?text=Hotel+Image";

const HotelSliderCard = ({ hotel }: { hotel: any }) => (
  <div className="min-w-[260px] border rounded-xl p-3 bg-white dark:bg-gray-800">
    <img
      src={hotel.images?.[0] || HOTEL_PLACEHOLDER}
      alt={hotel.name}
      className="w-full h-32 object-cover rounded-lg"
    />

    <h4 className="mt-2 font-semibold text-sm line-clamp-2 dark:text-white/90">{hotel.name}</h4>
    <p className="text-xs text-gray-500 dark:text-white/90">
      ⭐ {hotel.rating} • {hotel.category}
    </p>
    <p className="mt-1 font-semibold text-[#D4AF37] dark:text-white/90">${hotel.price}</p>
  </div>
);

const AIRLINE_PLACEHOLDER = "https://via.placeholder.com/80x80?text=Airline";

const FlightSliderCard = ({ flight }: { flight: any }) => {
  const segment = flight.itineraries?.[0]?.segments?.[0];

  return (
    <div className="min-w-[260px] border rounded-xl p-3 bg-white dark:bg-gray-800">
      {/* Airline */}
      <div className="flex items-center gap-2 mb-2">
        <img
          src={segment?.airlineLogo || AIRLINE_PLACEHOLDER}
          alt={segment?.airlineName}
          className="w-10 h-10 object-contain"
        />
        <span className="text-sm font-semibold dark:text-white/90">
          {segment?.airlineName || "Unknown Airline"}
        </span>
      </div>

      {/* Route */}
      <p className="text-xs text-gray-500 dark:text-white/90">
        {segment?.from} → {segment?.to}
      </p>

      {/* Flight number */}
      <p className="text-xs dark:text-white/90">Flight #{segment?.flightNumber}</p>

      {/* Price */}
      <p className="mt-2 font-semibold text-[#D4AF37] dark:text-white/90">
        ${flight.price} {flight.currency}
      </p>
    </div>
  );
};

export default ChatHistoryModal;
