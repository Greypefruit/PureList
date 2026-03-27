import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface ResultPanelProps {
  title: string;
  description: string;
  value: string;
  countLabel: string;
  secondaryCountLabel?: string;
  metricsBelowTitle?: boolean;
  onCopy: () => void;
  actionLabel?: string;
  minHeightClassName?: string;
}

export function ResultPanel({
  title,
  description,
  value,
  countLabel,
  secondaryCountLabel,
  metricsBelowTitle = false,
  onCopy,
  actionLabel = "Скопировать результат",
  minHeightClassName = "min-h-[240px]",
}: ResultPanelProps) {
  const hasDescription = description.trim().length > 0;
  const metricsClassName = metricsBelowTitle
    ? "flex flex-wrap items-center gap-2"
    : "flex flex-wrap items-center gap-2 self-start xl:max-w-[58%] xl:justify-end";
  const metrics = (
    <div className={metricsClassName}>
      <span className="whitespace-nowrap rounded-[10px] bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        {countLabel}
      </span>
      {secondaryCountLabel ? (
        <span className="whitespace-nowrap rounded-[10px] bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {secondaryCountLabel}
        </span>
      ) : null}
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className={hasDescription || metricsBelowTitle ? "space-y-2 min-w-0" : "min-w-0"}>
            <CardTitle>{title}</CardTitle>
            {hasDescription ? <CardDescription>{description}</CardDescription> : null}
            {metricsBelowTitle ? metrics : null}
          </div>
          {metricsBelowTitle ? null : metrics}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Textarea className={minHeightClassName} readOnly value={value} />
        <Button className="w-full sm:w-auto" disabled={!value} onClick={onCopy}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
