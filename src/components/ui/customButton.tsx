import React from 'react';

interface CustomButtonProps {
    btnType?: 'button' | 'submit' | 'reset';
    style?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    children?: React.ReactNode; // ✅ made optional
    name?: string;              // ✅ added name support
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
    onClick
}) => {
    return (
        <button
            type={btnType}
            className={`flex items-center justify-center gap-2 px-4 py-2 border border-transparent 
                text-sm font-medium rounded-md shadow-sm transition-all duration-200 
                ${style} ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}
            `}
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
                    {startIcon && <span className="mr-2">{startIcon}</span>}
                    <span>{name || children}</span> {/* ✅ shows name or children */}
                    {endIcon && <span className="ml-2">{endIcon}</span>}
                </>
            )}
        </button>
    );
};

export default CustomButton;
