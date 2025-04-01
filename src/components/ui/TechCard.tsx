import React from "react";
import { cn } from "@/lib/utils";

interface TechCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined";
  children: React.ReactNode;
}

export function TechCard({
  className,
  variant = "default",
  children,
  ...props
}: TechCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-white shadow-sm",
        variant === "outlined" && "border border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
