import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

interface AppHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  navigation: ReactNode;
}

export function AppHeader({ theme, onToggleTheme, navigation }: AppHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between py-3">
      <div className="flex min-w-0 items-center gap-4 lg:gap-6">
        <p className="shrink-0 text-lg font-semibold tracking-tight text-foreground">PureList</p>
        <div className="min-w-0">{navigation}</div>
      </div>
      <Button
        aria-label="Переключить тему"
        className="ml-4 shrink-0"
        onClick={onToggleTheme}
        size="icon"
        variant="ghost"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    </div>
  );
}
