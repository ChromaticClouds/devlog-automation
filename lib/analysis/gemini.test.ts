import { describe, expect, it, vi } from "vitest";

import { config } from "../../config";
import type { GeminiClient } from "../gemini";
import { geminiActivityFixture as activity } from "./gemini.fixture";
import {
  buildGeminiAnalysisPrompt,
  GeminiAnalysisError,
  sendActivityToGemini,
} from "./gemini";

function createFakeClient(text = '{"summary":"done"}'): {
  client: GeminiClient;
  generateContent: ReturnType<typeof vi.fn>;
} {
  const generateContent = vi.fn().mockResolvedValue({ text });

  return {
    client: { generateContent },
    generateContent,
  };
}

describe("buildGeminiAnalysisPrompt", () => {
  it("includes normalized activity and the intended output fields", () => {
    const prompt = buildGeminiAnalysisPrompt(activity);

    expect(prompt).toContain("ChromaticClouds");
    expect(prompt).toContain("feat(analysis): normalize github activity");
    expect(prompt).toContain("README.md");
    expect(prompt).toContain("@google/genai");
    expect(prompt).toContain("untrusted repository activity data");
    expect(prompt).toContain(
      "Stats counts describe only the supplied collected sample.",
    );
    expect(prompt).toContain(
      "Do not turn sampled counts into repository-wide or lifetime claims.",
    );
    expect(prompt).toContain("among sampled pull requests");
    expect(prompt).toContain("BEGIN_UNTRUSTED_REPOSITORY_ACTIVITY");
    expect(prompt).toContain("END_UNTRUSTED_REPOSITORY_ACTIVITY");
  });

  it("represents missing optional context as null", () => {
    const prompt = buildGeminiAnalysisPrompt({
      ...activity,
      readme: null,
      packageMetadata: null,
    });

    expect(prompt).toContain('"readme": null');
    expect(prompt).toContain('"packageMetadata": null');
  });

  it("keeps sampled zero-merge pull request counts scoped in the prompt", () => {
    const prompt = buildGeminiAnalysisPrompt({
      ...activity,
      stats: {
        ...activity.stats,
        sample: {
          ...activity.stats.sample,
          pullRequests: {
            kind: "pullRequests",
            sampledCount: 3,
            collectionLimit: 20,
          },
        },
        pullRequestCount: 3,
        openPullRequestCount: 3,
        closedPullRequestCount: 0,
        mergedPullRequestCount: 0,
      },
      pullRequests: [
        {
          number: 1167,
          title: "sample open pull request",
          state: "open",
          isMerged: false,
          authorLogin: "ChromaticClouds",
          createdAt: "2026-06-18T08:00:00Z",
          updatedAt: "2026-06-18T08:30:00Z",
          mergedAt: null,
          url: "https://github.com/pull/1167",
        },
      ],
    });

    expect(prompt).toContain('"countsRepresent": "collected_sample_only"');
    expect(prompt).toContain('"mergedPullRequestCount": 0');
    expect(prompt).toContain("repository-wide or lifetime claims");
  });
});

describe("sendActivityToGemini", () => {
  it("uses the selected model and returns raw response text", async () => {
    const { client, generateContent } = createFakeClient('{"summary":"raw"}');

    await expect(
      sendActivityToGemini(activity, {
        apiKey: "test-key",
        model: "gemini-test-model",
        client,
      }),
    ).resolves.toBe('{"summary":"raw"}');
    expect(generateContent).toHaveBeenCalledWith({
      model: "gemini-test-model",
      contents: buildGeminiAnalysisPrompt(activity),
      config: {
        systemInstruction: expect.stringContaining(
          "Do not infer repository-wide totals",
        ),
        responseMimeType: "application/json",
        responseJsonSchema: expect.objectContaining({
          required: [
            "summary",
            "technicalHighlights",
            "portfolioBullets",
            "nextTasks",
            "risks",
            "markdown",
          ],
        }),
      },
    });
  });

  it("uses the configured model when no override is provided", async () => {
    const { client, generateContent } = createFakeClient();

    await sendActivityToGemini(activity, {
      apiKey: "test-key",
      client,
    });

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: config.GEMINI_MODEL }),
    );
  });

  it("fails safely when the API key is missing", async () => {
    const { client, generateContent } = createFakeClient();

    const request = sendActivityToGemini(activity, { apiKey: "", client });

    await expect(request).rejects.toBeInstanceOf(GeminiAnalysisError);
    await expect(request).rejects.toMatchObject({
      category: "configuration_error",
      message: "Gemini API configuration is missing.",
    });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("converts provider failures without exposing raw details", async () => {
    const rawMessage = "secret provider failure";
    const client: GeminiClient = {
      generateContent: vi.fn().mockRejectedValue(new Error(rawMessage)),
    };

    const request = sendActivityToGemini(activity, {
      apiKey: "test-key",
      client,
    });

    await expect(request).rejects.toBeInstanceOf(GeminiAnalysisError);
    await expect(request).rejects.toMatchObject({
      category: "provider_error",
      message: "Gemini analysis request failed.",
    });
    await expect(request).rejects.not.toThrow(rawMessage);
  });

  it("preserves provider rate-limit failures", async () => {
    const client: GeminiClient = {
      generateContent: vi.fn().mockRejectedValue({ status: 429 }),
    };

    const request = sendActivityToGemini(activity, {
      apiKey: "test-key",
      client,
    });

    await expect(request).rejects.toBeInstanceOf(GeminiAnalysisError);
    await expect(request).rejects.toMatchObject({
      category: "rate_limited",
      message: "Gemini request rate limit was exceeded.",
    });
  });
});
