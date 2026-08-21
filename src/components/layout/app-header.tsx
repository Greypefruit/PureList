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
    <div className="flex items-center gap-6 py-3">
      <p className="shrink-0 text-lg font-semibold tracking-tight text-foreground">PureList</p>
      <div className="min-w-0 flex-1">{navigation}</div>
      <Button
        aria-label="Переключить тему"
        className="shrink-0"
        onClick={onToggleTheme}
        size="icon"
        variant="ghost"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    </div>
  );
}
