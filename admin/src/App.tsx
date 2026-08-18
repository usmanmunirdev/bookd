import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import UserProfiles from "./pages/UserProfiles";
import Users from "./pages/Users/Users";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PrivateRoute from "./layout/PrivateRoute";
import Roles from "./pages/Roles/Roles";
import Permissions from "./pages/Permissions/Permissions";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import VerifyResetCode from "./pages/AuthPages/VerifyResetCode";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import Plans from "./pages/Plans/Plans";
import AdminUsers from "./pages/AdminUser/AdminUser";
import BookingLogs from "./pages/BookingLogs/BookingLogs";
import ChatHistory from "./pages/ChatHistory/ChatHistory";
import ChatWithAgent from "./pages/ChatWithAgent/ChatWithAgent";
import Faqs from "./pages/Faqs/Faqs";
import ContactUsQuery from "./pages/ContactUs/ContactUsQuery";
import TermsPage from "./pages/PolicyAndTermCondition/TermAndCondition";
import PrivacyPage from "./pages/PolicyAndTermCondition/PrivacyPolicy";
import SubscriptionPayments from "./pages/SubscriptionPayments/SubscriptionPayments";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes */}
        <Route path="/admin/signin" element={<SignIn />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        {/* <Route path="/admin/signup" element={<SignUp />} /> */}

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          <Route
            path="/admin"
            element={
              <PrivateRoute element={<Home />} requiredPermission="Dashboard" />
            }
          />
          <Route
            path="/admin/admin-users"
            element={
              <PrivateRoute
                element={<AdminUsers />}
                requiredPermission="Admin User"
              />
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute element={<Users />} requiredPermission="Users" />
            }
          />
          <Route
            path="/admin/roles"
            element={
              <PrivateRoute element={<Roles />} requiredPermission="Roles" />
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <PrivateRoute
                element={<Permissions />}
                requiredPermission="Permissions"
              />
            }
          />
          <Route
            path="/admin/plans"
            element={
              <PrivateRoute element={<Plans />} requiredPermission="Plans" />
            }
          />
          <Route
            path="/admin/booking-logs"
            element={
              <PrivateRoute
                element={<BookingLogs />}
                requiredPermission="Booking Logs"
              />
            }
          />
          <Route
            path="/admin/chat-track"
            element={
              <PrivateRoute
                element={<ChatHistory />}
                requiredPermission="Chat Track"
              />
            }
          />
          <Route
            path="/admin/chat-with-agent"
            element={
              <PrivateRoute
                element={<ChatWithAgent />}
                requiredPermission="User Messages"
              />
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <PrivateRoute element={<Faqs />} requiredPermission="FAQs" />
            }
          />
          <Route
            path="/admin/contact-queries"
            element={
              <PrivateRoute
                element={<ContactUsQuery />}
                requiredPermission="Contact Queries"
              />
            }
          />
          <Route
            path="/admin/terms-and-conditions"
            element={
              <PrivateRoute
                element={<TermsPage />}
                requiredPermission="Terms & Conditions"
              />
            }
          />
          <Route
            path="/admin/privacy-policy"
            element={
              <PrivateRoute
                element={<PrivacyPage />}
                requiredPermission="Privacy Policy"
              />
            }
          />
          <Route
            path="/admin/subscription-payments"
            element={
              <PrivateRoute
                element={<SubscriptionPayments />}
                requiredPermission="Subscription Payments"
              />
            }
          />
          <Route path="/admin/profile" element={<UserProfiles />} />
        </Route>

        {/* Redirect unmatched routes */}
        <Route path="*" element={<Navigate to="/admin/signin" replace />} />
      </Routes>
    </Router>
  );
}
