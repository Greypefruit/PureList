import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { CheckCheck, Columns2, GitCompareArrows, WandSparkles } from "lucide-react";
import { AppHeader } from "./components/layout/app-header";
import { ModeTabs } from "./components/layout/mode-tabs";
import { ChunkTool } from "./components/tools/chunk-tool";
import { CompareTool } from "./components/tools/compare-tool";
import { DedupeTool } from "./components/tools/dedupe-tool";
import { FormatTool } from "./components/tools/format-tool";
import { ToastProvider, useToast } from "./components/ui/toaster";
import { copyToClipboard } from "./lib/clipboard";
import {
  DEFAULT_CHUNK_SIZE,
  chunkIds,
  clampChunkSize,
  compareLists,
  deduplicateIds,
  formatOutput,
  parseIds,
} from "./lib/id-tools";

type TabKey = "dedupe" | "format" | "chunk" | "compare";
type Theme = "light" | "dark";

interface TabConfig {
  key: TabKey;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  {
    key: "format",
    label: "Форматирование",
    description: "Приводит список к нужному виду и разделителю.",
    icon: WandSparkles,
  },
  {
    key: "compare",
    label: "Сравнение",
    description: "Показывает пересечения и отличия двух списков.",
    icon: GitCompareArrows,
  },
  {
    key: "chunk",
    label: "Разделение",
    description: "Делит длинный список на маленькие списки.",
    icon: Columns2,
  },
  {
    key: "dedupe",
    label: "Удаление дублей",
    description: "Очищает список от дублей.",
    icon: CheckCheck,
  },
];

function AppShell() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<TabKey>("format");

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

  async function handleCopy(value: string, successMessage = "Скопировано") {
    if (!value) {
      return;
    }

    await copyToClipboard(value);
    toast(successMessage);
  }

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="w-full px-5 lg:px-8 xl:px-10 2xl:px-12">
          <AppHeader
            navigation={<ModeTabs activeKey={activeTab} onChange={setActiveTab} tabs={tabs} />}
            onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            theme={theme}
          />
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <p className="mb-4 max-w-2xl text-sm leading-6 text-muted-foreground">{activeTabConfig.description}</p>

        {activeTab === "dedupe" && (
          <DedupeTool
            duplicatesRemoved={dedupeStats.duplicatesRemoved}
            input={dedupeInput}
            onClear={() => setDedupeInput("")}
            onCopy={() => handleCopy(dedupeStats.output, "Результат без дублей скопирован")}
            onInputChange={setDedupeInput}
            output={dedupeStats.output}
            total={dedupeStats.total}
            uniqueCount={dedupeStats.uniqueCount}
          />
        )}

        {activeTab === "format" && (
          <FormatTool
            count={formatStats.count}
            input={formatInput}
            onClear={() => setFormatInput("")}
            onCopy={() => handleCopy(formatStats.output, "Отформатированный список скопирован")}
            onInputChange={setFormatInput}
            onSeparatorChange={setFormatSeparator}
            output={formatStats.output}
            separator={formatSeparator}
          />
        )}

        {activeTab === "chunk" && (
          <ChunkTool
            chunkSize={chunkStats.chunkSize}
            chunkSizeInput={chunkSizeInput}
            chunks={chunkStats.chunks}
            input={chunkInput}
            onChunkSizeChange={setChunkSizeInput}
            onClear={() => setChunkInput("")}
            onCopyChunk={(chunk) => handleCopy(chunk.output, `${chunk.label} скопирована`)}
            onInputChange={setChunkInput}
            onSeparatorChange={setChunkSeparator}
            separator={chunkSeparator}
            totalItems={chunkStats.totalItems}
            totalLists={chunkStats.totalLists}
          />
        )}

        {activeTab === "compare" && (
          <CompareTool
            countA={compareStats.countA}
            countB={compareStats.countB}
            inputA={compareInputA}
            inputB={compareInputB}
            intersectionCount={compareStats.intersectionCount}
            intersectionOutput={compareStats.intersectionOutput}
            onClearA={() => setCompareInputA("")}
            onClearB={() => setCompareInputB("")}
            onCopyIntersection={() => handleCopy(compareStats.intersectionOutput, "Пересечение скопировано")}
            onCopyOnlyInA={() => handleCopy(compareStats.onlyInAOutput, "Уникальные элементы A скопированы")}
            onCopyOnlyInB={() => handleCopy(compareStats.onlyInBOutput, "Уникальные элементы B скопированы")}
            onInputAChange={setCompareInputA}
            onInputBChange={setCompareInputB}
            onlyInACount={compareStats.onlyInACount}
            onlyInAOutput={compareStats.onlyInAOutput}
            onlyInBCount={compareStats.onlyInBCount}
            onlyInBOutput={compareStats.onlyInBOutput}
          />
        )}
      </main>
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
