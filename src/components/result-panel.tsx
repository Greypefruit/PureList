import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface ResultPanelProps {
  title: string;
  description: string;
  value: string;
  countLabel: string;
  secondaryCountLabel?: string;
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
  onCopy,
  actionLabel = "Скопировать результат",
  minHeightClassName = "min-h-[240px]",
}: ResultPanelProps) {
  const hasDescription = description.trim().length > 0;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className={hasDescription ? "space-y-1" : ""}>
            <CardTitle>{title}</CardTitle>
            {hasDescription ? <CardDescription>{description}</CardDescription> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:max-w-[48%] xl:justify-end">
            <span className="whitespace-nowrap rounded-[10px] bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {countLabel}
            </span>
            {secondaryCountLabel ? (
              <span className="whitespace-nowrap rounded-[10px] bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {secondaryCountLabel}
              </span>
            ) : null}
          </div>
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
