import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

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
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm"
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
