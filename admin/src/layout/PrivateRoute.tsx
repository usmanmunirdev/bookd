import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import FullPageLoader from "../components/common/FullPageLoader";

const PrivateRoute = ({ element, requiredPermission }: any) => {
  const { token, userInfo, loading } = useAuth();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setLoading(true);
    } else if (userInfo == null) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [loading]);

  // **Wait until userInfo is fetched before rendering anything**
  if (isLoading) return <FullPageLoader />;

  // **Redirect to signin if no token is found**
  if (!token) {
    return <Navigate to="/admin/signin" replace />;
  }

  // **Super Admin Bypass**
  if (userInfo?.type == "0") {
    return element;
  }

  // **Ensure userInfo is available before checking permissions**
  if (!userInfo || !userInfo?.role) {
    return <FullPageLoader />; 
  }
  
  const userPermissions = userInfo.role;

  if (
    requiredPermission &&
    (!userPermissions?.[requiredPermission]?.view ||
      userPermissions?.[requiredPermission] === undefined)
  ) {
    return <Navigate to="/admin" replace />;
  }

  return element;
};

export default PrivateRoute;
