import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCheck,
  ChevronRight,
  ClipboardCopy,
  Columns2,
  GitCompareArrows,
  Moon,
  Palette,
  ScissorsLineDashed,
  Sparkles,
  Sun,
  WandSparkles,
  X,
} from "lucide-react";
import { SeparatorCombobox } from "./components/separator-combobox";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { ToastProvider, useToast } from "./components/ui/toaster";
import {
  DEFAULT_CHUNK_SIZE,
  chunkIds,
  clampChunkSize,
  compareLists,
  deduplicateIds,
  formatOutput,
  parseIds,
} from "./lib/id-tools";
import { cn } from "./lib/utils";

type TabKey = "dedupe" | "format" | "chunk" | "compare";
type Theme = "light" | "dark";

interface TabConfig {
  key: TabKey;
  label: string;
  description: string;
  icon: typeof CheckCheck;
  accent: string;
}

const tabs: TabConfig[] = [
  {
    key: "dedupe",
    label: "Удаление дублей",
    description: "Очищает список и оставляет только первые вхождения.",
    icon: CheckCheck,
    accent: "from-indigo-500/20 via-violet-500/10 to-transparent",
  },
  {
    key: "format",
    label: "Форматирование",
    description: "Приводит список к нужному виду и разделителю.",
    icon: WandSparkles,
    accent: "from-fuchsia-500/20 via-indigo-500/10 to-transparent",
  },
  {
    key: "chunk",
    label: "Разделение",
    description: "Делит длинный список на несколько удобных частей.",
    icon: Columns2,
    accent: "from-sky-500/20 via-indigo-500/10 to-transparent",
  },
  {
    key: "compare",
    label: "Сравнение",
    description: "Показывает пересечения и отличия двух списков.",
    icon: GitCompareArrows,
    accent: "from-emerald-500/20 via-indigo-500/10 to-transparent",
  },
];

