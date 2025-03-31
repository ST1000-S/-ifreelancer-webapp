import { cn } from "@/lib/utils";
import { Loader2, type LucideProps } from "lucide-react";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
  text?: string;
}

export function Loading({
  size = "default",
  text,
  className,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        className
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

interface LoadingPageProps extends LoadingProps {
  fullScreen?: boolean;
}

export function LoadingPage({
  fullScreen = false,
  ...props
}: LoadingPageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "min-h-[400px]"
      )}
    >
      <Loading size="lg" {...props} />
    </div>
  );
}

export function LoadingSpinner({
  className,
  ...props
}: Omit<LucideProps, "ref">) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} {...props} />
  );
}
