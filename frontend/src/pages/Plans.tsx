import { useEffect, useState } from "react";
import axios from "axios";
import PlanArrow from "../assets/plan-arrow.svg";
import { useAuth } from "../../utils";

// Define the Plan type matching your backend entity
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

const Plans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API}/plans`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlans(response?.data?.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return <p className="text-white text-center mt-10">Loading plans...</p>;
  }

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

  return (
    <section className="bg-[#000000] min-h-screen lg:py-[100px] md:py-[80px] sm:py-[60px] py-[40px]">
      <div className="container mx-auto xl:py-[16px] xl:px-[40px] lg:px-[35px] md:px-[30px] sm:px-[20px] px-[16px]">
        <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 xl:gap-10 lg:gap-8 md:gap-6 sm:gap-5 gap-4">
          {plans?.map((plan) => {
            const features = buildFeatures(plan);
            return (
              <div
                key={plan.id}
                className={`relative w-full rounded-[16px] overflow-hidden mb-[20px] sm:mb-0 bg-[#161A20]`}
              >
                <div className="xl:p-8 lg:p-8 md:p-6 sm:p-6 p-5">
                  <div>
                    <h3 className="text-white xl:text-[24px] lg:text-[23px] md:text-[22px] sm:text-[21px] text-[20px] font-carien mb-2">
                      {plan.title}
                    </h3>
                    <p className="text-[#D1D1D1] xl:text-[17px] lg:text-[16px] md:text-[15px] text-[14px] font-gowun leading-[20px] mb-6 max-w-[250px]">
                      {plan.description || "No description available."}
                    </p>
                  </div>
                  <div className="mb-4 min-h-[85px]">
                    <h4 className="text-white xl:text-[50px] xl:leading-[56px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] font-carien leading-[44px]">
                      ${Number(plan.price)?.toFixed(2)}
                      <span className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[17px] text-[#A7A7A7] ml-1">
                        /month
                      </span>
                    </h4>
                  </div>
                  <div className="flex gap-2 mb-6 text-white text-[14px] font-gowun">
                    {features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#E5B84D] rounded-full"></span>{" "}
                        <span className="font-carien">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {user?.subscription?.plan?.id === plan.id ? (
                    <button
                      disabled
                      className="bg-gray-500 cursor-not-allowed text-white text-[15px] font-carien rounded-full py-3 w-full flex justify-center items-center gap-2 "
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button className="bg-[#D4AF37] hover:bg-[#c59c30] transition text-[#1C1C1C] text-[15px] font-carien rounded-full py-3 w-full flex justify-center items-center gap-2 cursor-pointer">
                      Upgrade Now
                      <img
                        src={PlanArrow}
                        alt="header logo"
                        className="max-w-full h-auto"
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Plans;
