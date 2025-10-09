import React from 'react';

interface CustomButtonProps {
  label?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  icon,
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      type={type}
      disabled={disabled || isLoading}
      className={`
        px-[18px] py-[8px]
        rounded-full
        flex items-center justify-center gap-2
        font-[500]
        cursor-pointer
        bg-[var(--primary)]
        text-[var(--primary-foreground)]
        hover:opacity-90
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}>
      {isLoading ? (
        <span className="animate-spin border-2 border-t-transparent rounded-full w-4 h-4"></span>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
};
