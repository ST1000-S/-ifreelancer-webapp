import React from "react";
import { cn } from "@/lib/utils";

interface TechCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined";
  children: React.ReactNode;
  glowIntensity?: "low" | "medium" | "high";
}

export function TechCard({
  className,
  variant = "default",
  glowIntensity = "low",
  children,
  ...props
}: TechCardProps) {
  const glowStyles = {
    low: "hover:shadow-md",
    medium: "hover:shadow-lg",
    high: "hover:shadow-xl",
  };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300",
        variant === "outlined" && "border border-gray-200",
        glowStyles[glowIntensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
