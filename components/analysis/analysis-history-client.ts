import type { AnalysisHistoryItem } from "../../lib/analysis/history";

const FALLBACK_ERROR_MESSAGE = "Analysis history request failed.";

export type FetchAnalysisHistoryClient = () => Promise<AnalysisHistoryItem[]>;

function isHistoryItem(value: unknown): value is AnalysisHistoryItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const id = Reflect.get(value, "id");
  const createdAt = Reflect.get(value, "createdAt");

  return (
    typeof id === "number" &&
    Number.isSafeInteger(id) &&
    id > 0 &&
    typeof Reflect.get(value, "repositoryName") === "string" &&
    typeof Reflect.get(value, "repositoryUrl") === "string" &&
    typeof Reflect.get(value, "summary") === "string" &&
    typeof createdAt === "string" &&
    !Number.isNaN(Date.parse(createdAt))
  );
}

function isHistoryResponse(
  value: unknown,
): value is { items: AnalysisHistoryItem[] } {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    Array.isArray(Reflect.get(value, "items")) &&
    Reflect.get(value, "items").every(isHistoryItem)
  );
}

function getSafeErrorMessage(value: unknown): string {
  return (
    value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "message") === "string"
      ? Reflect.get(value, "message")
      : FALLBACK_ERROR_MESSAGE
  );
}

export function validateAnalysisHistoryItems(
  value: unknown,
): AnalysisHistoryItem[] {
  if (!Array.isArray(value) || !value.every(isHistoryItem)) {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  return value;
}

export async function fetchAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
  const response = await fetch("/api/analyses");
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getSafeErrorMessage(body));
  }

  if (!isHistoryResponse(body)) {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  return body.items;
}
