import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";
type LoaderVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "muted";

interface LoaderSpinProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  withText?: boolean;
  text?: string;
  containerClassName?: string;
  loaderClassName?: string;
  textClassName?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const LoaderSpin = ({
  size = "md",
  variant = "muted",
  withText = false,
  text = "Đang tải...",
  containerClassName,
  loaderClassName,
  textClassName,
  fullScreen = false,
  overlay = false,
}: LoaderSpinProps) => {
  // Size variants
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  // Color variants
  const variantClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    muted: "text-gray-400",
  };

  // Text size based on loader size
  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Container classes
  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 z-50",
    overlay && "bg-white/80 backdrop-blur-sm",
    withText ? "flex-col gap-2" : "flex-row gap-2",
    containerClassName,
  );

  // Loader classes
  const loaderClasses = cn(
    "animate-spin",
    sizeClasses[size],
    variantClasses[variant],
    loaderClassName,
  );

  // Text classes
  const textClasses = cn(
    "font-medium",
    textSizeClasses[size],
    variantClasses[variant],
    textClassName,
  );

  return (
    <div className={containerClasses}>
      <Loader2 className={loaderClasses} />
      {withText && <span className={textClasses}>{text}</span>}
    </div>
  );
};

export default LoaderSpin;

// Export types for reuse
export type { LoaderSize, LoaderSpinProps, LoaderVariant };
