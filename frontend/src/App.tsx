import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from "./pages/MainLayout";
import Assistant from "./pages/Assistant";
import BookingLog from "./pages/BookingLog";
import SettingsLayout from "./pages/SettingsLayout";
import PersonalInformation from "./appComponents/PersonalInformation";
import PersonalPreferences from "./appComponents/PersonalPreferences";
import Notification from "./appComponents/Notification";
import CalenderIntigration from "./appComponents/CalenderIntigration";
import { AuthProvider } from "../utils";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import NeedToKnow from "./pages/NeedToKnow";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./appComponents/ProtectedRoute";
import Plans from "./pages/Plans";
import MembershipBilling from "./appComponents/MembershipBilling";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatWithAgent from "./pages/ChatWithAgent";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GuestRoute from "./appComponents/GuestRoute";
import VerifyEmail from "./pages/VerifyEmail";
import Faq from "./pages/Faq";
import GetInTouch from "./pages/GetInTouch";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsCondition from "./pages/TermsCondition";
import ScrollToTop from "./lib/ScrollToTop";
import Booking from "./pages/Booking";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="need-to-know" element={<NeedToKnow />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact-us" element={<GetInTouch />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-condition" element={<TermsCondition />} />
        {/* Auth routes with animation */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Login />
              </motion.div>
            </GuestRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <GuestRoute>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <SignUp />
              </motion.div>
            </GuestRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <GuestRoute>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <VerifyEmail />
              </motion.div>
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<Booking />} />
          <Route path="/assistant" element={<MainLayout />}>
            <Route index element={<Assistant />} />
            <Route path="plans" element={<Plans />} />
            <Route path="booking-log" element={<BookingLog />} />
            <Route path="chat-with-agent" element={<ChatWithAgent />} />
            <Route path="settings/" element={<SettingsLayout />}>
              <Route
                path="personal-information"
                element={<PersonalInformation />}
              />
              <Route
                path="personal-preferences"
                element={<PersonalPreferences />}
              />
              <Route path="notification" element={<Notification />} />
              <Route
                path="calendar-integration"
                element={<CalenderIntigration />}
              />
              <Route
                path="membership-billing"
                element={<MembershipBilling />}
              />
            </Route>
          </Route>
        </Route>
        <Route
          path="/assistant/*"
          element={<Navigate to="/assistant" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // const [loading, setLoading] = useState(false);

  // if (loading) {
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
  //       <HashLoader color={"#A98E40"} size={100} />
  //     </div>
  //   );
  // }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
        <ToastContainer position="top-right" theme="dark" />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
