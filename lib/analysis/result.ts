import { z } from "zod";

export const MAX_ANALYSIS_SUMMARY_LENGTH = 2000;
export const MAX_ANALYSIS_MARKDOWN_LENGTH = 10000;
export const MAX_ANALYSIS_LIST_ITEMS = 10;
export const MAX_ANALYSIS_LIST_ITEM_LENGTH = 500;

export class AnalysisResultValidationError extends Error {
  constructor() {
    super("Gemini analysis result is invalid.");
    this.name = "AnalysisResultValidationError";
  }
}

function boundedText(maxLength: number) {
  return z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.slice(0, maxLength));
}

const boundedList = z
  .array(boundedText(MAX_ANALYSIS_LIST_ITEM_LENGTH))
  .transform((values) => values.slice(0, MAX_ANALYSIS_LIST_ITEMS));

const analysisResultSchema = z
  .object({
    summary: boundedText(MAX_ANALYSIS_SUMMARY_LENGTH),
    technicalHighlights: boundedList,
    portfolioBullets: boundedList,
    nextTasks: boundedList,
    risks: boundedList,
    markdown: boundedText(MAX_ANALYSIS_MARKDOWN_LENGTH),
  })
  .strict();

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export function parseAnalysisResult(rawText: string): AnalysisResult {
  try {
    return analysisResultSchema.parse(JSON.parse(rawText));
  } catch {
    throw new AnalysisResultValidationError();
  }
}
