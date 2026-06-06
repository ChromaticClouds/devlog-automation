import { config } from "../../config";
import {
  createGeminiClient,
  type GeminiClient,
  type GeminiGenerateContentRequest,
} from "../gemini";
import type { NormalizedGitHubActivity } from "./activity";

export type GeminiAnalysisErrorCategory =
  | "configuration_error"
  | "provider_error";

export class GeminiAnalysisError extends Error {
  readonly category: GeminiAnalysisErrorCategory;

  constructor(category: GeminiAnalysisErrorCategory) {
    super(getErrorMessage(category));
    this.name = "GeminiAnalysisError";
    this.category = category;
  }
}

export type SendActivityToGeminiOptions = {
  apiKey?: string;
  model?: string;
  client?: GeminiClient;
};

function getErrorMessage(category: GeminiAnalysisErrorCategory): string {
  switch (category) {
    case "configuration_error":
      return "Gemini API configuration is missing.";
    case "provider_error":
      return "Gemini analysis request failed.";
  }
}

export function buildGeminiAnalysisPrompt(
  activity: NormalizedGitHubActivity,
): string {
  const expectedOutput = {
    summary: "string",
    technicalHighlights: ["string"],
    portfolioBullets: ["string"],
    nextTasks: ["string"],
    risks: ["string"],
    markdown: "string",
  };

  return [
    "Analyze the normalized GitHub repository activity below.",
    "Return only valid JSON. Do not include Markdown fences or commentary.",
    "Use only the provided activity. Do not invent missing facts.",
    "The JSON response must match this field shape:",
    JSON.stringify(expectedOutput, null, 2),
    "Normalized GitHub activity:",
    JSON.stringify(activity, null, 2),
  ].join("\n\n");
}

function getRequest(
  activity: NormalizedGitHubActivity,
  model: string,
): GeminiGenerateContentRequest {
  return {
    model,
    contents: buildGeminiAnalysisPrompt(activity),
  };
}

export async function sendActivityToGemini(
  activity: NormalizedGitHubActivity,
  options: SendActivityToGeminiOptions = {},
): Promise<string> {
  const apiKey =
    options.apiKey === undefined ? config.GEMINI_API_KEY : options.apiKey;

  if (!apiKey?.trim()) {
    throw new GeminiAnalysisError("configuration_error");
  }

  const model = options.model?.trim() || config.GEMINI_MODEL;

  try {
    const client = options.client ?? createGeminiClient(apiKey);
    const response = await client.generateContent(getRequest(activity, model));

    if (!response.text) {
      throw new GeminiAnalysisError("provider_error");
    }

    return response.text;
  } catch (error) {
    if (error instanceof GeminiAnalysisError) {
      throw error;
    }

    throw new GeminiAnalysisError("provider_error");
  }
}
