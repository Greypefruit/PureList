interface StatItem {
  label: string;
  value: number | string;
}

export function StatsInline({ items }: { items: StatItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary">
      {items.map((item) => (
        <span key={item.label} className="whitespace-nowrap">
          {item.label}: <span className="font-semibold">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
