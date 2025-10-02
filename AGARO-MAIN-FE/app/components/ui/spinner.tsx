import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "muted";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const variantClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
};

function Spinner({
  className,
  size = "md",
  variant = "default",
}: SpinnerProps) {
  return (
    <Loader2Icon
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

export { Spinner };
