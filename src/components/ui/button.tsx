import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline";
type ButtonSize = "default" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:brightness-[1.03]",
  secondary:
    "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
  ghost: "bg-transparent text-foreground hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground",
  outline: "border border-border bg-background/80 text-foreground hover:-translate-y-0.5 hover:bg-accent/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-4 py-2.5 text-sm",
  sm: "h-9 px-3 py-2 text-sm",
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
        "inline-flex items-center justify-center rounded-xl font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
