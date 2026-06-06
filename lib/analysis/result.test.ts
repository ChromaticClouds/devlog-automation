import type { Prisma } from "../../app/generated/prisma/client";
import { describe, expect, it } from "vitest";

import {
  AnalysisResultValidationError,
  MAX_ANALYSIS_LIST_ITEM_LENGTH,
  MAX_ANALYSIS_LIST_ITEMS,
  MAX_ANALYSIS_MARKDOWN_LENGTH,
  MAX_ANALYSIS_SUMMARY_LENGTH,
  parseAnalysisResult,
  type AnalysisResult,
} from "./result";

const validResult = {
  summary: "Repository activity summary.",
  technicalHighlights: ["Added strict validation."],
  portfolioBullets: ["Implemented a safe LLM trust boundary."],
  nextTasks: ["Persist validated analysis results."],
  risks: ["Model output can be malformed."],
  markdown: "# Development Log",
};

function stringify(value: unknown): string {
  return JSON.stringify(value);
}

describe("parseAnalysisResult", () => {
  it("parses a valid project-owned analysis result", () => {
    const result: AnalysisResult = parseAnalysisResult(stringify(validResult));

    expect(result).toEqual(validResult);
  });

  it("trims and deterministically caps accepted values", () => {
    const result = parseAnalysisResult(
      stringify({
        summary: `  ${"s".repeat(MAX_ANALYSIS_SUMMARY_LENGTH + 1)}  `,
        technicalHighlights: Array.from(
          { length: MAX_ANALYSIS_LIST_ITEMS + 1 },
          (_, index) => `  highlight-${index}-${"h".repeat(MAX_ANALYSIS_LIST_ITEM_LENGTH)}  `,
        ),
        portfolioBullets: ["  portfolio  "],
        nextTasks: ["  next task  "],
        risks: ["  risk  "],
        markdown: `  ${"m".repeat(MAX_ANALYSIS_MARKDOWN_LENGTH + 1)}  `,
      }),
    );

    expect(result.summary).toHaveLength(MAX_ANALYSIS_SUMMARY_LENGTH);
    expect(result.markdown).toHaveLength(MAX_ANALYSIS_MARKDOWN_LENGTH);
    expect(result.technicalHighlights).toHaveLength(MAX_ANALYSIS_LIST_ITEMS);
    expect(result.technicalHighlights[0]).toHaveLength(
      MAX_ANALYSIS_LIST_ITEM_LENGTH,
    );
    expect(result.portfolioBullets).toEqual(["portfolio"]);
    expect(result.nextTasks).toEqual(["next task"]);
    expect(result.risks).toEqual(["risk"]);
  });

  it.each([
    ["malformed JSON", "not-json"],
    ["code-fenced JSON", `\`\`\`json\n${stringify(validResult)}\n\`\`\``],
    ["non-object root", stringify(["not", "an", "object"])],
    ["missing field", stringify({ ...validResult, summary: undefined })],
    ["extra field", stringify({ ...validResult, extra: "not allowed" })],
    ["wrong scalar type", stringify({ ...validResult, summary: 123 })],
    [
      "wrong array type",
      stringify({ ...validResult, technicalHighlights: "not an array" }),
    ],
    ["empty scalar", stringify({ ...validResult, summary: "   " })],
    [
      "empty array item",
      stringify({ ...validResult, technicalHighlights: ["valid", "   "] }),
    ],
  ])("rejects %s", (_, rawText) => {
    expect(() => parseAnalysisResult(rawText)).toThrow(
      AnalysisResultValidationError,
    );
  });

  it("does not expose raw output or parser details in validation errors", () => {
    const sensitiveRawText = '{"summary":"secret-model-output"';

    try {
      parseAnalysisResult(sensitiveRawText);
      throw new Error("Expected parsing to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(AnalysisResultValidationError);
      expect(error).toMatchObject({
        message: "Gemini analysis result is invalid.",
      });
      expect(String(error)).not.toContain("secret-model-output");
      expect(error).not.toHaveProperty("cause");
    }
  });

  it("aligns with the intended Prisma persistence fields", () => {
    const result = parseAnalysisResult(stringify(validResult));
    const persistenceInput: Prisma.AnalysisResultUncheckedCreateInput = {
      repositoryId: 1,
      ...result,
    };

    expect(persistenceInput.summary).toBe(validResult.summary);
    expect(persistenceInput.technicalHighlights).toEqual(
      validResult.technicalHighlights,
    );
  });
});
