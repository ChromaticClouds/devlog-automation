import { describe, expect, it, vi } from "vitest";

import { config } from "../../config";
import type { GeminiClient } from "../gemini";
import type { NormalizedGitHubActivity } from "./activity";
import {
  buildGeminiAnalysisPrompt,
  GeminiAnalysisError,
  sendActivityToGemini,
} from "./gemini";

const activity: NormalizedGitHubActivity = {
  repository: {
    owner: "ChromaticClouds",
    name: "devlog-automation",
    url: "https://github.com/ChromaticClouds/devlog-automation",
  },
  stats: {
    commitCount: 1,
    pullRequestCount: 1,
    openPullRequestCount: 0,
    closedPullRequestCount: 1,
    mergedPullRequestCount: 1,
    issueCount: 1,
    openIssueCount: 1,
    closedIssueCount: 0,
    scriptCount: 1,
    dependencyCount: 1,
    devDependencyCount: 1,
  },
  commits: [
    {
      sha: "abc123",
      message: "feat(analysis): normalize github activity",
      authorName: "ChromaticClouds",
      committedAt: "2026-06-06T10:00:00Z",
      url: "https://github.com/commit/abc123",
    },
  ],
  pullRequests: [
    {
      number: 13,
      title: "feat(analysis): normalize github activity",
      state: "closed",
      isMerged: true,
      authorLogin: "ChromaticClouds",
      createdAt: "2026-06-06T10:00:00Z",
      updatedAt: "2026-06-06T17:47:49Z",
      mergedAt: "2026-06-06T17:47:49Z",
      url: "https://github.com/pull/13",
    },
  ],
  issues: [
    {
      number: 14,
      title: "feat(analysis): send activity to gemini",
      state: "open",
      authorLogin: "ChromaticClouds",
      labels: ["feature"],
      createdAt: "2026-06-06T17:50:00Z",
      updatedAt: "2026-06-06T17:50:00Z",
      closedAt: null,
      url: "https://github.com/issues/14",
    },
  ],
  readme: {
    path: "README.md",
    excerpt: "DevLog Automator",
    url: "https://github.com/blob/main/README.md",
    isTruncated: false,
  },
  packageMetadata: {
    name: "devlog-automator",
    version: "0.1.0",
    description: "Automates development logs.",
    packageManager: "pnpm@11",
    engineConstraints: [{ name: "node", constraint: ">=20" }],
    scriptNames: ["test:unit"],
    dependencyNames: ["@google/genai"],
    devDependencyNames: ["vitest"],
  },
};

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
    expect(prompt).toContain('"summary"');
    expect(prompt).toContain('"technicalHighlights"');
    expect(prompt).toContain('"portfolioBullets"');
    expect(prompt).toContain('"nextTasks"');
    expect(prompt).toContain('"risks"');
    expect(prompt).toContain('"markdown"');
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

    await expect(
      sendActivityToGemini(activity, { apiKey: "", client }),
    ).rejects.toMatchObject<GeminiAnalysisError>({
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

    await expect(request).rejects.toMatchObject<GeminiAnalysisError>({
      category: "provider_error",
      message: "Gemini analysis request failed.",
    });
    await expect(request).rejects.not.toThrow(rawMessage);
  });
});
