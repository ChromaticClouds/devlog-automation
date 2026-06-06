import type { NormalizedGitHubActivity } from "./activity";

export const geminiActivityFixture: NormalizedGitHubActivity = {
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
