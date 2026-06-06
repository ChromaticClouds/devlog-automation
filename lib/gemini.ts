import { GoogleGenAI } from "@google/genai";

export type GeminiGenerateContentRequest = {
  model: string;
  contents: string;
};

export type GeminiGenerateContentResponse = {
  text?: string;
};

export type GeminiClient = {
  generateContent(
    request: GeminiGenerateContentRequest,
  ): Promise<GeminiGenerateContentResponse>;
};

export function createGeminiClient(apiKey: string): GeminiClient {
  const client = new GoogleGenAI({ apiKey });

  return {
    generateContent(request) {
      return client.models.generateContent(request);
    },
  };
}
