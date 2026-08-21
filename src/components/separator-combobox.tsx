import { useEffect, useMemo, useState } from "react";
import { OUTPUT_PRESETS } from "../lib/id-tools";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

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
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <select
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
        )}
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
      {mode === "custom" ? (
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
      ) : null}
    </div>
  );
}
