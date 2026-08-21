import { ClipboardCopy, X } from "lucide-react";
import { Panel } from "../panel";
import { StatsInline } from "../stats-inline";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface DedupeToolProps {
  input: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  output: string;
  total: number;
  uniqueCount: number;
  duplicatesRemoved: number;
  onCopy: () => void;
}

export function DedupeTool({
  input,
  onInputChange,
  onClear,
  output,
  total,
  uniqueCount,
  duplicatesRemoved,
  onCopy,
}: DedupeToolProps) {
  return (
    <div className="space-y-4">
      <StatsInline
        items={[
          { label: "Всего строк", value: total },
          { label: "Уникальных", value: uniqueCount },
          { label: "Удалено дубликатов", value: duplicatesRemoved },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          actions={
            <Button onClick={onClear} size="sm" variant="ghost-primary">
              <X className="h-3.5 w-3.5" />
              Очистить
            </Button>
          }
          description="Вставь строки или ID. Поддерживаются переносы, запятые и точки с запятой."
          title="Исходный список"
        >
          <Textarea
            className="min-h-[220px]"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={"Например:\n12345\n12345\n99887"}
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
          description="Список обновляется автоматически при любом изменении."
          title="Результат без дублей"
        >
          <Textarea className="min-h-[220px] bg-muted/60" readOnly value={output} />
        </Panel>
      </div>
    </div>
  );
}
