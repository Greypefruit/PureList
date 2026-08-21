import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "ghost-primary" | "outline";
type ButtonSize = "default" | "sm" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "border border-primary bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
  ghost: "border border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  "ghost-primary":
    "border border-transparent bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-9 px-3.5 text-sm gap-1.5",
  sm: "h-8 px-2.5 text-xs gap-1.5",
  icon: "h-9 w-9 p-0",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
