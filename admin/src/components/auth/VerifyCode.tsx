import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { verifyResetCode, requestResetPasswordCode } from "./_requests";
import { toast } from "react-toastify";

export default function VerifyResetCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // ⏱ Timer starts at 60 seconds
  const { state } = useLocation();
  const navigate = useNavigate();

  // Countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();
    try {
      const res = await verifyResetCode(state.email, code);
      if (res.data.status) {
        toast.success("Thanks for verifying. Update your password.");
        navigate("/admin/reset-password", { state: { email: state.email } });
      } else {
        toast.error("Invalid verification code.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    toast.dismiss();
    try {
      const res = await requestResetPasswordCode(state.email);
      if (res.data.status) {
        toast.success("Verification code resent to your email.");
        setTimer(60);
      } 
    } catch (err) {
      console.error("Error resending code:", err);
      toast.error(" resending code.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f3f5f8]">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md p-6 border rounded-lg shadow bg-white"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Verify Code</h2>
        <Label>Enter 6-digit Code</Label>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full mt-4 bg-[#467ff7] hover:bg-[#1c244b] text-white"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center mt-4">
          {timer > 0 ? (
            <p className="text-sm text-gray-600">
              You can resend code in <span className="font-medium">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              className="text-blue-600 hover:underline text-sm"
            >
              Resend Code
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
