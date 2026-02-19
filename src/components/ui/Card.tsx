import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-bg-card border border-border overflow-hidden",
          hoverable ? "transition-transform hover:scale-[1.02]" : "",
          className ?? ""
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4", className ?? "")}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

export { Card, CardContent };
