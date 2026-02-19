import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "default" | "accent" | "success" | "danger" | "super";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary",
  accent: "bg-accent/20 text-accent",
  success: "bg-success/20 text-success",
  danger: "bg-danger/20 text-danger",
  super: "bg-super/20 text-super",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variantStyles[variant],
          className ?? ""
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps };
