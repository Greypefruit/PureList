import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface ResultPanelProps {
  title: string;
  description: string;
  value: string;
  countLabel: string;
  onCopy: () => void;
  actionLabel?: string;
  minHeightClassName?: string;
}

export function ResultPanel({
  title,
  description,
  value,
  countLabel,
  onCopy,
  actionLabel = "Скопировать результат",
  minHeightClassName = "min-h-[240px]",
}: ResultPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {countLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea className={minHeightClassName} readOnly value={value} />
        <Button className="w-full sm:w-auto" disabled={!value} onClick={onCopy}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
