import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-4 transition-colors",
        variant === "default"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-muted text-foreground",
        className,
      )}
      {...props}
    />
  );
}
