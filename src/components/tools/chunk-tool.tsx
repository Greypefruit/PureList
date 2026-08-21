import { ClipboardCopy, ScissorsLineDashed, X } from "lucide-react";
import { EmptyState } from "../empty-state";
import { Panel } from "../panel";
import { SeparatorCombobox } from "../separator-combobox";
import { StatsInline } from "../stats-inline";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ChunkResult {
  id: string;
  label: string;
  output: string;
  count: number;
}

interface ChunkToolProps {
  input: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  separator: string;
  onSeparatorChange: (value: string) => void;
  chunkSizeInput: string;
  onChunkSizeChange: (value: string) => void;
  chunkSize: number;
  totalItems: number;
  totalLists: number;
  chunks: ChunkResult[];
  onCopyChunk: (chunk: ChunkResult) => void;
}

export function ChunkTool({
  input,
  onInputChange,
  onClear,
  separator,
  onSeparatorChange,
  chunkSizeInput,
  onChunkSizeChange,
  chunkSize,
  totalItems,
  totalLists,
  chunks,
  onCopyChunk,
}: ChunkToolProps) {
  return (
    <div className="space-y-4">
      <StatsInline
        items={[
          { label: "Всего элементов", value: totalItems },
          { label: "Размер части", value: chunkSize },
          { label: "Списков создано", value: totalLists },
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
          description="Вставь список, который нужно разбить на несколько частей."
          title="Большой список"
        >
          <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="chunk-size">
                Размер части
              </label>
              <Input
                id="chunk-size"
                inputMode="numeric"
                onChange={(event) => onChunkSizeChange(event.target.value)}
                value={chunkSizeInput}
              />
            </div>
            <SeparatorCombobox
              id="chunk-separator"
              label="Разделитель внутри части"
              onChange={onSeparatorChange}
              value={separator}
            />
          </div>
          <Textarea
            className="min-h-[220px]"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Вставь длинный список значений"
            value={input}
          />
        </Panel>

        <Panel
          contentClassName={chunks.length ? "gap-0 p-0" : "p-4"}
          description="Каждый блок можно копировать отдельно."
          title="Сгенерированные части"
        >
          {chunks.length ? (
            <div className="max-h-[420px] divide-y divide-border overflow-auto">
              {chunks.map((chunk) => (
                <div className="space-y-2 p-4" key={chunk.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{chunk.label}</p>
                      <p className="text-xs text-muted-foreground">{chunk.count} элементов</p>
                    </div>
                    <Button onClick={() => onCopyChunk(chunk)} size="sm">
                      <ClipboardCopy className="h-3.5 w-3.5" />
                      Скопировать
                    </Button>
                  </div>
                  <Textarea className="min-h-[80px] bg-muted/60" readOnly value={chunk.output} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Добавь данные слева, и здесь автоматически появятся готовые блоки списка."
              icon={ScissorsLineDashed}
              title="Пока нет частей"
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
