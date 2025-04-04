import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
  text?: string;
}

interface LoadingPageProps extends LoadingProps {
  fullScreen?: boolean;
}

interface LoadingSpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: "sm" | "default" | "lg";
}

export function Loading({
  size = "default",
  text,
  className,
  ...props
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        className
      )}
      {...props}
    >
      <LoadingSpinner size={size} role="status" aria-label="Loading" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function LoadingPage({
  fullScreen,
  className,
  ...props
}: LoadingPageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "min-h-[400px]",
        className
      )}
      role="region"
      aria-label="Loading page"
    >
      <Loading size="lg" {...props} />
    </div>
  );
}

export function LoadingSpinner({
  className,
  size = "sm",
  ...props
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
          "h-8 w-8": size === "lg",
        },
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
