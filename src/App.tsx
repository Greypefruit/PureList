import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Trash2,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Columns2,
  Split,
  GitCompare,
  Zap,
} from "lucide-react";
import { SeparatorCombobox } from "./components/separator-combobox";
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
  icon: typeof Sparkles;
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
    description: "Быстрое удаление дубликатов из списка ID или строк",
    icon: Sparkles,
  },
  {
    key: "format",
    label: "Форматирование",
    description: "Преобразование разделителей списка в нужный формат",
    icon: Columns2,
  },
  {
    key: "chunk",
    label: "Разделение",
    description: "Разбивка большого списка на части нужного размера",
    icon: Split,
  },
  {
    key: "compare",
    label: "Сравнение",
    description: "Сравнение двух списков и поиск пересечений",
    icon: GitCompare,
  },
];

function AppShell() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>("dark");
  const [activeTab, setActiveTab] = useState<TabKey>("dedupe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    toast("Скопировано в буфер обмена!");
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

  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">PureList</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              className="rounded-lg"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{currentTab?.description}</p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {activeTab === "dedupe" && (
                <SeparatorCombobox
                  id="dedupe-separator"
                  label="Разделитель результата"
                  onChange={setDedupeSeparator}
                  value={dedupeSeparator}
                />
              )}
              {activeTab === "format" && (
                <SeparatorCombobox
                  id="format-separator"
                  label="Разделитель результата"
                  onChange={setFormatSeparator}
                  value={formatSeparator}
                />
              )}
              {activeTab === "chunk" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="chunk-size">
                      Размер блока
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
                    label="Разделитель внутри блока"
                    onChange={setChunkSeparator}
                    value={chunkSeparator}
                  />
                </div>
              )}
              {activeTab === "compare" && (
                <SeparatorCombobox
                  id="compare-separator"
                  label="Разделитель результата"
                  onChange={setCompareSeparator}
                  value={compareSeparator}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Dedupe Tab */}
        {activeTab === "dedupe" && (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Input Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Исходный список</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDedupeInput("");
                      setDedupeState({
                        output: "",
                        total: 0,
                        uniqueCount: 0,
                        duplicatesRemoved: 0,
                      });
                    }}
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Очистить</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Textarea
                  className="min-h-[240px]"
                  onChange={(event) => setDedupeInput(event.target.value)}
                  placeholder="Вставьте список ID или строк в любом формате..."
                  value={dedupeInput}
                />
                <Button onClick={handleDedupe} className="w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  {isProcessing ? "Обработка..." : "Удалить дубликаты"}
                </Button>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Результат</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(dedupeState.output)}
                    disabled={!dedupeState.output}
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Скопировать</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Textarea
                  className="min-h-[240px]"
                  readOnly
                  value={dedupeState.output}
                  placeholder="Результат появится здесь..."
                />
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Всего строк" value={dedupeState.total} />
                  <StatCard label="Уникальных" value={dedupeState.uniqueCount} variant="primary" />
                  <StatCard label="Удалено" value={dedupeState.duplicatesRemoved} variant="accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Format Tab */}
        {activeTab === "format" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Исходный список</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormatInput("");
                      setFormatState({ output: "", count: 0 });
                    }}
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Очистить</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Textarea
                  className="min-h-[240px]"
                  onChange={(event) => setFormatInput(event.target.value)}
                  placeholder="Вставьте список ID..."
                  value={formatInput}
                />
                <Button onClick={handleFormat} className="w-full sm:w-auto">
                  <Columns2 className="h-4 w-4" />
                  {isProcessing ? "Обработка..." : "Преобразовать"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Результат</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatState.output)}
                    disabled={!formatState.output}
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Скопировать</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Textarea
                  className="min-h-[240px]"
                  readOnly
                  value={formatState.output}
                  placeholder="Результат появится здесь..."
                />
                <div className="grid grid-cols-1 gap-3">
                  <StatCard label="Количество элементов" value={formatState.count} variant="primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chunk Tab */}
        {activeTab === "chunk" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Исходный список</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setChunkInput("");
                      setChunkState({
                        totalLists: 0,
                        chunkSize: DEFAULT_CHUNK_SIZE,
                        chunks: [],
                      });
                    }}
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Очистить</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Textarea
                  className="min-h-[160px]"
                  onChange={(event) => setChunkInput(event.target.value)}
                  placeholder="Вставьте большой список ID..."
                  value={chunkInput}
                />
                <Button onClick={handleChunk} className="w-full sm:w-auto">
                  <Split className="h-4 w-4" />
                  {isProcessing ? "Обработка..." : "Разделить"}
                </Button>
              </CardContent>
            </Card>

            {chunkState.chunks.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Всего списков" value={chunkState.totalLists} variant="primary" />
                  <StatCard label="Размер блока" value={chunkState.chunkSize} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {chunkState.chunks.map((chunk) => (
                    <Card key={chunk.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {chunk.label}
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {chunk.count} ID
                            </span>
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(chunk.output)}
                            className="h-8 w-8"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Textarea className="min-h-[140px]" readOnly value={chunk.output} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Список A</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCompareInputA("")}
                      className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    className="min-h-[140px]"
                    onChange={(event) => setCompareInputA(event.target.value)}
                    placeholder="Вставьте первый список..."
                    value={compareInputA}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Список B</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCompareInputB("")}
                      className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    className="min-h-[140px]"
                    onChange={(event) => setCompareInputB(event.target.value)}
                    placeholder="Вставьте второй список..."
                    value={compareInputB}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCompare}>
                <GitCompare className="h-4 w-4" />
                {isProcessing ? "Обработка..." : "Сравнить списки"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCompareInputA("");
                  setCompareInputB("");
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
              >
                <Trash2 className="h-4 w-4" />
                Очистить всё
              </Button>
            </div>

            {(compareState.intersectionCount > 0 ||
              compareState.onlyInACount > 0 ||
              compareState.onlyInBCount > 0) && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="В списке A" value={compareState.countA} />
                  <StatCard label="В списке B" value={compareState.countB} />
                  <StatCard label="Совпадений" value={compareState.intersectionCount} variant="primary" />
                  <StatCard
                    label="Уникальных"
                    value={compareState.onlyInACount + compareState.onlyInBCount}
                    variant="accent"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <CompareResultCard
                    title="Совпадения"
                    count={compareState.intersectionCount}
                    output={compareState.intersectionOutput}
                    onCopy={() => copyToClipboard(compareState.intersectionOutput)}
                    variant="primary"
                  />
                  <CompareResultCard
                    title="Только в A"
                    count={compareState.onlyInACount}
                    output={compareState.onlyInAOutput}
                    onCopy={() => copyToClipboard(compareState.onlyInAOutput)}
                  />
                  <CompareResultCard
                    title="Только в B"
                    count={compareState.onlyInBCount}
                    output={compareState.onlyInBOutput}
                    onCopy={() => copyToClipboard(compareState.onlyInBOutput)}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "primary" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all duration-200",
        variant === "default" && "border-border bg-card",
        variant === "primary" && "border-primary/20 bg-primary/5",
        variant === "accent" && "border-accent-foreground/20 bg-accent",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-xl font-semibold tabular-nums",
          variant === "primary" && "text-primary",
          variant === "accent" && "text-accent-foreground",
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function CompareResultCard({
  title,
  count,
  output,
  onCopy,
  variant = "default",
}: {
  title: string;
  count: number;
  output: string;
  onCopy: () => void;
  variant?: "default" | "primary";
}) {
  return (
    <Card className={cn(variant === "primary" && "border-primary/30")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium",
                variant === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            disabled={!output}
            className="h-8 w-8"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          className="min-h-[160px]"
          readOnly
          value={output}
          placeholder="Нет данных"
        />
      </CardContent>
    </Card>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
