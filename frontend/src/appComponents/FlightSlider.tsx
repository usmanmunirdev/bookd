import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

type CardState = "idle" | "checking" | "unavailable";

const Spinner = () => (
  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const FlightSlider = ({ flights, intent }: { flights: any[]; intent: any }) => {
  const navigate = useNavigate();
  const [cardState, setCardState] = useState<Record<string, CardState>>({});
  const [cardError, setCardError] = useState<Record<string, string>>({});

  const goToBooking = async (flight: any) => {
    const id: string = flight.id ?? String(Math.random());

    setCardState((s) => ({ ...s, [id]: "checking" }));
    setCardError((e) => ({ ...e, [id]: "" }));

    try {
      const res = await fetch(`${API}/booking/flight/check-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightOffer: flight.flightOffer ?? flight }),
      });

      if (res.status === 410) {
        setCardState((s) => ({ ...s, [id]: "unavailable" }));
        setCardError((e) => ({
          ...e,
          [id]: "This flight is no longer available.",
        }));
        return;
      }

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? "Availability check failed");
      }

      const { pricedOffer } = await res.json();
      // Use freshly-priced offer — price is now confirmed by Amadeus
      const offerToUse = pricedOffer ?? flight.flightOffer ?? flight;

      setCardState((s) => ({ ...s, [id]: "idle" }));
      navigate(
        `/booking?flightOffer=${encodeURIComponent(
          JSON.stringify(offerToUse)
        )}`
      );
    } catch (err: any) {
      setCardState((s) => ({ ...s, [id]: "idle" }));
      setCardError((e) => ({
        ...e,
        [id]: err.message ?? "Something went wrong.",
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-x-auto scrollbar-hide flex gap-4 py-4"
    >
      {flights.map((flight: any) => {
        const id: string = flight.id ?? String(flight);
        const segments = flight.itineraries?.[0]?.segments ?? [];
        const seg0 = segments[0];
        const lastSeg = segments[segments.length - 1];
        const checking = cardState[id] === "checking";
        const unavailable = cardState[id] === "unavailable";
        const err = cardError[id];

        return (
          <div
            key={id}
            className="min-w-[342px] bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col text-white shadow-md"
          >
            {/* Airline */}
            <div className="flex items-center gap-3 mb-3">
              {seg0?.airlineLogo && (
                <img
                  src={seg0.airlineLogo}
                  alt={seg0.airlineName ?? ""}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <div>
                <p className="xl:text-[20px] font-gowun">
                  {seg0?.airlineName ?? seg0?.carrierCode}
                </p>
                <p className="text-sm text-gray-400">
                  {seg0?.flightNumber ??
                    `${seg0?.carrierCode ?? ""}${seg0?.number ?? ""}`}
                </p>
              </div>
            </div>

            {/* Route */}
            <div className="flex justify-between items-center mb-2">
              <div className="text-center">
                <p className="font-semibold text-lg">
                  {seg0?.from ?? seg0?.departure?.iataCode}
                </p>
                <p className="text-xs text-gray-400">
                  {seg0?.departure?.at
                    ? new Date(seg0.departure.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Departure"}
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center mx-2">
                <span className="text-xs text-gray-500 mb-1">
                  {flight.itineraries?.[0]?.duration
                    ?.replace("PT", "")
                    .toLowerCase()}
                </span>
                <div className="w-full border-t border-gray-700 relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm">
                    ✈
                  </span>
                </div>
                {segments.length > 1 && (
                  <span className="text-xs text-amber-400 mt-1.5">
                    {segments.length - 1} stop{segments.length > 2 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="text-center">
                <p className="font-semibold text-lg">
                  {lastSeg?.to ?? lastSeg?.arrival?.iataCode}
                </p>
                <p className="text-xs text-gray-400">
                  {lastSeg?.arrival?.at
                    ? new Date(lastSeg.arrival.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Arrival"}
                </p>
              </div>
            </div>

            {intent?.travelClass && (
              <p className="text-xs text-gray-500 mb-3 capitalize">
                {intent.travelClass.toLowerCase()}
              </p>
            )}

            {/* Price + CTA */}
            <div className="mt-auto">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">
                    {flight.price}{" "}
                    <span className="text-sm text-gray-300">
                      {flight.currency}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">per person</p>
                </div>

                <button
                  onClick={() => goToBooking(flight)}
                  disabled={checking || unavailable}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-black font-medium hover:bg-transparent hover:text-white border border-[#D4AF37] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {checking ? (
                    <>
                      <Spinner /> Checking…
                    </>
                  ) : unavailable ? (
                    "Unavailable"
                  ) : (
                    "Book For Me"
                  )}
                </button>
              </div>

              {err && (
                <p className="mt-2 text-xs text-red-400">{err}</p>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default FlightSlider;