import { ClipboardCopy, X } from "lucide-react";
import { Panel } from "../panel";
import { StatsInline } from "../stats-inline";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface CompareToolProps {
  inputA: string;
  onInputAChange: (value: string) => void;
  onClearA: () => void;
  inputB: string;
  onInputBChange: (value: string) => void;
  onClearB: () => void;
  countA: number;
  countB: number;
  intersectionOutput: string;
  intersectionCount: number;
  onCopyIntersection: () => void;
  onlyInAOutput: string;
  onlyInACount: number;
  onCopyOnlyInA: () => void;
  onlyInBOutput: string;
  onlyInBCount: number;
  onCopyOnlyInB: () => void;
}

export function CompareTool({
  inputA,
  onInputAChange,
  onClearA,
  inputB,
  onInputBChange,
  onClearB,
  countA,
  countB,
  intersectionOutput,
  intersectionCount,
  onCopyIntersection,
  onlyInAOutput,
  onlyInACount,
  onCopyOnlyInA,
  onlyInBOutput,
  onlyInBCount,
  onCopyOnlyInB,
}: CompareToolProps) {
  return (
    <div className="space-y-4">
      <StatsInline
        items={[
          { label: "Уникальных в A", value: countA },
          { label: "Уникальных в B", value: countB },
          { label: "Общее пересечение", value: intersectionCount },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          actions={
            <Button onClick={onClearA} size="sm" variant="ghost-primary">
              <X className="h-3.5 w-3.5" />
              Очистить
            </Button>
          }
          description="Первый набор данных для сравнения."
          title="Список A"
        >
          <Textarea
            className="min-h-[220px]"
            onChange={(event) => onInputAChange(event.target.value)}
            placeholder="Первый список"
            value={inputA}
          />
        </Panel>

        <Panel
          actions={
            <Button onClick={onClearB} size="sm" variant="ghost-primary">
              <X className="h-3.5 w-3.5" />
              Очистить
            </Button>
          }
          description="Второй набор данных для сравнения."
          title="Список B"
        >
          <Textarea
            className="min-h-[220px]"
            onChange={(event) => onInputBChange(event.target.value)}
            placeholder="Второй список"
            value={inputB}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          actions={
            <Button disabled={!intersectionOutput} onClick={onCopyIntersection} size="sm">
              <ClipboardCopy className="h-3.5 w-3.5" />
              Скопировать
            </Button>
          }
          description="Элементы, которые есть в обоих списках."
          title="Пересечение"
        >
          <Textarea className="min-h-[180px] bg-muted/60" readOnly value={intersectionOutput} />
        </Panel>

        <Panel
          actions={
            <Button disabled={!onlyInAOutput} onClick={onCopyOnlyInA} size="sm">
              <ClipboardCopy className="h-3.5 w-3.5" />
              Скопировать
            </Button>
          }
          description="Элементы, которых нет во втором списке."
          title="Только в A"
        >
          <Textarea className="min-h-[180px] bg-muted/60" readOnly value={onlyInAOutput} />
        </Panel>

        <Panel
          actions={
            <Button disabled={!onlyInBOutput} onClick={onCopyOnlyInB} size="sm">
              <ClipboardCopy className="h-3.5 w-3.5" />
              Скопировать
            </Button>
          }
          description="Элементы, которых нет в первом списке."
          title="Только в B"
        >
          <Textarea className="min-h-[180px] bg-muted/60" readOnly value={onlyInBOutput} />
        </Panel>
      </div>
    </div>
  );
}
