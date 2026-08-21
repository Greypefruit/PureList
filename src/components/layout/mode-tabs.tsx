import type { ComponentType } from "react";
import { cn } from "../../lib/utils";

export interface ModeTabItem<T extends string> {
  key: T;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface ModeTabsProps<T extends string> {
  tabs: ModeTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
}

export function ModeTabs<T extends string>({ tabs, activeKey, onChange }: ModeTabsProps<T>) {
  return (
    <nav aria-label="Режимы" className="-mb-px flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeKey;

        return (
          <button
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
            key={tab.key}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
