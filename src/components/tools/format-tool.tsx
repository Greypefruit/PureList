import { ClipboardCopy, X } from "lucide-react";
import { Panel } from "../panel";
import { SeparatorCombobox } from "../separator-combobox";
import { StatsInline } from "../stats-inline";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface FormatToolProps {
  input: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  separator: string;
  onSeparatorChange: (value: string) => void;
  output: string;
  count: number;
  onCopy: () => void;
}

export function FormatTool({
  input,
  onInputChange,
  onClear,
  separator,
  onSeparatorChange,
  output,
  count,
  onCopy,
}: FormatToolProps) {
  return (
    <div className="space-y-4">
      <StatsInline items={[{ label: "Элементов", value: count }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          actions={
            <Button onClick={onClear} size="sm" variant="ghost-primary">
              <X className="h-3.5 w-3.5" />
              Очистить
            </Button>
          }
          description="Вставь любой набор строк или ID, а затем выбери формат результата."
          title="Список для форматирования"
        >
          <SeparatorCombobox
            id="format-separator"
            label="Разделитель результата"
            onChange={onSeparatorChange}
            value={separator}
          />
          <Textarea
            className="min-h-[220px]"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Например: id_1, id_2, id_3"
            value={input}
          />
        </Panel>

        <Panel
          actions={
            <Button disabled={!output} onClick={onCopy} size="sm">
              <ClipboardCopy className="h-3.5 w-3.5" />
              Скопировать
            </Button>
          }
          description="Результат сразу готов к вставке в SQL, таблицу или другой инструмент."
          title="Отформатированный вывод"
        >
          <Textarea className="min-h-[220px] bg-muted/60" readOnly value={output} />
        </Panel>
      </div>
    </div>
  );
}
