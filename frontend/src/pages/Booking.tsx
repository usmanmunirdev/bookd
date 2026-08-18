import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, FieldArray, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../utils";
import "react-phone-input-2/lib/style.css";
import Header from "@/appComponents/Header"
import Footer from "@/appComponents/Footer"

const API = import.meta.env.VITE_API_BASE_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cls = (...c: (string | boolean | undefined)[]) =>
  c.filter(Boolean).join(" ");

const inp =
  "w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none transition text-white placeholder-zinc-500 text-sm";

const inpErr =
  "w-full px-4 py-3 rounded-xl bg-zinc-900 border border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none transition text-white placeholder-zinc-500 text-sm";

const lbl =
  "block text-xs text-zinc-400 mb-1 font-medium uppercase tracking-wider";

const errCls = "text-red-400 text-xs mt-1";

const formatDate = (d: string | Date) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

const formatDuration = (iso: string) => {
  if (!iso) return "";
  return iso.replace("PT", "").replace("H", "h ").replace("M", "m").trim();
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingMode = "hotel" | "flight";

interface Traveler {
  id: string;
  type: "ADULT" | "CHILD" | "INFANT";
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "";
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssuingCountry: string;
}

interface SeatPreference {
  travelerId: string;
  seatType: "WINDOW" | "AISLE" | "MIDDLE" | "NO_PREFERENCE";
}

// Flight: 0=Details, 1=Travelers, 2=Seats, 3=Payment, 4=Review
// Hotel AT_WEB: 0=Details, 1=Guests, 2=Payment, 3=Review
// Hotel AT_HOTEL: 0=Details, 1=Guests, 2=Review
const FLIGHT_STEPS = ["Details", "Travelers", "Seats", "Payment", "Review"];
const HOTEL_PREPAID_STEPS = ["Details", "Guests", "Payment", "Review"];
const HOTEL_PAY_AT_STEPS = ["Details", "Guests", "Review"];

// ─── Stripe Card Form ─────────────────────────────────────────────────────────

const StripeCardForm = ({
  onTokenReady,
  savedLast4,
}: {
  onTokenReady: (pmId: string | null) => void;
  savedLast4?: string | null;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [useExisting, setUseExisting] = useState(!!savedLast4);
  const [cardError, setCardError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(!!savedLast4);

  React.useEffect(() => {
    if (savedLast4) {
      onTokenReady(null);
      setConfirmed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmCard = async () => {
    if (useExisting) {
      onTokenReady(null);
      setConfirmed(true);
      return;
    }
    if (!stripe || !elements) return;

    setConfirming(true);
    const cardEl = elements.getElement(CardElement);
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardEl!,
    });
    setConfirming(false);

    if (error) {
      setCardError(error.message || "Card error");
      return;
    }
    setCardError("");
    setConfirmed(true);
    onTokenReady(paymentMethod.id);
  };

  return (
    <div className="space-y-4">
      {savedLast4 && (
        <div className="flex gap-3">
          {[true, false].map((existing) => (
            <button
              key={String(existing)}
              type="button"
              onClick={() => {
                setUseExisting(existing);
                setConfirmed(false);
                onTokenReady(null);
              }}
              className={cls(
                "flex-1 py-3 rounded-xl border text-sm font-medium transition",
                useExisting === existing
                  ? "border-white bg-zinc-800 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              )}
            >
              {existing ? `Saved card •••• ${savedLast4}` : "New card"}
            </button>
          ))}
        </div>
      )}

      {!useExisting && (
        <div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700">
            <CardElement
              onChange={() => setConfirmed(false)}
              options={{
                style: {
                  base: {
                    color: "#fff",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    "::placeholder": { color: "#71717a" },
                  },
                  invalid: { color: "#f87171" },
                },
              }}
            />
          </div>
          {cardError && <p className={errCls}>{cardError}</p>}
          <button
            type="button"
            onClick={confirmCard}
            disabled={confirming}
            className="mt-3 w-full py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition disabled:opacity-50"
          >
            {confirming ? "Verifying…" : "Confirm card"}
          </button>
        </div>
      )}

      {useExisting && (
        <button
          type="button"
          onClick={confirmCard}
          disabled={confirmed}
          className={cls(
            "w-full py-3 rounded-xl text-sm font-medium transition",
            confirmed
              ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
              : "bg-zinc-700 hover:bg-zinc-600 text-white"
          )}
        >
          {confirmed ? "✓ Card ready" : "Use saved card"}
        </button>
      )}

      {confirmed && (
        <p className="text-green-400 text-sm flex items-center gap-2">
          <span className="text-green-500">✓</span> Payment method confirmed
        </p>
      )}
    </div>
  );
};

// ─── Seat Preferences ─────────────────────────────────────────────────────────

const SeatPreferences = ({
  travelers,
  selectedSeats,
  onSeatSelect,
}: {
  travelers: Traveler[];
  selectedSeats: SeatPreference[];
  onSeatSelect: (s: SeatPreference[]) => void;
}) => {
  const [active, setActive] = useState(travelers[0]?.id ?? "1");
  const current = selectedSeats.find((s) => s.travelerId === active);

  const select = (type: SeatPreference["seatType"]) => {
    const rest = selectedSeats.filter((s) => s.travelerId !== active);
    onSeatSelect([...rest, { travelerId: active, seatType: type }]);
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
      <h2 className="text-lg font-medium mb-1">Seat Preferences</h2>
      <p className="text-zinc-500 text-sm mb-5">
        Shared with the airline — actual seat assigned at check-in.
      </p>

      {travelers.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {travelers.map((t, i) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cls(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition",
                active === t.id
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              {t.firstName || `Traveler ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["WINDOW", "AISLE", "MIDDLE", "NO_PREFERENCE"] as const).map(
          (type) => (
            <button
              type="button"
              key={type}
              onClick={() => select(type)}
              className={cls(
                "p-4 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-2",
                current?.seatType === type
                  ? "border-white bg-zinc-800 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              )}
            >
              <span className="text-2xl">
                {type === "WINDOW"
                  ? "🪟"
                  : type === "AISLE"
                  ? "🚶"
                  : type === "MIDDLE"
                  ? "🪑"
                  : "🎲"}
              </span>
              {type.replace("_", " ")}
            </button>
          )
        )}
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) => (
  <div className="flex items-center mb-10">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className="flex flex-col items-center">
          <div
            className={cls(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
              i < current
                ? "bg-green-500 text-black"
                : i === current
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={cls(
              "text-xs mt-1 hidden sm:block",
              i === current ? "text-white" : "text-zinc-600"
            )}
          >
            {s}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={cls(
              "flex-1 h-0.5 mx-1 transition-all",
              i < current ? "bg-green-500" : "bg-zinc-800"
            )}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex gap-3 py-2 border-b border-zinc-800 last:border-0">
      <span className="text-zinc-500 text-xs uppercase tracking-wider font-medium w-32 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-zinc-200 text-sm">{value}</span>
    </div>
  ) : null;

// ─── Cancellation Policy Display ──────────────────────────────────────────────

const CancellationBadge = ({
  policies,
  nonRefundable,
  freeCancellationDeadline,
  currency,
}: {
  policies?: any[];
  nonRefundable?: boolean;
  freeCancellationDeadline?: string | null;
  currency?: string;
}) => {
  if (nonRefundable) {
    return (
      <div className="flex items-center gap-2 mt-2 p-3 bg-red-950/50 border border-red-800 rounded-xl">
        <span className="text-red-400 text-sm font-semibold">
          ⚠️ Non-Refundable
        </span>
        <span className="text-red-400/70 text-xs">
          This booking cannot be cancelled
        </span>
      </div>
    );
  }

  if (freeCancellationDeadline) {
    return (
      <div className="flex items-center gap-2 mt-2 p-3 bg-green-950/50 border border-green-800 rounded-xl">
        <span className="text-green-400 text-sm font-semibold">
          ✓ Free Cancellation
        </span>
        <span className="text-green-400/70 text-xs">
          until {formatDate(freeCancellationDeadline)}
        </span>
      </div>
    );
  }

  if (policies?.length) {
    return (
      <div className="mt-2 p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl">
        <p className="text-amber-400 text-xs font-semibold mb-1">
          Cancellation Penalties
        </p>
        {policies.map((p: any, i: number) => (
          <p key={i} className="text-zinc-400 text-xs">
            From {formatDate(p.from)}: {currency}{" "}
            {Number(p.amount ?? 0).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingInner = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── mode detection ──────────────────────────────────────────
  const flightOfferParam = searchParams.get("flightOffer");
  const rateKey = searchParams.get("rateKey");
  const mode: BookingMode = flightOfferParam ? "flight" : "hotel";

  // ── hotel meta from params ──────────────────────────────────
  const hotel = {
    hotelId: searchParams.get("hotelId") ?? "",
    hotelName: searchParams.get("hotelName") ?? "",
    category: searchParams.get("category") ?? "",
    categoryName: searchParams.get("categoryName") ?? "",
    rating: searchParams.get("rating") ?? "",
    destinationName: searchParams.get("destinationName") ?? "",
    destinationCode: searchParams.get("destinationCode") ?? "",
    address: searchParams.get("address") ?? "",
    postalCode: searchParams.get("postalCode") ?? "",
    city: searchParams.get("city") ?? "",
    countryCode: searchParams.get("countryCode") ?? "",
    latitude: searchParams.get("latitude") ?? "",
    longitude: searchParams.get("longitude") ?? "",
    chainName: searchParams.get("chainName") ?? "",
    hotelPhone: searchParams.get("hotelPhone") ?? "",
    website: searchParams.get("website") ?? "",
    boardName: searchParams.get("boardName") ?? "",
    boardCode: searchParams.get("boardCode") ?? "",
    description: searchParams.get("description") ?? "",
    totalPrice: searchParams.get("totalPrice") ?? "0",
    currency: searchParams.get("currency") ?? "EUR",
    images: searchParams.get("images")?.split(",").filter(Boolean) ?? [],
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) ?? [],
    adults: Number(searchParams.get("adults") ?? 1),
    children: Number(searchParams.get("children") ?? 0),
    paymentType: searchParams.get("paymentType") ?? "AT_WEB",
    nonRefundable: searchParams.get("nonRefundable") === "true",
    freeCancellation: searchParams.get("freeCancellation") ?? null,
    cancellationPolicies: (() => {
      try {
        return JSON.parse(
          decodeURIComponent(searchParams.get("cancellationPolicies") ?? "[]")
        );
      } catch {
        return [];
      }
    })(),
  };

  // ── parse flight offer ──────────────────────────────────────
  const flightOffer = flightOfferParam
    ? (() => {
        try {
          return JSON.parse(decodeURIComponent(flightOfferParam));
        } catch {
          return null;
        }
      })()
    : null;

  // ── determine steps ─────────────────────────────────────────
  const STEPS =
    mode === "flight"
      ? FLIGHT_STEPS
      : hotel.paymentType === "AT_WEB"
      ? HOTEL_PREPAID_STEPS
      : HOTEL_PAY_AT_STEPS;

  const reviewStep = STEPS.length - 1;
  const paymentStep = STEPS.indexOf("Payment");

  // ── state ───────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [seatPreferences, setSeatPreferences] = useState<SeatPreference[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── price change state: stores what to do if price changed ──
  const [priceChanged, setPriceChanged] = useState<{
    oldPrice: number;
    newPrice: number;
    newRateKey: string;
    currency: string;
  } | null>(null);

  // ── active rateKey (may be updated on price change) ─────────
  // This is what we actually send to the backend
  const [activeRateKey, setActiveRateKey] = useState<string>(rateKey ?? "");

  // ── user name split ────────────────────────────────────────
  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "";
  const lastName =
    user?.lastName ?? user?.fullName?.split(" ").slice(1).join(" ") ?? "";

  // ── traveler factory ───────────────────────────────────────
  const makeTraveler = (i: number): Traveler => ({
    id: String(i + 1),
    type: "ADULT",
    firstName: i === 0 ? firstName : "",
    lastName: i === 0 ? lastName : "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    passportIssuingCountry: "",
  });

  // ── For hotel: build initial guest list from adults count ──
  const buildHotelGuests = (): Traveler[] => {
    return Array.from({ length: hotel.adults }, (_, i) => makeTraveler(i));
  };

  const initialValues = {
    contactName: user?.fullName ?? `${firstName} ${lastName}`.trim(),
    contactEmail: user?.email ?? "",
    contactPhone: user?.phone ?? "",
    contactAddress: {
      street: "",
      city: "",
      postalCode: "",
      countryCode: "",
    },
    travelers: mode === "flight" ? [makeTraveler(0)] : buildHotelGuests(),
    remark: "",
    childrenAges:
      mode === "hotel" ? Array.from({ length: hotel.children }, () => 8) : [],
  };

  // ── validation schemas ─────────────────────────────────────

  // For flights: full passport validation on ADULT travelers
  // For hotels: just first name, last name, gender, DOB (for holder/guests)
  const travelerShape = (forMode: BookingMode) =>
    Yup.object({
      firstName: Yup.string().trim().required("First name is required"),
      lastName: Yup.string().trim().required("Last name is required"),
      gender: Yup.string().required("Gender is required"),
      dateOfBirth: Yup.string().required("Date of birth is required"),
      ...(forMode === "flight"
        ? {
            nationality: Yup.string()
              .required("Nationality is required")
              .length(2, "Use 2-letter code e.g. PK"),
            passportNumber: Yup.string()
              .trim()
              .required("Passport number is required"),
            passportExpiry: Yup.string()
              .required("Passport expiry is required")
              .test("future", "Passport must not be expired", (v) =>
                v ? new Date(v) > new Date() : false
              ),
          }
        : {}),
    });

  const fullSchema = Yup.object({
    contactName: Yup.string().trim().required("Full name is required"),
    contactEmail: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    contactPhone: Yup.string().required("Phone number is required"),
    contactAddress: Yup.object({
      street: Yup.string().trim().required("Street address is required"),
      city: Yup.string().trim().required("City is required"),
      postalCode: Yup.string().trim().required("Postal code is required"),
      countryCode: Yup.string()
        .trim()
        .required("Country is required")
        .length(2, "Use 2-letter code e.g. PK"),
    }),
    travelers: Yup.array().of(travelerShape(mode)),
  });

  // ── flight meta ────────────────────────────────────────────
  const flightSeg0 = flightOffer?.itineraries?.[0]?.segments?.[0];
  const flightLastSeg = flightOffer?.itineraries?.[0]?.segments?.at(-1);
  // Base per-person price from the original search offer
  const flightBasePrice = Number(
    flightOffer?.price?.grandTotal ?? flightOffer?.price?.total ?? 0
  );
  const flightCurrency = flightOffer?.price?.currency ?? "USD";
  const flightDuration = flightOffer?.itineraries?.[0]?.duration;

  // ── summary panels ─────────────────────────────────────────

  const HotelSummaryPanel = () => (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden mb-8 border border-zinc-800">
      {hotel.images[0] && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={hotel.images[0]}
            alt={hotel.hotelName}
            className="w-full h-full object-cover"
          />
          {hotel.paymentType === "AT_HOTEL" && (
            <span className="absolute top-3 right-3 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              Pay at Hotel
            </span>
          )}
          {hotel.paymentType === "AT_WEB" && (
            <span className="absolute top-3 right-3 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              Pay Now
            </span>
          )}
        </div>
      )}
      <div className="p-5">
        {hotel.rating && (
          <p className="text-amber-400 text-sm mb-1">
            {"★".repeat(Math.min(Number(hotel.rating), 5))}
          </p>
        )}
        <h2 className="font-bold text-xl text-white mb-1">{hotel.hotelName}</h2>
        {hotel.categoryName && (
          <p className="text-zinc-500 text-xs mb-1">{hotel.categoryName}</p>
        )}
        <p className="text-zinc-400 text-sm mb-1">
          📍{" "}
          {[hotel.address || hotel.city, hotel.destinationName]
            .filter(Boolean)
            .join(", ")}
        </p>
        {hotel.boardName && (
          <p className="text-zinc-500 text-sm mb-3">🍽 {hotel.boardName}</p>
        )}

        {hotel.description && (
          <p className="text-zinc-500 text-xs mb-3 line-clamp-2">
            {hotel.description}
          </p>
        )}

        <CancellationBadge
          policies={hotel.cancellationPolicies}
          nonRefundable={hotel.nonRefundable}
          freeCancellationDeadline={hotel.freeCancellation}
          currency={hotel.currency}
        />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <div className="text-zinc-400 text-sm">
            {hotel.adults} adult{hotel.adults > 1 ? "s" : ""}
            {hotel.children > 0 &&
              ` + ${hotel.children} child${hotel.children > 1 ? "ren" : ""}`}
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl">
              {hotel.currency}{" "}
              {Number(
                priceChanged?.newPrice ?? hotel.totalPrice
              ).toLocaleString()}
            </p>
            {priceChanged && (
              <p className="text-zinc-500 text-xs line-through">
                {hotel.currency} {Number(hotel.totalPrice).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Flight summary — shows live total based on traveler count
  const FlightSummaryPanel = ({ travelerCount }: { travelerCount: number }) => {
    if (!flightOffer) return null;
    const segments = flightOffer.itineraries?.[0]?.segments ?? [];
    const displayTotal = flightBasePrice * travelerCount;

    return (
      <div className="bg-zinc-900 rounded-2xl p-5 mb-8 border border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
          Flight Summary
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold">
              {flightSeg0?.departure?.iataCode}
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              {flightSeg0?.departure?.at
                ? new Date(flightSeg0.departure.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
          <div className="flex-1 border-t border-zinc-700 relative">
            <span className="absolute inset-x-0 -top-3 text-center text-xs text-zinc-500">
              ✈ {formatDuration(flightDuration ?? "")}
            </span>
            <span className="absolute inset-x-0 top-1 text-center text-xs text-zinc-600">
              {segments.length > 1
                ? `${segments.length - 1} stop${segments.length > 2 ? "s" : ""}`
                : "Direct"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {flightLastSeg?.arrival?.iataCode}
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              {flightLastSeg?.arrival?.at
                ? new Date(flightLastSeg.arrival.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
        </div>
        {segments.length > 1 && (
          <div className="space-y-2 mb-4">
            {segments.map((seg: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800 rounded-lg px-3 py-2"
              >
                <span className="text-white font-medium">
                  {seg.carrierCode}
                  {seg.number}
                </span>
                <span>{seg.departure?.iataCode}</span>
                <span>→</span>
                <span>{seg.arrival?.iataCode}</span>
                <span className="ml-auto">
                  {formatDuration(seg.duration ?? "")}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <p className="text-zinc-400 text-sm">
            {formatDate(flightSeg0?.departure?.at ?? "")}
          </p>
          <div className="text-right">
            <p className="text-white font-bold text-xl">
              {flightCurrency} {displayTotal.toLocaleString()}
            </p>
            {travelerCount > 1 && (
              <p className="text-zinc-500 text-xs mt-0.5">
                {flightCurrency} {flightBasePrice.toLocaleString()} × {travelerCount} travelers
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── submit ─────────────────────────────────────────────────
  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      let res: Response;

      if (mode === "hotel") {
        res = await fetch(`${API}/booking/hotel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            // Always use activeRateKey — updated to newRateKey when user accepts price change
            rateKey: activeRateKey,
            hotelId: hotel.hotelId,
            hotelName: hotel.hotelName,
            category: hotel.category,
            categoryName: hotel.categoryName,
            rating: Number(hotel.rating) || null,
            destinationName: hotel.destinationName,
            destinationCode: hotel.destinationCode,
            address: hotel.address,
            postalCode: hotel.postalCode,
            city: hotel.city,
            countryCode: hotel.countryCode,
            latitude: hotel.latitude ? Number(hotel.latitude) : null,
            longitude: hotel.longitude ? Number(hotel.longitude) : null,
            chainName: hotel.chainName,
            hotelPhone: hotel.hotelPhone,
            website: hotel.website,
            description: hotel.description,
            images: hotel.images,
            amenities: hotel.amenities,
            boardName: hotel.boardName,
            boardCode: hotel.boardCode,
            adults: hotel.adults,
            children: hotel.children,
            childrenAges: values.childrenAges,
            rooms: 1,
            // Use the first traveler as the holder (primary guest)
            holderName: values.travelers[0].firstName,
            holderSurname: values.travelers[0].lastName,
            holderEmail: values.contactEmail,
            holderPhone: values.contactPhone,
            remark: values.remark,
            paymentMethodId: paymentMethodId ?? undefined,
          }),
        });
      } else {
        res = await fetch(`${API}/booking/flight`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            flightOffer,
            contactName: values.contactName,
            contactEmail: values.contactEmail,
            contactPhone: values.contactPhone,
            contactAddress: values.contactAddress,
            travelers: values.travelers.map((t, i) => ({
              ...t,
              id: String(i + 1),
            })),
            seatPreferences,
            specialRequests: values.remark,
            paymentMethodId: paymentMethodId ?? undefined,
          }),
        });
      }

      const data = await res.json();

      // ── Price changed: backend returns 409 Conflict ──────────
      // Do NOT set success. Show the price-changed UI so user can
      // accept the new price and re-submit with the updated rateKey.
      if (!res.ok) {
        if (data.priceChanged) {
          setPriceChanged({
            oldPrice: data.oldPrice,
            newPrice: data.newPrice,
            newRateKey: data.newRateKey,
            currency: data.currency ?? hotel.currency,
          });
          // Update activeRateKey so next submit uses the new rate
          setActiveRateKey(data.newRateKey);
          return;
        }
        throw new Error(data.message || "Booking failed");
      }

      // ── Genuine success ────────────────────────────────────
      setSuccess(true);
      // setTimeout(() => navigate("/assistant/booking-log"), 2500);
    } catch (e: any) {
      const rawMsg: string = e.message ?? "";
      const cleanMsg = rawMsg
        .replace(/^Amadeus error:\s*/i, "")
        .replace(/^Hotelbeds error:\s*/i, "")
        .replace(
          /^(This traveler is not priced.*)/i,
          "One or more traveler details could not be processed. Please check all fields and try again."
        )
        .trim();
      setSubmitError(cleanMsg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── success screen ─────────────────────────────────────────
  if (success)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-white px-6 max-w-md"
        >
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-3">Booking Confirmed!</h1>
          <p className="text-zinc-400 text-lg mb-2">
            A confirmation email has been sent to <strong>{user?.email}</strong>.
          </p>
          <p className="text-zinc-500 text-sm">Redirecting to your bookings…</p>
          <Link
            to="/assistant/booking-log"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition"
          >
            View Bookings
          </Link>
        </motion.div>
      </div>
    );

  // ── main render ────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-black py-8 pb-24"
    >
      <div className="max-w-2xl mx-auto px-4 text-white">
        {/* ── Back navigation ──────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/assistant"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm group"
          >
            <span className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition text-lg">
              ←
            </span>
            <span>Back to search</span>
          </Link>
          <div className="flex-1" />
          <span className="text-zinc-600 text-xs">
            {mode === "hotel" ? "Hotel Booking" : "Flight Booking"}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-1">
          {mode === "hotel" ? "🏨 Hotel Booking" : "✈️ Flight Booking"}
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Complete all steps to confirm your booking.
        </p>

        <ProgressBar current={step} steps={STEPS} />

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={fullSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            validateForm,
            setTouched,
          }) => {
            const travelerCount = values.travelers.length;
            const flightTotalPrice = flightBasePrice * travelerCount;

            const handleNext = async () => {
              const allErrors = await validateForm();

              if (step === 0) {
                const hasStep0Errors =
                  allErrors.contactName ||
                  allErrors.contactEmail ||
                  allErrors.contactPhone ||
                  (allErrors as any).contactAddress;

                if (hasStep0Errors) {
                  setTouched(
                    {
                      contactName: true,
                      contactEmail: true,
                      contactPhone: true,
                      contactAddress: {
                        street: true,
                        city: true,
                        postalCode: true,
                        countryCode: true,
                      },
                    },
                    false
                  );
                  return;
                }
              }

              // Step 1 is "Travelers" for flights, "Guests" for hotels — both validate travelers array
              if (step === 1) {
                if ((allErrors as any).travelers) {
                  const travelerTouches = values.travelers.map(() => ({
                    firstName: true,
                    lastName: true,
                    gender: true,
                    dateOfBirth: true,
                    ...(mode === "flight"
                      ? {
                          nationality: true,
                          passportNumber: true,
                          passportExpiry: true,
                        }
                      : {}),
                  }));
                  setTouched({ travelers: travelerTouches } as any, false);
                  return;
                }
              }

              setStep((s) => s + 1);
            };

            const isPaymentReady =
              mode === "hotel" && hotel.paymentType === "AT_HOTEL"
                ? true
                : paymentMethodId !== null || !!user?.last4;

            // The total shown in the confirm button
            const confirmTotal =
              mode === "hotel"
                ? `${priceChanged?.currency ?? hotel.currency} ${Number(
                    priceChanged?.newPrice ?? hotel.totalPrice
                  ).toLocaleString()}`
                : `${flightCurrency} ${flightTotalPrice.toLocaleString()}`;

            return (
              <Form noValidate>
                {/* Summary panel — kept outside AnimatePresence so it persists */}
                {mode === "hotel" ? (
                  <HotelSummaryPanel />
                ) : (
                  <FlightSummaryPanel travelerCount={travelerCount} />
                )}

                <AnimatePresence mode="wait">
                  {/* ── Step 0 · Contact Details ──────────────────── */}
                  {step === 0 && (
                    <motion.div
                      key="s0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="bg-zinc-900 p-6 rounded-2xl mb-6 space-y-4 border border-zinc-800">
                        <h2 className="text-lg font-semibold">
                          Contact Information
                        </h2>

                        <div>
                          <label className={lbl}>Full Name</label>
                          <Field
                            name="contactName"
                            placeholder="Full Name"
                            className={
                              touched.contactName && errors.contactName
                                ? inpErr
                                : inp
                            }
                          />
                          <ErrorMessage
                            name="contactName"
                            component="p"
                            className={errCls}
                          />
                        </div>

                        <div>
                          <label className={lbl}>Email Address</label>
                          <Field
                            name="contactEmail"
                            type="email"
                            placeholder="you@example.com"
                            className={
                              touched.contactEmail && errors.contactEmail
                                ? inpErr
                                : inp
                            }
                          />
                          <ErrorMessage
                            name="contactEmail"
                            component="p"
                            className={errCls}
                          />
                        </div>

                        <div>
                          <label className={lbl}>Phone Number</label>
                          <PhoneInput
                            country="pk"
                            value={values.contactPhone}
                            onChange={(p) => setFieldValue("contactPhone", p)}
                            inputClass={cls(
                              "!w-full !bg-zinc-900 !text-white !text-sm !rounded-xl",
                              touched.contactPhone && errors.contactPhone
                                ? "!border-red-500"
                                : "!border-zinc-800"
                            )}
                            buttonClass="!bg-zinc-900 !border-zinc-800 !rounded-l-xl"
                            dropdownClass="!bg-zinc-900 !text-white"
                          />
                          <ErrorMessage
                            name="contactPhone"
                            component="p"
                            className={errCls}
                          />
                        </div>

                        <div className="space-y-3 pt-1">
                          <h3 className="text-sm font-semibold text-zinc-300">
                            Billing Address
                          </h3>

                          <div>
                            <label className={lbl}>Street Address</label>
                            <Field
                              name="contactAddress.street"
                              placeholder="123 Main Street"
                              className={
                                (touched as any).contactAddress?.street &&
                                (errors as any).contactAddress?.street
                                  ? inpErr
                                  : inp
                              }
                            />
                            <ErrorMessage
                              name="contactAddress.street"
                              component="p"
                              className={errCls}
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className={lbl}>City</label>
                              <Field
                                name="contactAddress.city"
                                placeholder="Lahore"
                                className={
                                  (touched as any).contactAddress?.city &&
                                  (errors as any).contactAddress?.city
                                    ? inpErr
                                    : inp
                                }
                              />
                              <ErrorMessage
                                name="contactAddress.city"
                                component="p"
                                className={errCls}
                              />
                            </div>
                            <div>
                              <label className={lbl}>Postal Code</label>
                              <Field
                                name="contactAddress.postalCode"
                                placeholder="54000"
                                className={
                                  (touched as any).contactAddress?.postalCode &&
                                  (errors as any).contactAddress?.postalCode
                                    ? inpErr
                                    : inp
                                }
                              />
                              <ErrorMessage
                                name="contactAddress.postalCode"
                                component="p"
                                className={errCls}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={lbl}>
                              Country Code (2 letters)
                            </label>
                            <Field
                              name="contactAddress.countryCode"
                              placeholder="PK"
                              maxLength={2}
                              className={cls(
                                (touched as any).contactAddress?.countryCode &&
                                  (errors as any).contactAddress?.countryCode
                                  ? inpErr
                                  : inp,
                                "uppercase"
                              )}
                            />
                            <ErrorMessage
                              name="contactAddress.countryCode"
                              component="p"
                              className={errCls}
                            />
                          </div>
                        </div>

                        {mode === "hotel" && hotel.children > 0 && (
                          <div>
                            <label className={lbl}>Children Ages</label>
                            <div className="grid grid-cols-3 gap-2">
                              {values.childrenAges.map((age, i) => (
                                <input
                                  key={i}
                                  type="number"
                                  min={0}
                                  max={17}
                                  value={age}
                                  onChange={(e) => {
                                    const a = [...values.childrenAges];
                                    a[i] = Number(e.target.value);
                                    setFieldValue("childrenAges", a);
                                  }}
                                  placeholder={`Child ${i + 1}`}
                                  className={inp}
                                />
                              ))}
                            </div>
                            <p className="text-zinc-600 text-xs mt-1">
                              Age at time of check-in
                            </p>
                          </div>
                        )}

                        <div>
                          <label className={lbl}>
                            Special Requests (optional)
                          </label>
                          <Field
                            as="textarea"
                            name="remark"
                            placeholder="Dietary requirements, accessibility needs, early check-in request…"
                            className={cls(inp, "h-24 resize-none")}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 1 · Travelers / Guests ───────────────── */}
                  {step === 1 && (
                    <motion.div
                      key="s1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {/* Section header differs by mode */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-4">
                        {mode === "flight" ? (
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">
                              {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
                            </span>
                            <div className="text-right">
                              <span className="text-white font-semibold">
                                {flightCurrency} {flightTotalPrice.toLocaleString()}
                              </span>
                              {travelerCount > 1 && (
                                <p className="text-zinc-500 text-xs">
                                  {flightCurrency} {flightBasePrice.toLocaleString()} × {travelerCount}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-white text-sm font-medium">
                              Guest Information
                            </p>
                            <p className="text-zinc-500 text-xs mt-0.5">
                              Enter details for all {hotel.adults} adult guest{hotel.adults > 1 ? "s" : ""}
                              {hotel.children > 0 ? ` + ${hotel.children} child${hotel.children > 1 ? "ren" : ""}` : ""}.
                              The first guest will be the lead holder.
                            </p>
                          </div>
                        )}
                      </div>

                      <FieldArray name="travelers">
                        {({ push, remove }) => (
                          <>
                            {values.travelers.map((traveler, index) => {
                              const tT =
                                ((touched as any).travelers?.[index] as any) ??
                                {};
                              const tE =
                                ((errors as any).travelers?.[index] as any) ??
                                {};

                              return (
                                <div
                                  key={index}
                                  className="bg-zinc-900 p-6 rounded-2xl mb-5 space-y-4 border border-zinc-800"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h2 className="text-lg font-semibold">
                                        {mode === "hotel"
                                          ? index === 0
                                            ? "Lead Guest"
                                            : `Guest ${index + 1}`
                                          : index === 0
                                          ? "Primary Traveler"
                                          : `Traveler ${index + 1}`}
                                      </h2>
                                      {index === 0 && (
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                          {mode === "hotel"
                                            ? "Used as the hotel booking holder"
                                            : "This will be the lead passenger"}
                                        </p>
                                      )}
                                    </div>
                                    {/* Allow removing extra travelers (flights only — hotel guests are fixed by room occupancy) */}
                                    {mode === "flight" &&
                                      values.travelers.length > 1 &&
                                      index > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => remove(index)}
                                          className="text-red-400 text-xs hover:text-red-300 px-3 py-1 border border-red-800 rounded-lg"
                                        >
                                          Remove
                                        </button>
                                      )}
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className={lbl}>First Name</label>
                                      <Field
                                        name={`travelers.${index}.firstName`}
                                        placeholder={mode === "flight" ? "As on passport" : "First name"}
                                        className={
                                          tT.firstName && tE.firstName
                                            ? inpErr
                                            : inp
                                        }
                                      />
                                      <ErrorMessage
                                        name={`travelers.${index}.firstName`}
                                        component="p"
                                        className={errCls}
                                      />
                                    </div>

                                    <div>
                                      <label className={lbl}>Last Name</label>
                                      <Field
                                        name={`travelers.${index}.lastName`}
                                        placeholder={mode === "flight" ? "As on passport" : "Last name"}
                                        className={
                                          tT.lastName && tE.lastName
                                            ? inpErr
                                            : inp
                                        }
                                      />
                                      <ErrorMessage
                                        name={`travelers.${index}.lastName`}
                                        component="p"
                                        className={errCls}
                                      />
                                    </div>

                                    <div>
                                      <label className={lbl}>Gender</label>
                                      <Field
                                        as="select"
                                        name={`travelers.${index}.gender`}
                                        className={
                                          tT.gender && tE.gender ? inpErr : inp
                                        }
                                      >
                                        <option value="">Select gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                      </Field>
                                      <ErrorMessage
                                        name={`travelers.${index}.gender`}
                                        component="p"
                                        className={errCls}
                                      />
                                    </div>

                                    <div>
                                      <label className={lbl}>
                                        Date of Birth
                                      </label>
                                      <Field
                                        type="date"
                                        name={`travelers.${index}.dateOfBirth`}
                                        className={
                                          tT.dateOfBirth && tE.dateOfBirth
                                            ? inpErr
                                            : inp
                                        }
                                        max={
                                          new Date().toISOString().split("T")[0]
                                        }
                                      />
                                      <ErrorMessage
                                        name={`travelers.${index}.dateOfBirth`}
                                        component="p"
                                        className={errCls}
                                      />
                                    </div>

                                    {/* Flight-only fields */}
                                    {mode === "flight" && (
                                      <>
                                        <div>
                                          <label className={lbl}>
                                            Traveler Type
                                          </label>
                                          <Field
                                            as="select"
                                            name={`travelers.${index}.type`}
                                            className={inp}
                                          >
                                            <option value="ADULT">
                                              Adult (12+)
                                            </option>
                                            <option value="CHILD">
                                              Child (2–11)
                                            </option>
                                            <option value="INFANT">
                                              Infant (&lt;2)
                                            </option>
                                          </Field>
                                        </div>

                                        <div>
                                          <label className={lbl}>
                                            Nationality
                                          </label>
                                          <Field
                                            name={`travelers.${index}.nationality`}
                                            placeholder="PK"
                                            maxLength={2}
                                            className={cls(
                                              tT.nationality && tE.nationality
                                                ? inpErr
                                                : inp,
                                              "uppercase"
                                            )}
                                          />
                                          <ErrorMessage
                                            name={`travelers.${index}.nationality`}
                                            component="p"
                                            className={errCls}
                                          />
                                        </div>

                                        <div>
                                          <label className={lbl}>
                                            Passport Number
                                          </label>
                                          <Field
                                            name={`travelers.${index}.passportNumber`}
                                            placeholder="AB1234567"
                                            className={cls(
                                              tT.passportNumber &&
                                                tE.passportNumber
                                                ? inpErr
                                                : inp,
                                              "uppercase"
                                            )}
                                          />
                                          <ErrorMessage
                                            name={`travelers.${index}.passportNumber`}
                                            component="p"
                                            className={errCls}
                                          />
                                        </div>

                                        <div>
                                          <label className={lbl}>
                                            Passport Expiry Date
                                          </label>
                                          <Field
                                            type="date"
                                            name={`travelers.${index}.passportExpiry`}
                                            className={
                                              tT.passportExpiry &&
                                              tE.passportExpiry
                                                ? inpErr
                                                : inp
                                            }
                                            min={
                                              new Date()
                                                .toISOString()
                                                .split("T")[0]
                                            }
                                          />
                                          <ErrorMessage
                                            name={`travelers.${index}.passportExpiry`}
                                            component="p"
                                            className={errCls}
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className={lbl}>
                                            Passport Issuing Country (optional)
                                          </label>
                                          <Field
                                            name={`travelers.${index}.passportIssuingCountry`}
                                            placeholder="PK"
                                            maxLength={2}
                                            className={cls(inp, "uppercase")}
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add traveler button — flights only */}
                            {mode === "flight" &&
                              values.travelers.length < 9 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    push(makeTraveler(values.travelers.length))
                                  }
                                  className="mb-6 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm transition w-full"
                                >
                                  + Add Traveler
                                </button>
                              )}
                          </>
                        )}
                      </FieldArray>
                    </motion.div>
                  )}

                  {/* ── Step 2 · Seats (flight only) ──────────────── */}
                  {step === 2 && mode === "flight" && (
                    <motion.div
                      key="s2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <SeatPreferences
                        travelers={values.travelers}
                        selectedSeats={seatPreferences}
                        onSeatSelect={setSeatPreferences}
                      />
                    </motion.div>
                  )}

                  {/* ── Payment step ───────────────────────────────── */}
                  {step === paymentStep && paymentStep !== -1 && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="bg-zinc-900 p-6 rounded-2xl mb-6 border border-zinc-800">
                        <h2 className="text-lg font-semibold mb-1">
                          Payment Details
                        </h2>
                        <p className="text-zinc-500 text-sm mb-6">
                          {mode === "hotel"
                            ? "Your card will be charged upon booking confirmation."
                            : "Your card is charged only after the booking is confirmed with the airline."}
                        </p>

                        {/* Charge summary */}
                        <div className="bg-zinc-800 rounded-xl p-4 mb-5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-zinc-400 text-sm">
                              Amount to charge
                            </span>
                            <span className="text-white font-bold text-lg">
                              {mode === "hotel"
                                ? `${hotel.currency} ${Number(priceChanged?.newPrice ?? hotel.totalPrice).toLocaleString()}`
                                : `${flightCurrency} ${flightTotalPrice.toLocaleString()}`}
                            </span>
                          </div>

                          {mode === "flight" && travelerCount > 1 && (
                            <div className="border-t border-zinc-700 pt-2 mt-1 space-y-1">
                              <div className="flex justify-between text-xs text-zinc-500">
                                <span>Per person</span>
                                <span>
                                  {flightCurrency} {flightBasePrice.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-zinc-500">
                                <span>× {travelerCount} travelers</span>
                                <span>
                                  = {flightCurrency} {flightTotalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}

                          {mode === "hotel" && hotel.adults + hotel.children > 1 && (
                            <p className="text-zinc-500 text-xs mt-1">
                              {hotel.adults} adult{hotel.adults > 1 ? "s" : ""}
                              {hotel.children > 0
                                ? ` + ${hotel.children} child${hotel.children > 1 ? "ren" : ""}`
                                : ""}
                            </p>
                          )}
                        </div>

                        <StripeCardForm
                          onTokenReady={setPaymentMethodId}
                          savedLast4={user?.last4}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ── Review step ────────────────────────────────── */}
                  {step === reviewStep && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {/* ── Price changed alert ──────────────────────── */}
                      {priceChanged && (
                        <div className="bg-amber-950 border border-amber-700 rounded-xl p-5 mb-6">
                          <h3 className="text-amber-400 font-semibold mb-2">
                            ⚠️ Price has changed
                          </h3>
                          <p className="text-zinc-300 text-sm mb-1">
                            Old price:{" "}
                            <span className="line-through text-zinc-500">
                              {priceChanged.currency}{" "}
                              {priceChanged.oldPrice.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-white font-bold text-lg">
                            New price: {priceChanged.currency}{" "}
                            {priceChanged.newPrice.toLocaleString()}
                          </p>
                          <p className="text-zinc-400 text-sm mt-2">
                            The room rate has been updated. Click{" "}
                            <strong className="text-white">
                              Confirm & Pay
                            </strong>{" "}
                            below to proceed at the new price, or go back to
                            search for other options.
                          </p>
                        </div>
                      )}

                      <div className="bg-zinc-900 rounded-2xl mb-6 overflow-hidden border border-zinc-800">
                        <div className="px-6 py-4 border-b border-zinc-800">
                          <h2 className="text-lg font-semibold">
                            Review Your Booking
                          </h2>
                        </div>

                        {/* Contact */}
                        <div className="px-6 py-5 border-b border-zinc-800">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                            Contact
                          </p>
                          <InfoRow label="Name" value={values.contactName} />
                          <InfoRow label="Email" value={values.contactEmail} />
                          <InfoRow label="Phone" value={values.contactPhone} />
                          {values.contactAddress.street && (
                            <InfoRow
                              label="Address"
                              value={[
                                values.contactAddress.street,
                                values.contactAddress.city,
                                values.contactAddress.postalCode,
                                values.contactAddress.countryCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            />
                          )}
                        </div>

                        {/* Guests / Travelers */}
                        <div className="px-6 py-5 border-b border-zinc-800">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                            {mode === "hotel"
                              ? `Guests (${values.travelers.length})`
                              : `Travelers (${values.travelers.length})`}
                          </p>
                          {values.travelers.map((t, i) => (
                            <div key={i} className="mb-3 last:mb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium">
                                  {t.firstName} {t.lastName}
                                </span>
                                {mode === "flight" && (
                                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                    {t.type}
                                  </span>
                                )}
                                {i === 0 && mode === "hotel" && (
                                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                    Lead Guest
                                  </span>
                                )}
                                {t.gender && (
                                  <span className="text-xs text-zinc-600">
                                    {t.gender}
                                  </span>
                                )}
                              </div>
                              {t.dateOfBirth && (
                                <p className="text-zinc-500 text-xs">
                                  DOB: {formatDate(t.dateOfBirth)}
                                </p>
                              )}
                              {t.passportNumber && (
                                <p className="text-zinc-500 text-xs">
                                  Passport: {t.passportNumber} (exp.{" "}
                                  {formatDate(t.passportExpiry)})
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Hotel-specific details */}
                        {mode === "hotel" && (
                          <div className="px-6 py-5 border-b border-zinc-800">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                              Stay Details
                            </p>
                            <InfoRow label="Hotel" value={hotel.hotelName} />
                            <InfoRow
                              label="Location"
                              value={[
                                hotel.address || hotel.city,
                                hotel.destinationName,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            />
                            <InfoRow label="Board" value={hotel.boardName} />
                            <InfoRow
                              label="Guests"
                              value={`${hotel.adults} adult${hotel.adults > 1 ? "s" : ""}${
                                hotel.children > 0
                                  ? ` + ${hotel.children} child${hotel.children > 1 ? "ren" : ""}`
                                  : ""
                              }`}
                            />
                            {values.childrenAges.length > 0 && (
                              <InfoRow
                                label="Child Ages"
                                value={values.childrenAges.join(", ") + " yrs"}
                              />
                            )}
                            {values.remark && (
                              <InfoRow label="Requests" value={values.remark} />
                            )}
                          </div>
                        )}

                        {/* Flight-specific details */}
                        {mode === "flight" && (
                          <>
                            <div className="px-6 py-5 border-b border-zinc-800">
                              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                                Flight Details
                              </p>
                              <InfoRow
                                label="Route"
                                value={`${flightSeg0?.departure?.iataCode ?? ""} → ${flightLastSeg?.arrival?.iataCode ?? ""}`}
                              />
                              <InfoRow
                                label="Departure"
                                value={
                                  flightSeg0?.departure?.at
                                    ? formatDate(flightSeg0.departure.at)
                                    : undefined
                                }
                              />
                              <InfoRow
                                label="Duration"
                                value={formatDuration(flightDuration ?? "")}
                              />
                              {values.remark && (
                                <InfoRow label="Requests" value={values.remark} />
                              )}
                            </div>

                            {seatPreferences.length > 0 && (
                              <div className="px-6 py-5 border-b border-zinc-800">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                                  Seat Preferences
                                </p>
                                {seatPreferences.map((s, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between py-1"
                                  >
                                    <span className="text-zinc-400 text-sm">
                                      Traveler {s.travelerId}
                                    </span>
                                    <span className="text-zinc-200 text-sm">
                                      {s.seatType.replace("_", " ")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* Payment */}
                        <div className="px-6 py-5 border-b border-zinc-800">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                            Payment
                          </p>
                          {mode === "hotel" && hotel.paymentType === "AT_HOTEL" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 text-sm">
                                🏨 Pay at hotel upon arrival
                              </span>
                            </div>
                          ) : (
                            <InfoRow
                              label="Card"
                              value={
                                paymentMethodId === null && user?.last4
                                  ? `Saved card •••• ${user.last4}`
                                  : paymentMethodId
                                  ? "New card (verified ✓)"
                                  : "—"
                              }
                            />
                          )}
                        </div>

                        {/* Total */}
                        <div className="px-6 py-5">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold">
                              {mode === "hotel"
                                ? `${priceChanged?.currency ?? hotel.currency} ${Number(
                                    priceChanged?.newPrice ?? hotel.totalPrice
                                  ).toLocaleString()}`
                                : `${flightCurrency} ${flightTotalPrice.toLocaleString()}`}
                            </span>
                          </div>
                          {mode === "flight" && travelerCount > 1 && (
                            <p className="text-zinc-500 text-xs text-right mt-1">
                              {flightCurrency} {flightBasePrice.toLocaleString()} per person × {travelerCount}
                            </p>
                          )}
                          {mode === "hotel" && hotel.paymentType === "AT_HOTEL" && (
                            <p className="text-amber-400 text-xs mt-1">
                              Payable at the property
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Terms */}
                      <p className="text-zinc-600 text-xs text-center mb-4">
                        By confirming, you agree to our{" "}
                        <a href="/terms-condition" className="underline text-zinc-500">
                          Terms of Service
                        </a>{" "}
                        and the property's cancellation policy.
                      </p>

                      {submitError && (
                        <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-4">
                          <p className="text-red-300 text-sm font-semibold mb-1">
                            Booking failed
                          </p>
                          <p className="text-red-400 text-sm">{submitError}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Navigation ──────────────────────────────────── */}
                <div className="flex gap-3 mt-4">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setStep((s) => s - 1);
                        setSubmitError(null);
                      }}
                      className="flex items-center gap-2 px-6 py-4 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition font-medium"
                    >
                      ← Back
                    </button>
                  ) : (
                    <Link
                      to="/assistant"
                      className="flex items-center gap-2 px-6 py-4 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition font-medium"
                    >
                      ← Cancel
                    </Link>
                  )}

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition"
                    >
                      Continue →
                    </button>
                  ) : (
                    /* ── Confirm & Pay / Confirm Booking button ── */
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        (mode === "flight" && !isPaymentReady) ||
                        (mode === "hotel" &&
                          hotel.paymentType === "AT_WEB" &&
                          !isPaymentReady)
                      }
                      className="flex-1 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? "Confirming…"
                        : mode === "hotel" && hotel.paymentType === "AT_HOTEL"
                        ? priceChanged
                          ? `Confirm at ${confirmTotal}`
                          : "Confirm Booking"
                        : priceChanged
                        ? `Confirm at new price — ${confirmTotal}`
                        : `Confirm & Pay ${confirmTotal}`}
                    </button>
                  )}
                </div>

                {/* Payment warning on review step */}
                {step === reviewStep &&
                  !(mode === "hotel" && hotel.paymentType === "AT_HOTEL") &&
                  !isPaymentReady && (
                    <p className="text-red-400 text-xs text-center mt-2">
                      Please go back to the Payment step and confirm your card.
                    </p>
                  )}
              </Form>
            );
          }}
        </Formik>
      </div>
    </motion.div>
  );
};

const Booking = () => (
  <Elements stripe={stripePromise}>
    <Header />
    <BookingInner />
    <Footer />
  </Elements>
);

export default Booking;