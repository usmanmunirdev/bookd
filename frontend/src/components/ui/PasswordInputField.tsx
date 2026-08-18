import { Input } from "@/components/ui/input";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface PasswordInputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}

const PasswordInputField = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: PasswordInputFieldProps) => (
  <div className="flex flex-col gap-[8px]">
    <label className="text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun text-white">
      {label}
    </label>
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="xl:text-[18px] lg:text-[16px] md:text-[15px] text-[14px]
          font-normal font-gowun xl:h-[52px] lg:h-[48px] md:h-[44px] h-[40px]
          px-[16px] pr-[44px] focus:outline-none focus:ring-0
          border-[#3A3219] bg-[#150F02] text-[#D4AF37]
          placeholder:text-[#5a4a20]"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-70 hover:opacity-100 transition-opacity"
      >
        {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
      </button>
    </div>
  </div>
);

export default PasswordInputField;