export const DEFAULT_CHUNK_SIZE = 500;

export const OUTPUT_PRESETS = [
  { label: "Перенос строки", value: "\n" },
  { label: "Запятая", value: "," },
  { label: "Запятая и пробел", value: ", " },
  { label: "Точка с запятой", value: ";" },
  { label: "Пробел", value: " " },
] as const;

export type OutputSeparator = string;

export interface ParseResult {
  items: string[];
  total: number;
}

const INPUT_SPLIT_PATTERN = /[\n,;]+/g;

export function parseIds(input: string): ParseResult {
  if (!input.trim()) {
    return { items: [], total: 0 };
  }

  const parts = input.split(INPUT_SPLIT_PATTERN);
  const items: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      items.push(trimmed);
    }
  }

  return {
    items,
    total: items.length,
  };
}

export interface DeduplicateResult {
  uniqueItems: string[];
  total: number;
  duplicatesRemoved: number;
}

export function deduplicateIds(input: string): DeduplicateResult {
  const { items, total } = parseIds(input);
  const uniqueItems = Array.from(new Set(items));

  return {
    uniqueItems,
    total,
    duplicatesRemoved: total - uniqueItems.length,
  };
}

export interface ComparisonResult {
  intersection: string[];
  onlyInA: string[];
  onlyInB: string[];
  countA: number;
  countB: number;
}

export function compareLists(listA: string, listB: string): ComparisonResult {
  const parsedA = parseIds(listA).items;
  const parsedB = parseIds(listB).items;

  const uniqueA = Array.from(new Set(parsedA));
  const uniqueB = Array.from(new Set(parsedB));
  const setB = new Set(uniqueB);
  const setA = new Set(uniqueA);

  const intersection = uniqueA.filter((item) => setB.has(item));
  const onlyInA = uniqueA.filter((item) => !setB.has(item));
  const onlyInB = uniqueB.filter((item) => !setA.has(item));

  return {
    intersection,
    onlyInA,
    onlyInB,
    countA: uniqueA.length,
    countB: uniqueB.length,
  };
}

export interface ChunkItem {
  id: string;
  items: string[];
}

export function chunkIds(input: string, chunkSize: number): ChunkItem[] {
  const { items } = parseIds(input);
  const normalizedChunkSize = Number.isFinite(chunkSize) && chunkSize > 0 ? Math.floor(chunkSize) : DEFAULT_CHUNK_SIZE;

  if (!items.length) {
    return [];
  }

  const chunks: ChunkItem[] = [];

  for (let index = 0; index < items.length; index += normalizedChunkSize) {
    const slice = items.slice(index, index + normalizedChunkSize);
    chunks.push({
      id: `chunk-${index / normalizedChunkSize + 1}`,
      items: slice,
    });
  }

  return chunks;
}

export function formatOutput(items: string[], separator: OutputSeparator) {
  return items.join(separator);
}

export function clampChunkSize(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_CHUNK_SIZE;
  }

  return Math.max(1, Math.floor(value));
}
