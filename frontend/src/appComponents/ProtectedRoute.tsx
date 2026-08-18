import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../utils";
import { HashLoader } from "react-spinners";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <HashLoader color="#A98E40" size={100} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const permissionMap: any = {
    "/assistant": user?.subscription?.plan?.aiPoweredSearch,
    "/assistant/booking-log": user?.subscription?.plan?.bookingHistory,
    "/assistant/chat-with-agent": user?.subscription?.plan?.conciergeAccess,
    "/assistant/settings/calendar-integration": user?.subscription?.plan?.calendarReminder,
  };

  const isAllowed = permissionMap[location.pathname];

  if (isAllowed === false) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
