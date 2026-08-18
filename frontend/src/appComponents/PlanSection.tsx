import { useEffect, useState } from "react";
import axios from "axios";
import PlanArrow from "../assets/plan-arrow.svg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";
import { useAuth } from "../../utils";
import { useNavigate } from "react-router-dom";

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

interface Plan {
  id: string;
  title: string;
  description?: string;
  price: number;
  aiQueryLimit?: number | null;
  aiPoweredSearch?: boolean;
  flightBooking?: boolean;
  hotelBooking?: boolean;
  restaurantBooking?: boolean;
  calendarReminder?: boolean;
  emailReminder?: boolean;
  smsReminder?: boolean;
  bookingHistory?: boolean;
  smartRecommendations?: boolean;
  prioritySupport?: boolean;
  earlyFeatureAccess?: boolean;
  conciergeAccess?: boolean;
}

const API = import.meta.env.VITE_API_BASE_URL;

const PlanSection = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans`);
      setPlans(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    arrows: false,
    // autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
      { breakpoint: 561, settings: { slidesToShow: 1 } },
    ],
  };

  const buildFeatures = (plan: Plan) => {
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

  const subscribeToPlan = async (planId: string) => {
    try {
      if (loading) return;
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      const response = await axios.post(
        `${API}/subscription/create`,
        { planId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.success === false && data.code === "PAYMENT_METHOD_REQUIRED") {
        toast.warn("Please add a payment method first");
        navigate("/assistant/settings/membership-billing");
        return;
      }
      toast.success(
        "Subscription initiated successfully! Soon your plan will be active."
      );
      setTimeout(() => {
        refreshUser();
      }, 5000);
    } catch (error: any) {
      console.error("Subscription error:", error);
      const message = error?.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#FAF7F2] xl:py-[70px] lg:py-[60px] md:py-[50px] sm:py-[40px] pt-[35px] pb-[45px] px-4">
      <div className="text-center xl:mb-16 lg:mb-12 md:mb-8 mb-6">
        <h1 className="xl:text-[48px] xl:leading-[54px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] font-carien text-[#1C1C1C] mb-3">
          Pricing Plans
        </h1>
        <p className="text-[#5B5B5B] xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-gowun">
          Simple, transparent pricing for every traveler. Pick the plan that
          fits your journey.
        </p>
      </div>

      {/* Desktop */}
      <div className="md:flex flex-col md:flex-row justify-center items-center xl:gap-10 gap-4 hidden">
        {plans.map((plan) => {
          const features = buildFeatures(plan);

          return (
            <div
              key={plan.id}
              className="relative w-full max-w-[320px] rounded-[16px] overflow-hidden bg-[#0C0E12] min-h-[385px]"
            >
              <div className="rounded-[16px] xl:p-8 lg:p-8 md:p-7 sm:p-7 p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-white xl:text-[24px] font-carien mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-[#D1D1D1] xl:text-[14px] text-[12px] leading-[20px] mb-2">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-white xl:text-[40px] lg:text-[35px] font-carien">
                    ${Number(plan.price).toFixed(2)}
                    <span className="text-[17px] text-[#A7A7A7] ml-1">
                      / month
                    </span>
                  </h4>
                </div>

                <div className="flex flex-col gap-2 mb-6 text-white text-[14px] font-gowun max-h-[137px] overflow-auto">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#E5B84D] rounded-full"></span>
                      <span className="font-carien">{f}</span>
                    </div>
                  ))}
                </div>
                {user?.subscription?.plan?.id == plan.id ? (
                  <button
                    disabled
                    className="bg-gray-500 cursor-not-allowed text-white text-[15px] font-carien rounded-full py-3 w-full flex justify-center items-center gap-2"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => subscribeToPlan(plan.id)}
                    disabled={loading}
                    className={`text-[15px] font-carien rounded-full py-3 w-full flex justify-center items-center gap-2 transition
      ${
        loading
          ? "bg-[#D4AF37] opacity-60 cursor-not-allowed"
          : "bg-[#D4AF37] hover:bg-[#c59c30]"
      }
    `}
                  >
                    <img src={PlanArrow} alt="arrow" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="max-w-[1050px] m-auto md:hidden">
        <Slider className="plan-slider" {...settings}>
          {plans.map((plan) => {
            const features = buildFeatures(plan);

            return (
              <div key={plan.id} className="px-2">
                <div className="rounded-[16px] bg-[#0C0E12] p-6 flex flex-col justify-between h-full">
                  <h3 className="text-white text-[20px] font-carien mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-[#D1D1D1] text-[14px] mb-2">
                    {plan.description}
                  </p>

                  <h4 className="text-white text-[25px] font-carien mb-4">
                    ${Number(plan.price).toFixed(2)}
                    <span className="text-[#A7A7A7] ml-1">/ month</span>
                  </h4>

                  <div className="flex flex-col gap-2 mb-6 text-white text-[14px] max-h-[137px] overflow-auto">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#E5B84D] rounded-full"></span>
                        <span className="font-carien">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => subscribeToPlan(plan.id)}
                    disabled={loading}
                    className={`bg-[#D4AF37] rounded-full py-3 w-full flex justify-center
    ${loading ? "opacity-60 cursor-not-allowed" : ""}
  `}
                  >
                    <img src={PlanArrow} alt="arrow" />
                  </button>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

export default PlanSection;
