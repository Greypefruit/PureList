import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        variant === "default"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border/70 bg-background/70 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
