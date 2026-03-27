interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground lg:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
