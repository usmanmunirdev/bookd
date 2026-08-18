import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { FaRegEdit } from "react-icons/fa";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useAuth } from "../../utils";
import { toast } from "react-toastify";
import Plans from "@/pages/Plans";

const FEATURE_LABELS: Record<string, string> = {
  aiPoweredSearch: "AI Powered Search",
  flightBooking: "Flight Booking",
  hotelBooking: "Hotel Booking",
  restaurantBooking: "Restaurant Booking",
  bookingHistory: "Booking History",
  smartRecommendations: "Smart Recommendations",
  prioritySupport: "Priority Support",
  earlyFeatureAccess: "Early Feature Access",
  conciergeAccess: "Concierge Access",
};

const API = import.meta.env.VITE_API_BASE_URL;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#fff",
      fontSize: "16px",
      fontFamily: '"Gowun Batang", serif',
      "::placeholder": {
        color: "#D4AF379C",
      },
    },
    invalid: {
      color: "#FF0000",
    },
  },
};

const MembershipBilling = () => {
  const { user, refreshUser, token } = useAuth();
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [last4, setLast4] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const [loadingConfirmation, setLoadingConfirmation] = useState(false);
  const [modal, setModal] = useState<{ type: "cancel" | "reactivate" } | null>(
    null
  );

  const buildFeatures = (plan: any) => {
    const list: string[] = [];

    if ("aiQueryLimit" in plan) {
      list.push(
        `AI Queries: ${
          plan.aiQueryLimit === null || plan.aiQueryLimit === undefined
            ? "Unlimited"
            : plan.aiQueryLimit
        }`
      );
    }

    // Boolean features
    Object.keys(FEATURE_LABELS).forEach((key) => {
      if ((plan as any)[key]) {
        list.push(FEATURE_LABELS[key]);
      }
    });

    // Reminders in ONE line
    const reminders: string[] = [];
    if (plan.emailReminder) reminders.push("Email");
    if (plan.smsReminder) reminders.push("SMS");
    if (plan.calendarReminder) reminders.push("Calendar");

    if (reminders.length) {
      list.push(`Reminders: ${reminders.join(", ")}`);
    }

    return list;
  };

  const features = buildFeatures(user?.subscription?.plan || {});

  const getPlanBackground = (plan: any) => {
    const backgrounds: Record<any, string> = {
      Free: "bg-[#2E2D2D]",
      Premium: "bg-[#4B4C46]",
      Elite: "bg-[#D4AF37]",
      Platinum: "bg-[#D4AF37]/20",
    };
    return backgrounds[plan];
  };

  useEffect(() => {
    if (user?.last4) {
      setLast4(user?.last4 || "");
    }
  }, [user]);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    setLoading(true);

    try {
      // 1️⃣ Get SetupIntent
      const { data } = await axios.post(
        `${API}/stripe-payment/setup-intent/${user.id}`
      );

      // 2️⃣ Confirm card (handles SCA automatically)
      const { error, setupIntent } = await stripe.confirmCardSetup(
        data.clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              email: user.email,
            },
          },
        }
      );

      if (error) throw error;

      // 3️⃣ Save payment method
      const res = await axios.post(`${API}/stripe-payment/add/${user.id}`, {
        paymentMethodId: setupIntent.payment_method,
      });

      setLast4(res.data.last4);
      toast.success("Card saved successfully");
      setShowStripeModal(false);
      refreshUser();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save card");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!user && !token) return;

    try {
      await axios.delete(`${API}/subscription/cancel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Membership cancelled successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to cancel membership"
      );
    }
  };

  const handleReactiveMembership = async () => {
    if (!user && !token) return;

    try {
      await axios.post(`${API}/subscription/re-activate`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Membership reactivated successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to cancel membership"
      );
    }
  };

  const handleConfirm = async () => {
    if (!modal) return;
    setLoadingConfirmation(true);

    try {
      if (modal.type === "cancel") {
        await axios.post(`${API}/subscription/cancel`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modal.type === "reactivate") {
        await axios.post(`${API}/subscription/re-activate`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success(
        `Membership ${
          modal.type === "cancel" ? "cancelled" : "reactivated"
        } successfully`
      );
      refreshUser();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingConfirmation(false);
      setModal(null);
    }
  };

  return (
    <div className="w-full mx-auto">
      <motion.div
        key="membership-billing"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <p className="xl:text-[20px] ... text-white">Current Plan:</p>
              <span
                className={`text-[14px] ... rounded-[30px] px-[13px] ml-[10px] ${getPlanBackground(
                  user?.subscription?.plan?.title || "Free"
                )}`}
              >
                {user?.subscription?.plan?.title || "Free"}
              </span>
            </div>
            <div className="flex gap-4">
              {user?.subscription?.status === "active" &&
                user?.subscription?.plan?.price > 0 &&
                !user?.subscription?.cancelAtPeriodEnd && (
                  <div className="relative inline-block group">
                    <button
                      onClick={() => setModal({ type: "cancel" })}
                      className="text-red-400 hover:text-red-500 transition disabled:opacity-50"
                      disabled={loadingConfirmation}
                    >
                      {loadingConfirmation && modal?.type === "cancel"
                        ? "Processing..."
                        : "Cancel Current Plan"}
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block max-w-xs text-center rounded-md bg-black px-3 py-2 text-xs text-white shadow-lg z-50">
                      Your subscription will remain active until the end of the
                      current billing period.
                    </div>
                  </div>
                )}

              {user?.subscription?.status === "active" &&
                user?.subscription?.plan?.price > 0 &&
                user?.subscription?.cancelAtPeriodEnd && (
                  <div className="relative inline-block group">
                    <button
                      onClick={() => setModal({ type: "reactivate" })}
                      className="text-green-400 hover:text-green-500 transition disabled:opacity-50"
                      disabled={loadingConfirmation}
                    >
                      {loadingConfirmation && modal?.type === "reactivate"
                        ? "Processing..."
                        : "Reactivate Plan"}
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block max-w-xs text-center rounded-md bg-black px-3 py-2 text-xs text-white shadow-lg z-50">
                      Your subscription will continue without interruption.
                    </div>
                  </div>
                )}

              {modal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
                    <h2 className="text-lg font-semibold mb-4">
                      {modal.type === "cancel"
                        ? "Cancel Subscription?"
                        : "Reactivate Subscription?"}
                    </h2>
                    <p className="mb-6">
                      {modal.type === "cancel"
                        ? "Are you sure you want to cancel your subscription? You will not be charged after the current billing period."
                        : "Are you sure you want to reactivate your subscription? You will continue getting charged as usual."}
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setModal(null)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={loadingConfirmation}
                      >
                        No
                      </button>
                      <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 rounded text-white ${
                          modal.type === "cancel"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        disabled={loadingConfirmation}
                      >
                        {loadingConfirmation ? "Processing..." : "Yes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white">
                {user?.subscription?.plan?.description} $
                {user?.subscription?.plan?.price} {`/ Month`}
              </p>
            </div>
            <ul className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun text-white mb-[30px]">
              {features?.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 mb-2">
                  <div className="relative">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] absolute right-0 top-[-3px]"></span>
                    <div className="relative">
                      <div className="h-[2px] w-[20px] bg-[#D4AF37] "></div>
                    </div>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sm:mb-[30px] mb-[20px]">
          <label className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#F9F9F9] mb-[12px] flex">
            Payment Method
          </label>
          <div className="w-full bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[12px] lg:py-[11px] md:py-[10px] sm:py-[9px] py-[8px] px-[15px] rounded-[7px]">
            <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF379C]">
              {last4 !== "" ? `**** **** **** ${last4}` : "By Credit Card"}
            </p>
            <button
              className="flex items-center justify-center"
              onClick={() => setShowStripeModal(true)}
            >
              <FaRegEdit size={20} className="text-[#D4AF37]" />
            </button>
          </div>
        </div>

        {/* Stripe Modal with Separate Fields */}
        {showStripeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1F1A0D] p-6 rounded-lg w-full max-w-md border border-[#3A3219]">
              <h2 className="text-white text-xl font-semibold mb-6 font-gowun">
                Enter Card Details
              </h2>
              <form onSubmit={handleCardSubmit}>
                <div className="space-y-4 mb-6">
                  {/* Card Number */}
                  <div>
                    <label className="block text-[#D4AF37] text-sm mb-2 font-gowun">
                      Card Number
                    </label>
                    <div className="bg-[#2A2410] border border-[#3A3219] rounded-md p-3">
                      <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>

                  {/* Expiry and CVC in a row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Card Expiry */}
                    <div>
                      <label className="block text-[#D4AF37] text-sm mb-2 font-gowun">
                        Expiry Date
                      </label>
                      <div className="bg-[#2A2410] border border-[#3A3219] rounded-md p-3">
                        <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                    </div>

                    {/* Card CVC */}
                    <div>
                      <label className="block text-[#D4AF37] text-sm mb-2 font-gowun">
                        CVC
                      </label>
                      <div className="bg-[#2A2410] border border-[#3A3219] rounded-md p-3">
                        <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-6 py-2 rounded bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-500/20 transition font-gowun"
                    onClick={() => setShowStripeModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !stripe}
                    className={`px-6 py-2 rounded bg-[#D4AF37] text-black font-medium border border-[#D4AF37] hover:bg-transparent hover:text-[#D4AF37] transition font-gowun ${
                      loading || !stripe ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Saving..." : "Save Card"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* <Plans /> */}
      </motion.div>
    </div>
  );
};

export default MembershipBilling;

{
  /* <div className="flex items-center grid md:grid-cols-2 gap-[20px] sm:mb-[30px] mb-[20px]">
                <div>
                  <p className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun text-white">
                    Usage: {usage.current} of {usage.max} bookings used this
                    month
                  </p>
                  <Progress
                    value={(usage.current / usage.max) * 100}
                    className="w-full lg:max-w-[500px] max-w-auto mt-2 h-2 bg-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className={`max-w-[212px] px-4 py-[10px] rounded-[30px] border border-[#2E2D2D] text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun bg-[#D4AF37] hover:bg-transparent hover:text-white hover:border-[#D4AF37] transition-all duration-300 cursor-pointer ${
                      isPlatinum ? "hidden" : ""
                    }`}
                  >
                    Unlock VIP perks now
                  </button>
                </div>
              </div> */
}
