import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router";
import VerifyResetCode from "../../components/auth/VerifyCode";

export default function SignIn() {
  const { token, } = useAuth();

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <PageMeta
        title="BOOKD SignIn"
        description="Sign in to BOOKD, Redefines booking tools, offering seamless access to extraordinary experiences."
      />
      <VerifyResetCode />
    </>
  );
}
