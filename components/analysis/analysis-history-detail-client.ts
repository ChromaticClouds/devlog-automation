import type { AnalysisDetail } from "@/lib/analysis/history";

const FALLBACK_ERROR_MESSAGE = "Analysis history request failed.";

export type FetchAnalysisDetailClient = (
  id: string,
) => Promise<AnalysisDetail>;

function hasOnlyKeys(value: object, keys: string[]): boolean {
  const actualKeys = Object.keys(value);

  return (
    actualKeys.length === keys.length &&
    keys.every((key) => actualKeys.includes(key))
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRepository(value: unknown): value is AnalysisDetail["repository"] {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    hasOnlyKeys(value, ["owner", "name", "url"]) &&
    typeof Reflect.get(value, "owner") === "string" &&
    typeof Reflect.get(value, "name") === "string" &&
    typeof Reflect.get(value, "url") === "string"
  );
}

function isAnalysisResult(value: unknown): value is AnalysisDetail["result"] {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    hasOnlyKeys(value, [
      "summary",
      "technicalHighlights",
      "portfolioBullets",
      "nextTasks",
      "risks",
      "markdown",
    ]) &&
    typeof Reflect.get(value, "summary") === "string" &&
    isStringArray(Reflect.get(value, "technicalHighlights")) &&
    isStringArray(Reflect.get(value, "portfolioBullets")) &&
    isStringArray(Reflect.get(value, "nextTasks")) &&
    isStringArray(Reflect.get(value, "risks")) &&
    typeof Reflect.get(value, "markdown") === "string"
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

export function validateAnalysisDetail(value: unknown): AnalysisDetail {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  const id = Reflect.get(value, "id");
  const createdAt = Reflect.get(value, "createdAt");

  if (
    !hasOnlyKeys(value, ["id", "repository", "result", "createdAt"]) ||
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    !isRepository(Reflect.get(value, "repository")) ||
    !isAnalysisResult(Reflect.get(value, "result")) ||
    typeof createdAt !== "string" ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  return value as AnalysisDetail;
}

export async function fetchAnalysisDetail(
  id: string,
): Promise<AnalysisDetail> {
  let response: Response;

  try {
    response = await fetch(`/api/analyses/${encodeURIComponent(id)}`);
  } catch {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getSafeErrorMessage(body));
  }

  return validateAnalysisDetail(body);
}
