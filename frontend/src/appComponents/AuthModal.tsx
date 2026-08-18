import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ChevronLeft,
  ChevronRight,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { setUser } = useAuth();

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [timezones, setTimezones] = useState<string[]>([]);
  const [loadingTimezones, setLoadingTimezones] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState("");

  const [signupData, setSignupData] = useState({
    firstName: "",
    preferredName: "",
    phone: "",
    email: "",
    password: "",
    timezone: "",
    profileImage: null as File | null,
  });

  const navigate = useNavigate();

  const handleSwipe = (toLogin: boolean) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(toLogin);
      setIsAnimating(false);
    }, 200);
  };

  useEffect(() => {
    try {
      const zones = Intl.supportedValuesOf("timeZone");
      setTimezones(zones);
    } catch (err) {
      console.error("Failed to load timezones", err);
    } finally {
      setLoadingTimezones(false);
    }
  }, []);

  useEffect(() => {
    setSignupData((prev) => ({
      ...prev,
      timezone: selectedTimezone,
    }));
  }, [selectedTimezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
          {
            email: loginData.email,
            password: loginData.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        if (response.data.user.token) {
          localStorage.setItem("authToken", response.data.user.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        setSuccess(response.data.message || "Login successful");
        navigate("/assistant");
        setTimeout(() => onClose(), 1000);
      } else {
        const formData = new FormData();
        formData.append("firstName", signupData.firstName);
        formData.append("preferredName", signupData.preferredName);
        formData.append("phone", signupData.phone);
        formData.append("email", signupData.email);
        formData.append("password", signupData.password);
        formData.append("timezone", signupData.timezone);
        if (signupData.profileImage) {
          formData.append("profileImage", signupData.profileImage);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        setSuccess(response.data.message || "Account created successfully");
        navigate("/assistant");
        setTimeout(() => onClose(), 1000);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An error occurred. Please try again.";
      setError(errorMessage);
      console.error(isLogin ? "Login error:" : "Signup error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimezoneChange = (value: string) => {
    setSelectedTimezone(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignupData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#2A2A2A]/90 backdrop-blur-[18px] border border-[#2E2D2D] shadow-[inset_1px_1px_0px_0px_#FFFFFF40] rounded-[2rem] p-0 overflow-hidden animate-scale-in h-[520px]">
        <div className="relative h-full flex flex-col">
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSwipe(true)}
                disabled={isLogin || isAnimating}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-300 hover:scale-110",
                  isLogin
                    ? "opacity-30"
                    : "opacity-100 hover:bg-[#D4BC6D0D] hover:border-[#A98E40]"
                )}
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-medium text-white">
                  {isLogin ? "Welcome" : "Join Us"}
                </h2>
                <p className="text-sm text-[#656565] mt-1">
                  {isLogin ? "Sign in to continue" : "Create your account"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSwipe(false)}
                disabled={!isLogin || isAnimating}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-300 hover:scale-110",
                  !isLogin
                    ? "opacity-30"
                    : "opacity-100 hover:bg-[#D4BC6D0D] hover:border-[#A98E40]"
                )}
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {(error || success) && (
            <div
              className={`px-6 ${
                error ? "text-red-400" : "text-green-400"
              } text-sm mb-2`}
            >
              {error || success}
            </div>
          )}

          <div className="relative flex-1 overflow-y-auto">
            <div
              className={cn(
                "flex transition-all duration-300 ease-out",
                isLogin ? "translate-x-0" : "-translate-x-full"
              )}
            >
              {/* Login Form */}
              <div className="w-full flex-shrink-0 px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor="login-email"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Email
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <Mail className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              email: e.target.value,
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="login-password"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Password
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <Lock className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-8 w-8 rounded-lg hover:bg-[#D4BC6D0D]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-white" />
                          ) : (
                            <Eye className="h-4 w-4 text-white" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#A98E40] cursor-pointer hover:bg-[#232323] text-white rounded-[1rem] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] mt-4"
                  >
                    {loading ? "Processing..." : "Sign In"}
                  </Button>

                  <div className="text-center pt-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => handleSwipe(false)}
                      className="text-sm text-[#A98E40]/80 cursor-pointer hover:text-[#A98E40] transition-colors"
                    >
                      Need an account?
                    </Button>
                  </div>
                </form>
              </div>

              {/* Signup Form */}
              <div className="w-full flex-shrink-0 px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor="signup-name"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Full Name
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border Del-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <User className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your First Name"
                          value={signupData.firstName}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              firstName: e.target.value,
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="signup-preferred-name"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Preferred Name
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <User className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="signup-preferred-name"
                          type="text"
                          placeholder="Your Preferred Name"
                          value={signupData.preferredName}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              preferredName: e.target.value,
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="signup-email"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Email
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <Mail className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              email: e.target.value,
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="signup-profile-image"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Profile Image
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <Image className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="signup-profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="signup-phone"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Phone Number
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <User className="h-4 w-4 text-[#656565] mr-2" />
                        <Input
                          id="signup-phone"
                          type="text"
                          placeholder="Your Phone Number"
                          value={signupData.phone}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              phone: e.target.value,
                            })
                          }
                          className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="signup-timezone"
                        className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                      >
                        Time Zone
                      </Label>
                      <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                        <Select
                          onValueChange={handleTimezoneChange}
                          value={selectedTimezone || ""}
                        >
                          <SelectTrigger className="w-full border-none outline-none text-[13px] text-white">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent className="text-white bg-black max-h-[200px] overflow-y-auto">
                            {loadingTimezones ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : (
                              timezones.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="signup-password"
                      className="text-white text-[13px] sm:text-[14px] leading-[100%] tracking-normal"
                    >
                      Password
                    </Label>
                    <div className="w-full h-[48px] bg-[#D9D9D908] border-b border-[#4B4C46] rounded-tl-[20px] rounded-tr-[20px] flex items-center px-2">
                      <Lock className="h-4 w-4 text-[#656565] mr-2" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white leading-[100%] tracking-normal placeholder:text-[#656565]"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-8 w-8 rounded-lg hover:bg-[#D4BC6D0D]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-white" />
                        ) : (
                          <Eye className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#A98E40] cursor-pointer hover:bg-[#232323] text-white rounded-[1rem] font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] mt-3"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <div className="text-center pt-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => handleSwipe(true)}
                      className="text-sm text-[#A98E40]/80 cursor-pointer hover:text-[#A98E40] transition-colors"
                    >
                      Have an account?
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-1.5 pb-4">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                isLogin ? "bg-[#A98E40] shadow-lg" : "bg-[#656565]/20"
              )}
            />
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                !isLogin ? "bg-[#A98E40] shadow-lg" : "bg-[#656565]/20"
              )}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