function AppShell() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<TabKey>("dedupe");

  const [dedupeInput, setDedupeInput] = useState("");
  const [dedupeSeparator, setDedupeSeparator] = useState("\n");

  const [formatInput, setFormatInput] = useState("");
  const [formatSeparator, setFormatSeparator] = useState(", ");

  const [chunkInput, setChunkInput] = useState("");
  const [chunkSeparator, setChunkSeparator] = useState("\n");
  const [chunkSizeInput, setChunkSizeInput] = useState(String(DEFAULT_CHUNK_SIZE));

  const [compareInputA, setCompareInputA] = useState("");
  const [compareInputB, setCompareInputB] = useState("");
  const [compareSeparator, setCompareSeparator] = useState("\n");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("purelist-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("purelist-theme", theme);
  }, [theme]);

  const dedupeStats = useMemo(() => {
    const result = deduplicateIds(dedupeInput);
    return {
      output: formatOutput(result.uniqueItems, dedupeSeparator),
      total: result.total,
      uniqueCount: result.uniqueItems.length,
      duplicatesRemoved: result.duplicatesRemoved,
    };
  }, [dedupeInput, dedupeSeparator]);

  const formatStats = useMemo(() => {
    const { items } = parseIds(formatInput);
    return {
      output: formatOutput(items, formatSeparator),
      count: items.length,
    };
  }, [formatInput, formatSeparator]);

  const chunkSize = useMemo(() => clampChunkSize(Number(chunkSizeInput)), [chunkSizeInput]);

  const chunkStats = useMemo(() => {
    const chunks = chunkIds(chunkInput, chunkSize).map((chunk, index) => ({
      id: chunk.id,
      label: `Часть ${index + 1}`,
      output: formatOutput(chunk.items, chunkSeparator),
      count: chunk.items.length,
    }));

    const totalItems = parseIds(chunkInput).items.length;

    return {
      chunkSize,
      totalItems,
      totalLists: chunks.length,
      chunks,
    };
  }, [chunkInput, chunkSeparator, chunkSize]);

  const compareStats = useMemo(() => {
    const result = compareLists(compareInputA, compareInputB);
    return {
      countA: result.countA,
      countB: result.countB,
      intersectionOutput: formatOutput(result.intersection, compareSeparator),
      intersectionCount: result.intersection.length,
      onlyInAOutput: formatOutput(result.onlyInA, compareSeparator),
      onlyInACount: result.onlyInA.length,
      onlyInBOutput: formatOutput(result.onlyInB, compareSeparator),
      onlyInBCount: result.onlyInB.length,
    };
  }, [compareInputA, compareInputB, compareSeparator]);

  async function copyToClipboard(value: string, successMessage = "Скопировано") {
    if (!value) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.setAttribute("readonly", "true");
      helper.style.position = "absolute";
      helper.style.left = "-9999px";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      document.body.removeChild(helper);
    }

    toast(successMessage);
  }

  function clearCurrentTab() {
    if (activeTab === "dedupe") {
      setDedupeInput("");
      toast("Поле удаления дублей очищено");
      return;
    }
    if (activeTab === "format") {
      setFormatInput("");
      toast("Поле форматирования очищено");
      return;
    }
    if (activeTab === "chunk") {
      setChunkInput("");
      setChunkSizeInput(String(DEFAULT_CHUNK_SIZE));
      toast("Данные для разбиения очищены");
      return;
    }
    setCompareInputA("");
    setCompareInputB("");
    toast("Оба списка очищены");
  }

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabConfig.icon;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[size:28px_28px] opacity-[0.28]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.20),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_42%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden border-white/50 bg-card/80">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="relative overflow-hidden p-6 sm:p-8">
                  <div className={cn("absolute inset-0 bg-gradient-to-br", activeTabConfig.accent)} />
                  <div className="relative space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Pure List
                      </Badge>
                      <Badge className="px-3 py-1.5 text-xs" variant="outline">
                        Bento Grid UI
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-primary shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                        <ActiveIcon className="h-6 w-6" />
                      </div>
                      <div className="space-y-3">
                        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                          Полный редизайн Pure List без потери текущей логики.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                          Все режимы обработки списков собраны в одну аккуратную систему: удаление дублей,
                          форматирование, разбиение на части и сравнение двух списков в реальном времени.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <MiniMetric label="Активный режим" value={activeTabConfig.label} />
                      <MiniMetric label="Темы" value="Light / Dark" />
                      <MiniMetric label="Обработка" value="Real-time" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-border/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Быстрые действия</p>
                    <div className="grid gap-3">
                      <Button
                        className="justify-start gap-2"
                        variant="secondary"
                        onClick={() =>
                          setTheme((current) => (current === "light" ? "dark" : "light"))
                        }
                      >
                        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        Переключить тему
                      </Button>
                      <Button className="justify-start gap-2" variant="ghost" onClick={clearCurrentTab}>
                        <X className="h-4 w-4" />
                        Очистить текущую вкладку
                      </Button>
                      <Button
                        className="justify-start gap-2"
                        variant="ghost"
                        onClick={() => toast("Настройки можно расширить в отдельной панели позже")}
                      >
                        <Palette className="h-4 w-4" />
                        Настройки интерфейса
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 shadow-sm">
                    <p className="text-sm font-medium">Текущий режим</p>
                    <p className="mt-2 text-lg font-semibold">{activeTabConfig.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeTabConfig.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-card/75">
            <CardHeader>
              <CardTitle>Режимы</CardTitle>
              <CardDescription>Все вкладки в одном компактном блоке навигации.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    className={cn(
                      "group flex w-full items-start justify-between rounded-[1.35rem] border px-4 py-4 text-left transition-all duration-200",
                      isActive
                        ? "border-primary/40 bg-primary/10 shadow-sm"
                        : "border-border/70 bg-background/70 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-background",
                    )}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border",
                          isActive ? "border-primary/30 bg-primary/15 text-primary" : "border-border/70 bg-card text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-sm leading-6 text-muted-foreground">{tab.description}</div>
                      </div>
                    </div>
                    <ChevronRight className={cn("mt-1 h-4 w-4 transition-transform", isActive ? "text-primary" : "text-muted-foreground group-hover:translate-x-0.5")} />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6">
          {activeTab === "dedupe" && (
            <>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <WorkbenchCard
                  title="Исходный список"
                  description="Вставь строки или ID. Поддерживаются переносы, запятые и точки с запятой."
                  actions={
                    <div className="flex flex-wrap gap-2">
                      <Button className="gap-2" variant="ghost" onClick={() => setDedupeInput("")}>
                        <X className="h-4 w-4" />
                        Очистить
                      </Button>
                    </div>
                  }
                >
                  <Textarea
                    className="min-h-[360px]"
                    onChange={(event) => setDedupeInput(event.target.value)}
                    placeholder={"Например:\n12345\n12345\n99887"}
                    value={dedupeInput}
                  />
                </WorkbenchCard>

                <WorkbenchCard
                  title="Результат без дублей"
                  description="Список обновляется автоматически при любом изменении."
                  actions={
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="gap-2"
                        disabled={!dedupeStats.output}
                        onClick={() => copyToClipboard(dedupeStats.output, "Результат без дублей скопирован")}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        Скопировать
                      </Button>
                    </div>
                  }
                  footer={
                    <SeparatorCombobox
                      id="dedupe-separator"
                      label="Разделитель результата"
                      onChange={setDedupeSeparator}
                      value={dedupeSeparator}
                    />
                  }
                >
                  <Textarea className="min-h-[360px]" readOnly value={dedupeStats.output} />
                </WorkbenchCard>
              </div>
              <StatsBar
                items={[
                  { label: "Всего строк", value: dedupeStats.total },
                  { label: "Уникальных", value: dedupeStats.uniqueCount },
                  { label: "Удалено дубликатов", value: dedupeStats.duplicatesRemoved },
                ]}
              />
            </>
          )}

          {activeTab === "format" && (
            <>
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <WorkbenchCard
                  title="Список для форматирования"
                  description="Вставь любой набор строк или ID, а затем выбери формат результата."
                  actions={
                    <Button className="gap-2" variant="ghost" onClick={() => setFormatInput("")}>
                      <X className="h-4 w-4" />
                      Очистить
                    </Button>
                  }
                  footer={
                    <SeparatorCombobox
                      id="format-separator"
                      label="Разделитель результата"
                      onChange={setFormatSeparator}
                      value={formatSeparator}
                    />
                  }
                >
                  <Textarea
                    className="min-h-[340px]"
                    onChange={(event) => setFormatInput(event.target.value)}
                    placeholder="Например: id_1, id_2, id_3"
                    value={formatInput}
                  />
                </WorkbenchCard>

                <WorkbenchCard
                  title="Отформатированный вывод"
                  description="Результат сразу готов к вставке в SQL, таблицу или другой инструмент."
                  actions={
                    <Button
                      className="gap-2"
                      disabled={!formatStats.output}
                      onClick={() => copyToClipboard(formatStats.output, "Отформатированный список скопирован")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Скопировать
                    </Button>
                  }
                >
                  <Textarea className="min-h-[340px]" readOnly value={formatStats.output} />
                </WorkbenchCard>
              </div>
              <StatsBar compact items={[{ label: "Элементов", value: formatStats.count }]} />
            </>
          )}

          {activeTab === "chunk" && (
            <>
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <WorkbenchCard
                  title="Большой список"
                  description="Вставь список, который нужно разбить на несколько частей."
                  actions={
                    <Button className="gap-2" variant="ghost" onClick={() => setChunkInput("")}>
                      <X className="h-4 w-4" />
                      Очистить
                    </Button>
                  }
                  footer={
                    <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="chunk-size">
                          Размер части
                        </label>
                        <Input
                          id="chunk-size"
                          inputMode="numeric"
                          onChange={(event) => setChunkSizeInput(event.target.value)}
                          value={chunkSizeInput}
                        />
                      </div>
                      <SeparatorCombobox
                        id="chunk-separator"
                        label="Разделитель внутри части"
                        onChange={setChunkSeparator}
                        value={chunkSeparator}
                      />
                    </div>
                  }
                >
                  <Textarea
                    className="min-h-[340px]"
                    onChange={(event) => setChunkInput(event.target.value)}
                    placeholder="Вставь длинный список значений"
                    value={chunkInput}
                  />
                </WorkbenchCard>

                <Card className="h-full border-white/40 bg-card/80">
                  <CardHeader>
                    <CardTitle>Сгенерированные части</CardTitle>
                    <CardDescription>Каждый блок можно копировать отдельно.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {chunkStats.chunks.length ? (
                      <div className="grid max-h-[620px] gap-4 overflow-auto pr-1">
                        {chunkStats.chunks.map((chunk) => (
                          <div key={chunk.id} className="rounded-[1.4rem] border border-border/70 bg-background/80 p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium">{chunk.label}</p>
                                <p className="text-sm text-muted-foreground">{chunk.count} элементов</p>
                              </div>
                              <Button
                                className="gap-2"
                                onClick={() => copyToClipboard(chunk.output, `${chunk.label} скопирована`)}
                                size="sm"
                              >
                                <ClipboardCopy className="h-4 w-4" />
                                Скопировать
                              </Button>
                            </div>
                            <Textarea className="min-h-[130px]" readOnly value={chunk.output} />
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
                  </CardContent>
                </Card>
              </div>
              <StatsBar
                items={[
                  { label: "Всего элементов", value: chunkStats.totalItems },
                  { label: "Размер части", value: chunkStats.chunkSize },
                  { label: "Списков создано", value: chunkStats.totalLists },
                ]}
              />
            </>
          )}

          {activeTab === "compare" && (
            <>
              <div className="grid gap-6 2xl:grid-cols-2">
                <WorkbenchCard
                  title="Список A"
                  description="Первый набор данных для сравнения."
                  actions={
                    <Button className="gap-2" variant="ghost" onClick={() => setCompareInputA("")}>
                      <X className="h-4 w-4" />
                      Очистить
                    </Button>
                  }
                >
                  <Textarea
                    className="min-h-[300px]"
                    onChange={(event) => setCompareInputA(event.target.value)}
                    placeholder="Первый список"
                    value={compareInputA}
                  />
                </WorkbenchCard>

                <WorkbenchCard
                  title="Список B"
                  description="Второй набор данных для сравнения."
                  actions={
                    <Button className="gap-2" variant="ghost" onClick={() => setCompareInputB("")}>
                      <X className="h-4 w-4" />
                      Очистить
                    </Button>
                  }
                  footer={
                    <SeparatorCombobox
                      id="compare-separator"
                      label="Разделитель результата"
                      onChange={setCompareSeparator}
                      value={compareSeparator}
                    />
                  }
                >
                  <Textarea
                    className="min-h-[300px]"
                    onChange={(event) => setCompareInputB(event.target.value)}
                    placeholder="Второй список"
                    value={compareInputB}
                  />
                </WorkbenchCard>
              </div>

              <StatsBar
                items={[
                  { label: "Уникальных в A", value: compareStats.countA },
                  { label: "Уникальных в B", value: compareStats.countB },
                  { label: "Общее пересечение", value: compareStats.intersectionCount },
                ]}
              />

              <div className="grid gap-6 xl:grid-cols-3">
                <WorkbenchCard
                  title="Пересечение"
                  description="Элементы, которые есть в обоих списках."
                  actions={
                    <Button
                      className="gap-2"
                      disabled={!compareStats.intersectionOutput}
                      onClick={() => copyToClipboard(compareStats.intersectionOutput, "Пересечение скопировано")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Скопировать
                    </Button>
                  }
                >
                  <Textarea className="min-h-[220px]" readOnly value={compareStats.intersectionOutput} />
                </WorkbenchCard>

                <WorkbenchCard
                  title="Только в A"
                  description="Элементы, которых нет во втором списке."
                  actions={
                    <Button
                      className="gap-2"
                      disabled={!compareStats.onlyInAOutput}
                      onClick={() => copyToClipboard(compareStats.onlyInAOutput, "Уникальные элементы A скопированы")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Скопировать
                    </Button>
                  }
                >
                  <Textarea className="min-h-[220px]" readOnly value={compareStats.onlyInAOutput} />
                </WorkbenchCard>

                <WorkbenchCard
                  title="Только в B"
                  description="Элементы, которых нет в первом списке."
                  actions={
                    <Button
                      className="gap-2"
                      disabled={!compareStats.onlyInBOutput}
                      onClick={() => copyToClipboard(compareStats.onlyInBOutput, "Уникальные элементы B скопированы")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Скопировать
                    </Button>
                  }
                >
                  <Textarea className="min-h-[220px]" readOnly value={compareStats.onlyInBOutput} />
                </WorkbenchCard>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-background/70 px-4 py-3 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold sm:text-base">{value}</p>
    </div>
  );
}

function WorkbenchCard({
  title,
  description,
  actions,
  footer,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="h-full border-white/40 bg-card/80">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
}

function StatsBar({
  items,
  compact = false,
}: {
  items: Array<{ label: string; value: number | string }>;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      {items.map((item) => (
        <Card key={item.label} className="border-white/40 bg-card/75 transition-transform duration-200 hover:-translate-y-0.5">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ScissorsLineDashed;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
