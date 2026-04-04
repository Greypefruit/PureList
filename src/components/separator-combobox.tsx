import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { OUTPUT_PRESETS } from "../lib/id-tools";
import { Input } from "./ui/input";

interface SeparatorComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function SeparatorCombobox({
  id,
  label,
  value,
  onChange,
}: SeparatorComboboxProps) {
  const matchedPreset = useMemo(
    () => OUTPUT_PRESETS.find((preset) => preset.value === value)?.label ?? "custom",
    [value],
  );
  const [mode, setMode] = useState<string>(matchedPreset);
  const [customValue, setCustomValue] = useState(value);

  useEffect(() => {
    setMode(matchedPreset);
    setCustomValue(value);
  }, [matchedPreset, value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <select
          className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
          id={id}
          onChange={(event) => {
            const nextMode = event.target.value;
            setMode(nextMode);
            if (nextMode !== "custom") {
              const nextValue = OUTPUT_PRESETS.find((preset) => preset.label === nextMode)?.value ?? "\n";
              onChange(nextValue);
            }
          }}
          value={mode}
        >
          {OUTPUT_PRESETS.map((preset) => (
            <option key={preset.label} value={preset.label}>
              {preset.label}
            </option>
          ))}
          <option value="custom">Свой вариант</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {mode === "custom" && (
        <Input
          id={`${id}-custom`}
          onChange={(event) => {
            const nextValue = event.target.value;
            setCustomValue(nextValue);
            onChange(nextValue);
          }}
          placeholder="Введите свой разделитель"
          value={customValue}
        />
      )}
      <p className="text-xs text-muted-foreground">
        По умолчанию используется перенос строки
      </p>
    </div>
  );
}
