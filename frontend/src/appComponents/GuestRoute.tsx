import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }: any) {
  const token = localStorage.getItem("authToken");

  if (token) {
    return <Navigate to="/assistant" replace />;
  }

  return children;
}
