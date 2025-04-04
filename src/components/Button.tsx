import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button = ({
  onClick,
  children,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      {children}
    </button>
  );
};
