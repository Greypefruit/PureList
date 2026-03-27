import { useEffect, useMemo, useState } from "react";
import { SeparatorCombobox } from "./components/separator-combobox";
import { ResultPanel } from "./components/result-panel";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
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
}

interface DedupeState {
  output: string;
  total: number;
  uniqueCount: number;
  duplicatesRemoved: number;
}

interface FormatState {
  output: string;
  count: number;
}

interface ChunkState {
  totalLists: number;
  chunkSize: number;
  chunks: Array<{
    id: string;
    label: string;
    output: string;
    count: number;
  }>;
}

interface CompareState {
  countA: number;
  countB: number;
  intersectionOutput: string;
  intersectionCount: number;
  onlyInAOutput: string;
  onlyInACount: number;
  onlyInBOutput: string;
  onlyInBCount: number;
}

const tabs: TabConfig[] = [
  {
    key: "dedupe",
    label: "Удаление дублей",
    description: "Инструмент для удаления дубликатов.",
  },
  {
    key: "format",
    label: "Форматирование",
    description:
      "Инструмент позволяет преобразовать список в виде столбца в список строчного вида, добавив любой разделитель и наоборот.",
  },
  {
    key: "chunk",
    label: "Разделение",
    description: "Инструмент для разбивки большого списка на отдельные списки.",
  },
  {
    key: "compare",
    label: "Сравнение",
    description:
      "Инструмент находит совпадение значений из двух списков и показывает уникальные значения обоих списков.",
  },
];

