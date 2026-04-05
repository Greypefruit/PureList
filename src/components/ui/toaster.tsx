import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

interface ToastItem {
  id: number;
  title: string;
}

interface ToastContextValue {
  toast: (title: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((title: string) => {
    const id = window.setTimeout(() => undefined, 0);
    setItems((current) => [...current, { id, title }]);
  }, []);

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const lastItem = items[items.length - 1];
    const timeoutId = window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== lastItem.id));
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [items]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-3 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl border border-border/70 bg-card/95 px-4 py-3 text-sm font-medium text-card-foreground shadow-panel backdrop-blur-xl",
            )}
          >
            {item.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
