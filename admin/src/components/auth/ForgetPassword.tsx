import { useState } from "react";
import { useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { requestResetPasswordCode } from "./_requests";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  toast.dismiss()
  try {
    const res  = await requestResetPasswordCode(email);
    if (res.data.status) {
      toast.success("Code has been sent tou your email.");
      navigate("/admin/verify-reset-code", { state: { email } });
    }
  } catch (error) {
    console.error("Error requesting reset code:", error);
    toast.error(error?.response?.data?.message || "Something went wrong!");  
    } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f3f5f8]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 border rounded-lg shadow bg-white"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Forgot Password</h2>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="info@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full mt-4 bg-[#467ff7] hover:bg-[#1c244b] text-white"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Code"}
        </Button>
      </form>
    </div>
  );
}