import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

type ErrorVariant = "default" | "compact" | "inline" | "card";
type ErrorSeverity = "error" | "warning" | "info";

interface ErrorMessageProps {
  message: string;
  variant?: ErrorVariant;
  severity?: ErrorSeverity;
  showIcon?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage = ({
  message = "Failed when fetching data. Please try again later !!",
  variant = "default",
  severity = "error",
  showIcon = true,
  showRetry = false,
  onRetry,
  className,
}: ErrorMessageProps) => {
  const severityClasses = {
    error: "text-red-400 bg-red-500/10 border-red-500/40",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    info: "text-primary bg-primary/10 border-primary/40",
  };

  const variantClasses = {
    default: "text-center text-base p-4 rounded-lg border",
    compact: "text-center text-sm p-3 rounded-md border",
    inline: "text-sm p-2 rounded border",
    card: "text-center text-base p-6 rounded-xl border shadow-sm",
  };

  const iconSizes = {
    default: "h-6 w-6",
    compact: "h-5 w-5",
    inline: "h-4 w-4",
    card: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        variantClasses[variant],
        severityClasses[severity],
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {showIcon && <AlertCircle className={iconSizes[variant]} />}
        <span className="capitalize">{message}</span>
      </div>

      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1 text-sm underline hover:no-underline"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
export type { ErrorMessageProps, ErrorSeverity, ErrorVariant };