function AppShell() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<TabKey>("dedupe");
  const [isProcessing, setIsProcessing] = useState(false);

  const [dedupeInput, setDedupeInput] = useState("");
  const [dedupeSeparator, setDedupeSeparator] = useState("\n");
  const [dedupeState, setDedupeState] = useState<DedupeState>({
    output: "",
    total: 0,
    uniqueCount: 0,
    duplicatesRemoved: 0,
  });

  const [formatInput, setFormatInput] = useState("");
  const [formatSeparator, setFormatSeparator] = useState("\n");
  const [formatState, setFormatState] = useState<FormatState>({
    output: "",
    count: 0,
  });

  const [chunkInput, setChunkInput] = useState("");
  const [chunkSeparator, setChunkSeparator] = useState("\n");
  const [chunkSizeInput, setChunkSizeInput] = useState(String(DEFAULT_CHUNK_SIZE));
  const [chunkState, setChunkState] = useState<ChunkState>({
    totalLists: 0,
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunks: [],
  });

  const [compareInputA, setCompareInputA] = useState("");
  const [compareInputB, setCompareInputB] = useState("");
  const [compareSeparator, setCompareSeparator] = useState("\n");
  const [compareState, setCompareState] = useState<CompareState>({
    countA: 0,
    countB: 0,
    intersectionOutput: "",
    intersectionCount: 0,
    onlyInAOutput: "",
    onlyInACount: 0,
    onlyInBOutput: "",
    onlyInBCount: 0,
  });

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

  const chunkSize = useMemo(() => clampChunkSize(Number(chunkSizeInput)), [chunkSizeInput]);

  async function copyToClipboard(value: string) {
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
    toast("Успешно скопировано!");
  }

  function runProcessing(task: () => void) {
    setIsProcessing(true);
    window.setTimeout(() => {
      try {
        task();
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }

  function handleDedupe() {
    runProcessing(() => {
      const result = deduplicateIds(dedupeInput);
      setDedupeState({
        output: formatOutput(result.uniqueItems, dedupeSeparator),
        total: result.total,
        uniqueCount: result.uniqueItems.length,
        duplicatesRemoved: result.duplicatesRemoved,
      });
    });
  }

  function handleFormat() {
    runProcessing(() => {
      const { items } = parseIds(formatInput);
      setFormatState({
        output: formatOutput(items, formatSeparator),
        count: items.length,
      });
    });
  }

  function handleChunk() {
    runProcessing(() => {
      const chunks = chunkIds(chunkInput, chunkSize).map((chunk, index) => ({
        id: chunk.id,
        label: `Список ${index + 1}`,
        output: formatOutput(chunk.items, chunkSeparator),
        count: chunk.items.length,
      }));

      setChunkState({
        totalLists: chunks.length,
        chunkSize,
        chunks,
      });
    });
  }

  function handleCompare() {
    runProcessing(() => {
      const result = compareLists(compareInputA, compareInputB);
      setCompareState({
        countA: result.countA,
        countB: result.countB,
        intersectionOutput: formatOutput(result.intersection, compareSeparator),
        intersectionCount: result.intersection.length,
        onlyInAOutput: formatOutput(result.onlyInA, compareSeparator),
        onlyInACount: result.onlyInA.length,
        onlyInBOutput: formatOutput(result.onlyInB, compareSeparator),
        onlyInBCount: result.onlyInB.length,
      });
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:36px_36px] opacity-50" />
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-6 py-6 lg:px-10 lg:py-8">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    className={cn(
                      "rounded-[10px] border px-8 py-2.5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "border-[#D7F447] bg-[#E7FF57] text-[#1E2410] shadow-panel"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    <p className={cn("text-[14px] font-semibold leading-tight", isActive ? "text-[#1E2410]" : "text-foreground")}>
                      {tab.label}
                    </p>
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "Тёмная тема" : "Светлая тема"}
            </Button>
          </div>

          <Card className="border-[#F0C35B] bg-[#FFD86B] text-[#3D2A00]">
            <CardContent className="px-5 py-4">
              <p className="text-sm leading-7 text-[#3D2A00]/88">
                {tabs.find((tab) => tab.key === activeTab)?.description}
              </p>
            </CardContent>
          </Card>

          {activeTab === "dedupe" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Удаление дублей</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <Textarea
                    className="min-h-[154px]"
                    onChange={(event) => setDedupeInput(event.target.value)}
                    placeholder="Вставьте список ID в любом популярном формате"
                    value={dedupeInput}
                  />
                  <SeparatorCombobox
                    id="dedupe-separator"
                    label="Разделитель результата"
                    onChange={setDedupeSeparator}
                    value={dedupeSeparator}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleDedupe}>
                      {isProcessing ? "Обработка..." : "Очистить список"}
                    </Button>
                    <Button
                      onClick={() => {
                        setDedupeInput("");
                        setDedupeSeparator("\n");
                        setDedupeState({
                          output: "",
                          total: 0,
                          uniqueCount: 0,
                          duplicatesRemoved: 0,
                        });
                      }}
                      variant="outline"
                    >
                      Очистить всё
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <ResultPanel
                  countLabel={`Уникальных ID: ${dedupeState.uniqueCount}`}
                  description=""
                  minHeightClassName="min-h-[168px]"
                  onCopy={() => copyToClipboard(dedupeState.output)}
                  secondaryCountLabel={`Удалено дублей: ${dedupeState.duplicatesRemoved}`}
                  title="Результат"
                  value={dedupeState.output}
                />
                <div className="flex flex-wrap gap-3">
                  <StatTile className="min-w-[140px] flex-1" label="Всего строк" value={String(dedupeState.total)} />
                  <StatTile className="min-w-[140px] flex-1" label="Уникальных ID" value={String(dedupeState.uniqueCount)} />
                  <StatTile className="min-w-[140px] flex-1" label="Удалено дублей" value={String(dedupeState.duplicatesRemoved)} />
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "format" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Трансформация / Форматирование</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <Textarea
                    className="min-h-[154px]"
                    onChange={(event) => setFormatInput(event.target.value)}
                    placeholder="Вставьте список ID"
                    value={formatInput}
                  />
                  <SeparatorCombobox
                    id="format-separator"
                    label="Разделитель результата"
                    onChange={setFormatSeparator}
                    value={formatSeparator}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleFormat}>
                      {isProcessing ? "Обработка..." : "Преобразовать"}
                    </Button>
                    <Button
                      onClick={() => {
                        setFormatInput("");
                        setFormatSeparator("\n");
                        setFormatState({
                          output: "",
                          count: 0,
                        });
                      }}
                      variant="outline"
                    >
                      Очистить всё
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <ResultPanel
                  countLabel={`Количество ID: ${formatState.count}`}
                  description=""
                  minHeightClassName="min-h-[168px]"
                  onCopy={() => copyToClipboard(formatState.output)}
                  title="Преобразованный результат"
                  value={formatState.output}
                />
              </div>
            </div>
          ) : null}

          {activeTab === "chunk" ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Разделение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <Textarea
                    className="min-h-[154px]"
                    onChange={(event) => setChunkInput(event.target.value)}
                    placeholder="Вставьте большой список ID"
                    value={chunkInput}
                  />
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="chunk-size">
                        Сколько ID в одном списке?
                      </label>
                      <Input
                        id="chunk-size"
                        inputMode="numeric"
                        min={1}
                        onChange={(event) => setChunkSizeInput(event.target.value)}
                        value={chunkSizeInput}
                      />
                    </div>
                    <SeparatorCombobox
                      id="chunk-separator"
                      label="Разделитель внутри каждого куска"
                      onChange={setChunkSeparator}
                      value={chunkSeparator}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleChunk}>
                      {isProcessing ? "Обработка..." : "Разделить"}
                    </Button>
                    <Button
                      onClick={() => {
                        setChunkInput("");
                        setChunkSeparator("\n");
                        setChunkSizeInput(String(DEFAULT_CHUNK_SIZE));
                        setChunkState({
                          totalLists: 0,
                          chunkSize: DEFAULT_CHUNK_SIZE,
                          chunks: [],
                        });
                      }}
                      variant="outline"
                    >
                      Очистить всё
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-[10px] border border-border/70 bg-card/80 px-5 py-4">
                <p className="text-sm font-medium">Итого списков: {chunkState.totalLists}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Размер одного блока: {chunkState.chunkSize}. При некорректном вводе используется значение по умолчанию {DEFAULT_CHUNK_SIZE}.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                {chunkState.chunks.map((chunk) => (
                  <ResultPanel
                    key={chunk.id}
                    actionLabel="Скопировать"
                    countLabel={`ID: ${chunk.count}/${chunkState.chunkSize}`}
                    description="Готовый фрагмент списка."
                    minHeightClassName="min-h-[220px]"
                    onCopy={() => copyToClipboard(chunk.output)}
                    title={chunk.label}
                    value={chunk.output}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "compare" ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Сравнение списков</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="compare-list-a">
                        Список А
                      </label>
                      <Textarea
                        className="min-h-[154px]"
                        id="compare-list-a"
                        onChange={(event) => setCompareInputA(event.target.value)}
                        placeholder="Вставьте список А"
                        value={compareInputA}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="compare-list-b">
                        Список Б
                      </label>
                      <Textarea
                        className="min-h-[154px]"
                        id="compare-list-b"
                        onChange={(event) => setCompareInputB(event.target.value)}
                        placeholder="Вставьте список Б"
                        value={compareInputB}
                      />
                    </div>
                  </div>
                  <SeparatorCombobox
                    id="compare-separator"
                    label="Разделитель результата"
                    onChange={setCompareSeparator}
                    value={compareSeparator}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleCompare}>
                      {isProcessing ? "Обработка..." : "Сравнить"}
                    </Button>
                    <Button
                      onClick={() => {
                        setCompareInputA("");
                        setCompareInputB("");
                        setCompareSeparator("\n");
                        setCompareState({
                          countA: 0,
                          countB: 0,
                          intersectionOutput: "",
                          intersectionCount: 0,
                          onlyInAOutput: "",
                          onlyInACount: 0,
                          onlyInBOutput: "",
                          onlyInBCount: 0,
                        });
                      }}
                      variant="outline"
                    >
                      Очистить всё
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-3">
                <ResultPanel
                  countLabel={`Совпадений: ${compareState.intersectionCount}`}
                  description=""
                  onCopy={() => copyToClipboard(compareState.intersectionOutput)}
                  title="Совпадения"
                  value={compareState.intersectionOutput}
                />
                <ResultPanel
                  countLabel={`Уникальные ID: ${compareState.onlyInACount}`}
                  description=""
                  metricsBelowTitle
                  onCopy={() => copyToClipboard(compareState.onlyInAOutput)}
                  secondaryCountLabel={`Всего значений: ${compareState.countA}`}
                  title="Уникальные в списке А"
                  value={compareState.onlyInAOutput}
                />
                <ResultPanel
                  countLabel={`Уникальные ID: ${compareState.onlyInBCount}`}
                  description=""
                  metricsBelowTitle
                  onCopy={() => copyToClipboard(compareState.onlyInBOutput)}
                  secondaryCountLabel={`Всего значений: ${compareState.countB}`}
                  title="Уникальные в списке Б"
                  value={compareState.onlyInBOutput}
                />
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[10px] border border-border/70 bg-background/70 p-4", className)}>
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-[14px] font-semibold">{value}</p>
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
