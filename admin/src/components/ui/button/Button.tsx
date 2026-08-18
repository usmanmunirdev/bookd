import { ReactNode } from "react";

interface ButtonProps {
  children?: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  type = "button",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-[#D4AF37] dark:bg-[#d4af378f] hover:dark:bg-transparent border border-transparent text-white shadow-theme-xs hover:bg-transparent hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:bg-[#D4AF37]  dark:hover:text-[#D4AF37]",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  // Light mode specific styles
  const lightModeStyles = {
    primary: "bg-[#d4af37] hover:bg-[#3d6fd8] disabled:bg-[#9cb9ff]",
    outline: "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      style={{
        backgroundColor: !document.documentElement.classList.contains('dark') ? 
          (variant === 'primary' ? '' : undefined) : undefined,
        '--tw-shadow-color': !document.documentElement.classList.contains('dark') ? 
          'rgba(70, 127, 247, 0.1)' : undefined
      } as React.CSSProperties}
      onClick={onClick}
      disabled={disabled}
      type={`${type}`}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
