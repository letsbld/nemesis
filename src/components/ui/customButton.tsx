import { cn } from '@/lib/utils';
import React from 'react';

interface CustomButtonProps {
  btnType?: 'button' | 'submit' | 'reset';
  style?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children?: React.ReactNode;
  name?: string | React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  btnType = 'button',
  style = '',
  startIcon,
  endIcon,
  children,
  name,
  loading = false,
  onClick,
}) => {
  return (
    <button
      type={btnType}
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-md font-medium rounded-2xl shadow-sm transition-all duration-200",
        loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-md opacity-100",
        style
      )}
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      ) : (
        <>
          {/* ✅ start icon and text aligned on same line */}
          {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
          {name || children ? (
            <span className="whitespace-nowrap">{name || children}</span>
          ) : null}
          {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default CustomButton;
