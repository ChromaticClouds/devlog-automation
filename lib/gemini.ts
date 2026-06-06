import { config } from "@/config";
import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});
