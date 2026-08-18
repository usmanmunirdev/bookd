import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordInputField from "../components/ui/passwordInputField";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../utils";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaRegEdit } from "react-icons/fa";
import { FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa6";
import { MdLockOutline } from "react-icons/md";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type EditableField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "profileImage"
  | null;

const PersonalInformation = () => {
  const { user, setUser, token } = useAuth();
  const [timezones, setTimezones] = useState<string[]>([]);
  const [loadingTimezones, setLoadingTimezones] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editableField, setEditableField] = useState<EditableField>(null);
  const [fieldValue, setFieldValue] = useState("");

  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user?.timezone) setSelectedTimezone(user.timezone);
  }, [user]);

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

  const handleUpdate = async (field: string, value: any) => {
    try {
      if (field === "profileImage") {
        const formData = new FormData();
        formData.append("profileImage", value);
        formData.append("id", user?.id || "");
        const res = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/auth/update-profile`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setUser(res.data.user);
        toast.success("Profile image updated successfully");
        return;
      }

      const payload = { id: user?.id, ...user, [field]: value };
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/auth/update-profile`,
        payload
      );
      setUser(res.data.user);
      toast.success("Updated successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Update failed");
    }
  };

  const openEditModal = (field: EditableField) => {
    if (!field || !user) return;

    if (field === "profileImage") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) handleUpdate("profileImage", file);
      };
      input.click();
      return;
    }

    setEditableField(field);
    setFieldValue(user[field] || "");
    setModalOpen(true);
  };

  const onFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(e.target.value);
  };

  const onSave = async () => {
    if (!editableField) return;
    try {
      setSaving(true);
      await handleUpdate(editableField, fieldValue);
      setModalOpen(false);
      setEditableField(null);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTimeZone = async (value: string) => {
    setSelectedTimezone(value);
    await handleUpdate("timezone", value);
  };

  // Password change handlers
  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setPasswordModalOpen(true);
  };

  const onChangePassword = async () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must differ from current password.");
      return;
    }

    try {
      setSavingPassword(true);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Password changed successfully");
      setPasswordModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to change password";
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div
      key="personal-info"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 * 0.1 }}
    >
      <div>
        {/* ── Existing personal info section ── */}
        <div className="sm:mb-[40px] mb-[30px]">
          <div className="mb-[30px]">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL.replace(
                      "/api",
                      ""
                    )}${user.profileImage}`}
                    alt="Profile"
                    className="w-[58px] h-[58px] rounded-[15px] object-cover"
                  />
                ) : (
                  <div className="w-[58px] h-[58px] rounded-[15px] bg-gray-600 flex items-center justify-center text-white text-[10px]">
                    No Image
                  </div>
                )}
                <button
                  onClick={() => openEditModal("profileImage")}
                  className="absolute top-[-7px] right-[5px] w-[17px] h-[17px] rounded-full bg-white flex items-center justify-center cursor-pointer transform translate-x-1 translate-y-1"
                >
                  <FaRegEdit size={11} className="text-[#D4AF37]" />
                </button>
              </div>
              <div className="flex flex-col">
                <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-1">
                  {user?.firstName || "Not provided"}
                </p>
                <p className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun text-white">
                  {user?.email || "Not provided"}
                </p>
              </div>
            </div>
          </div>
          <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white">
            We use this information to personalize your bookings, verify
            reservations, and ensure seamless communication.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-[50px]">
          <div className="">
            <label className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px] flex">
              First Name
            </label>
            <div className="w-full bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[12px] lg:py-[11px] md:py-[10px] sm:py-[9px] py-[8px] px-[15px] rounded-[7px]">
              <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF37]">
                {user?.firstName || "Not provided"}
              </p>
              <button
                onClick={() => openEditModal("firstName")}
                className="cursor-pointer"
              >
                <FaRegEdit size={20} className="text-[#D4AF37]" />
              </button>
            </div>
          </div>
          <div className="">
            <label className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px] flex">
              Last Name
            </label>
            <div className="w-full bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[12px] lg:py-[11px] md:py-[10px] sm:py-[9px] py-[8px] px-[15px] rounded-[7px]">
              <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF37]">
                {user?.lastName || "Not provided"}
              </p>
              <button
                onClick={() => openEditModal("lastName")}
                className="cursor-pointer"
              >
                <FaRegEdit size={20} className="text-[#D4AF37]" />
              </button>
            </div>
          </div>
          <div className="">
            <label className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px] flex">
              Email Address
            </label>
            <div className="w-full bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[12px] lg:py-[11px] md:py-[10px] sm:py-[9px] py-[8px] px-[15px] rounded-[7px]">
              <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF37]">
                {user?.email || "Not provided"}
              </p>
            </div>
          </div>
          <div className="">
            <label className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px] flex">
              Mobile Number
            </label>
            <div className="w-full bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[12px] lg:py-[11px] md:py-[10px] sm:py-[9px] py-[8px] px-[15px] rounded-[7px]">
              <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF37]">
                {user?.phone ? `+${user?.phone}` : "Not provided"}
              </p>
              <button
                onClick={() => openEditModal("phone")}
                className="cursor-pointer"
              >
                <FaRegEdit size={20} className="text-[#D4AF37]" />
              </button>
            </div>
          </div>
          <div className="">
            <label className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white mb-[12px] flex">
              Select Time Zone
            </label>
            <div className="bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[9px] lg:py-[7px] md:py-[5px] sm:py-[4px] py-[3px] px-[15px] rounded-[7px] cursor-pointer relative">
              <Select
                onValueChange={handleUpdateTimeZone}
                value={selectedTimezone || ""}
              >
                <SelectTrigger
                  className="
                w-full border-none outline-none 
                xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] 
                font-normal font-gowun text-[#D4AF37] p-0
                [&>svg]:hidden 
                focus:ring-0 focus:ring-offset-0
            "
                >
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="text-white bg-black max-h-[300px] overflow-y-auto font-gowun">
                  {loadingTimezones ? (
                    <SelectItem value="" disabled>
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
              <FaChevronDown
                size={18}
                color="#D4AF37"
                className="absolute top-1/2 right-[15px] -translate-y-1/2 pointer-events-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ── Edit Field Modal ── */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[625px] bg-[#1F1A0D] border-[#D4AF37] text-white">
            <DialogHeader>
              <DialogTitle className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] tex-[28px] font-normal text-white font-gowun text-start">
                Edit{" "}
                {editableField === "firstName"
                  ? "First Name"
                  : editableField === "email"
                  ? "Email"
                  : editableField === "lastName"
                  ? "Last Name"
                  : "Mobile Number"}
              </DialogTitle>
              <DialogDescription className="text-white text-start">
                Please enter your{" "}
                {editableField === "firstName"
                  ? "First name"
                  : editableField === "email"
                  ? "email address"
                  : editableField === "lastName"
                  ? "Last name"
                  : "mobile number"}
                .
              </DialogDescription>
            </DialogHeader>

            <div>
              {editableField === "phone" ? (
                <PhoneInput
                  country={"us"}
                  value={fieldValue}
                  onChange={(phone) => setFieldValue(phone)}
                  inputStyle={{
                    width: "100%",
                    height: "56px",
                    borderRadius: "12px",
                    background: "#1F1A0D",
                    color: "#D4AF37",
                    border: "1px solid #D4AF37",
                    fontFamily: "Gowun Batang",
                    fontSize: "18px",
                  }}
                  buttonStyle={{
                    background: "#1F1A0D",
                    border: "1px solid #D4AF37",
                  }}
                  dropdownStyle={{
                    background: "#000",
                    color: "#fff",
                  }}
                />
              ) : (
                <Input
                  type={editableField === "email" ? "email" : "text"}
                  value={fieldValue}
                  onChange={onFieldValueChange}
                  autoFocus
                  className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] 
                 font-normal font-gowun xl:h-[56px] lg:h-[50px] md:h-[45px] h-[40px] 
                 px-[20px] focus:outline-none focus:ring-0 border-[#D4AF37]"
                />
              )}
            </div>
            <div className="flex justify-end mt-2 gap-2 text-black">
              <Button
                className="bg-transparent text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun border-none text-white hover:bg-[#D4AF37] rounded-[44px] cursor-pointer xl:p-[23px] lg:p-[20px] md:p-[18px] p-[15px]"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                className={`text-black text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] 
    font-normal font-gowun border-none rounded-[44px] cursor-pointer 
    xl:p-[23px] lg:p-[20px] md:p-[18px] p-[15px]
    ${
      saving
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#D4AF37] hover:bg-transparent hover:text-white"
    }`}
                onClick={onSave}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Password & Security Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-t border-[#3A3219] pt-[40px] mb-[50px]"
        >
          <div className="sm:mb-[30px] mb-[20px]">
            <h2 className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun text-white mb-[8px]">
              Password & Security
            </h2>
            <p className="xl:text-[16px] lg:text-[15px] md:text-[14px] text-[13px] font-normal font-gowun text-white/60">
              Keep your account secure by using a strong, unique password.
            </p>
          </div>

          <div className="w-full bg-[#1F1A0D] border border-[#3A3219] flex justify-between items-center xl:py-[14px] lg:py-[12px] md:py-[11px] sm:py-[10px] py-[9px] px-[15px] rounded-[7px]">
            <div className="flex items-center gap-3">
              <MdLockOutline size={20} className="text-[#D4AF37]" />
              <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF37]">
                ••••••••••••
              </p>
            </div>
            <button onClick={openPasswordModal} className="cursor-pointer">
              <FaRegEdit size={20} className="text-[#D4AF37]" />
            </button>
          </div>
        </motion.div>

        {/* ── Change Password Modal ── */}
        <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
          <DialogContent className="sm:max-w-[525px] bg-[#1F1A0D] border-[#D4AF37] text-white">
            <DialogHeader>
              <DialogTitle className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] text-[28px] font-normal text-white font-gowun text-start">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-white/60 text-start text-[14px] font-gowun">
                Enter your current password and choose a new one. Must be at
                least 8 characters.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-[16px] mt-[4px]">
              <PasswordInputField
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                show={showCurrent}
                onToggle={() => setShowCurrent((p) => !p)}
                placeholder="Enter current password"
              />
              <PasswordInputField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                show={showNew}
                onToggle={() => setShowNew((p) => !p)}
                placeholder="Enter new password"
              />
              <PasswordInputField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                show={showConfirm}
                onToggle={() => setShowConfirm((p) => !p)}
                placeholder="Re-enter new password"
              />

              {passwordError && (
                <p className="text-red-400 text-[13px] font-gowun mt-[-4px]">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <Button
                className="bg-transparent text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun border-none text-white hover:bg-[#D4AF37] hover:text-black rounded-[44px] cursor-pointer xl:p-[23px] lg:p-[20px] md:p-[18px] p-[15px]"
                variant="outline"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={savingPassword}
                className={`text-black text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px]
                  font-normal font-gowun border-none rounded-[44px] cursor-pointer
                  xl:p-[23px] lg:p-[20px] md:p-[18px] p-[15px]
                  ${
                    savingPassword
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#D4AF37] hover:bg-transparent hover:text-white"
                  }`}
                onClick={onChangePassword}
              >
                {savingPassword ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default PersonalInformation;
