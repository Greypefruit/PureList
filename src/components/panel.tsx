import type { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

interface PanelProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Panel({ title, description, actions, footer, children, className, contentClassName }: PanelProps) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="text-xs leading-5 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className={cn("flex flex-1 flex-col gap-3 p-4", contentClassName)}>{children}</div>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </Card>
  );
}
