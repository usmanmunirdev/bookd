import type React from "react";
import { Link } from "react-router";

interface DropdownItemProps {
  tag?: "a" | "button";
  to?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  to,
  onClick,
  onItemClick,
  baseClassName = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  className = "",
  children,
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && to) {
    return (
      <Link 
        to={to} 
        className={combinedClasses} 
        onClick={handleClick}
        style={{
          '--tw-bg-opacity': !document.documentElement.classList.contains('dark') ? '0.05' : undefined,
          '--tw-text-opacity': !document.documentElement.classList.contains('dark') ? '1' : undefined
        } as React.CSSProperties}
      >
        {children}
      </Link>
    );
  }

  return (
    <button 
      onClick={handleClick} 
      className={combinedClasses}
      style={{
        '--tw-bg-opacity': !document.documentElement.classList.contains('dark') ? '0.05' : undefined,
        '--tw-text-opacity': !document.documentElement.classList.contains('dark') ? '1' : undefined
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
};
