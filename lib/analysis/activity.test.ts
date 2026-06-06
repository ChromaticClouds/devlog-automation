import { describe, expect, it } from "vitest";

import {
  MAX_COMMIT_AUTHOR_LENGTH,
  MAX_COMMIT_MESSAGE_LENGTH,
  MAX_ISSUE_LABELS,
  MAX_NORMALIZED_COMMITS,
  MAX_NORMALIZED_ISSUES,
  MAX_NORMALIZED_PULL_REQUESTS,
  MAX_PACKAGE_COLLECTION_ITEMS,
  MAX_PACKAGE_DESCRIPTION_LENGTH,
  MAX_PACKAGE_ENTRY_LENGTH,
  MAX_README_EXCERPT_LENGTH,
  normalizeGitHubActivity,
} from "./activity";

const repository = {
  owner: " ChromaticClouds ",
  name: " devlog-automation ",
  url: " https://github.com/ChromaticClouds/devlog-automation ",
};

describe("normalizeGitHubActivity", () => {
  it("normalizes mixed GitHub activity into a bounded analysis input", () => {
    const activity = normalizeGitHubActivity({
      repository,
      commits: [
        {
          sha: " abc123 ",
          message: " feat: collect activity ",
          authorName: " ChromaticClouds ",
          committedAt: " 2026-06-06T08:00:00Z ",
          url: " https://github.com/commit/abc123 ",
        },
        {
          sha: "ignored",
          message: "   ",
          authorName: "ChromaticClouds",
          committedAt: "2026-06-06T08:01:00Z",
          url: "https://github.com/commit/ignored",
        },
      ],
      pullRequests: [
        {
          number: 5,
          title: " feat(github): fetch pull requests ",
          state: "closed",
          authorLogin: " ChromaticClouds ",
          createdAt: " 2026-06-06T07:00:00Z ",
          updatedAt: " 2026-06-06T07:30:00Z ",
          mergedAt: " 2026-06-06T07:45:00Z ",
          url: " https://github.com/pull/5 ",
        },
        {
          number: 7,
          title: " feat(github): fetch issues ",
          state: "open",
          authorLogin: null,
          createdAt: " 2026-06-06T08:00:00Z ",
          updatedAt: " 2026-06-06T08:30:00Z ",
          mergedAt: null,
          url: " https://github.com/pull/7 ",
        },
        {
          number: 8,
          title: " closed but not merged ",
          state: "closed",
          authorLogin: " ChromaticClouds ",
          createdAt: " 2026-06-06T08:00:00Z ",
          updatedAt: " 2026-06-06T08:30:00Z ",
          mergedAt: "   ",
          url: " https://github.com/pull/8 ",
        },
      ],
      issues: [
        {
          number: 12,
          title: " feat(analysis): normalize github activity ",
          state: "open",
          authorLogin: " ChromaticClouds ",
          labels: [" feature ", "", " analysis ", "x".repeat(MAX_PACKAGE_ENTRY_LENGTH + 1)],
          createdAt: " 2026-06-06T10:00:00Z ",
          updatedAt: " 2026-06-06T10:15:00Z ",
          closedAt: null,
          url: " https://github.com/issues/12 ",
        },
        {
          number: 1,
          title: " closed task ",
          state: "closed",
          authorLogin: null,
          labels: [],
          createdAt: " 2026-06-01T10:00:00Z ",
          updatedAt: " 2026-06-02T10:00:00Z ",
          closedAt: " 2026-06-02T10:00:00Z ",
          url: " https://github.com/issues/1 ",
        },
      ],
      readme: {
        path: " README.md ",
        content: ` ${"a".repeat(MAX_README_EXCERPT_LENGTH + 10)} `,
        url: " https://github.com/blob/main/README.md ",
      },
      packageMetadata: {
        name: " devlog-automator ",
        version: " 0.1.0 ",
        description: "   ",
        packageManager: " pnpm@11 ",
        engineConstraints: [
          { name: " node ", constraint: " >=20 " },
          { name: " invalid ", constraint: " " },
        ],
        scriptNames: [" build ", "", " test:unit "],
        dependencyNames: [" next ", " react "],
        devDependencyNames: [" vitest "],
      },
    });

    expect(activity).toMatchObject({
      repository: {
        owner: "ChromaticClouds",
        name: "devlog-automation",
        url: "https://github.com/ChromaticClouds/devlog-automation",
      },
      stats: {
        commitCount: 1,
        pullRequestCount: 3,
        openPullRequestCount: 1,
        closedPullRequestCount: 2,
        mergedPullRequestCount: 1,
        issueCount: 2,
        openIssueCount: 1,
        closedIssueCount: 1,
        scriptCount: 2,
        dependencyCount: 2,
        devDependencyCount: 1,
      },
      commits: [
        {
          sha: "abc123",
          message: "feat: collect activity",
          authorName: "ChromaticClouds",
          committedAt: "2026-06-06T08:00:00Z",
          url: "https://github.com/commit/abc123",
        },
      ],
      pullRequests: [
        {
          number: 5,
          title: "feat(github): fetch pull requests",
          state: "closed",
          isMerged: true,
          authorLogin: "ChromaticClouds",
          mergedAt: "2026-06-06T07:45:00Z",
        },
        {
          number: 7,
          state: "open",
          isMerged: false,
          authorLogin: null,
          mergedAt: null,
        },
        {
          number: 8,
          state: "closed",
          isMerged: false,
          mergedAt: null,
        },
      ],
      issues: [
        {
          number: 12,
          title: "feat(analysis): normalize github activity",
          labels: ["feature", "analysis", "x".repeat(MAX_PACKAGE_ENTRY_LENGTH)],
          closedAt: null,
        },
        {
          number: 1,
          state: "closed",
          authorLogin: null,
          closedAt: "2026-06-02T10:00:00Z",
        },
      ],
      readme: {
        path: "README.md",
        isTruncated: true,
        url: "https://github.com/blob/main/README.md",
      },
      packageMetadata: {
        name: "devlog-automator",
        version: "0.1.0",
        description: null,
        packageManager: "pnpm@11",
        engineConstraints: [{ name: "node", constraint: ">=20" }],
        scriptNames: ["build", "test:unit"],
        dependencyNames: ["next", "react"],
        devDependencyNames: ["vitest"],
      },
    });
    expect(activity.readme?.excerpt).toHaveLength(MAX_README_EXCERPT_LENGTH);
  });

  it("represents missing optional README and package metadata explicitly", () => {
    const activity = normalizeGitHubActivity({
      repository,
      commits: [],
      pullRequests: [],
      issues: [],
      readme: null,
      packageMetadata: null,
    });

    expect(activity.readme).toBeNull();
    expect(activity.packageMetadata).toBeNull();
    expect(activity.stats).toEqual({
      commitCount: 0,
      pullRequestCount: 0,
      openPullRequestCount: 0,
      closedPullRequestCount: 0,
      mergedPullRequestCount: 0,
      issueCount: 0,
      openIssueCount: 0,
      closedIssueCount: 0,
      scriptCount: 0,
      dependencyCount: 0,
      devDependencyCount: 0,
    });
  });

  it("caps prompt-facing collections with documented limits", () => {
    const activity = normalizeGitHubActivity({
      repository,
      commits: Array.from({ length: MAX_NORMALIZED_COMMITS + 1 }, (_, index) => ({
        sha: `sha-${index}`,
        message: `commit ${index}`,
        authorName: "author",
        committedAt: "2026-06-06T08:00:00Z",
        url: `https://github.com/commit/${index}`,
      })),
      pullRequests: Array.from(
        { length: MAX_NORMALIZED_PULL_REQUESTS + 1 },
        (_, index) => ({
          number: index,
          title: `pull request ${index}`,
          state: "open",
          authorLogin: null,
          createdAt: "2026-06-06T08:00:00Z",
          updatedAt: "2026-06-06T08:00:00Z",
          mergedAt: null,
          url: `https://github.com/pull/${index}`,
        }),
      ),
      issues: Array.from({ length: MAX_NORMALIZED_ISSUES + 1 }, (_, index) => ({
        number: index,
        title: `issue ${index}`,
        state: "open",
        authorLogin: null,
        labels: [],
        createdAt: "2026-06-06T08:00:00Z",
        updatedAt: "2026-06-06T08:00:00Z",
        closedAt: null,
        url: `https://github.com/issues/${index}`,
      })),
      readme: null,
      packageMetadata: null,
    });

    expect(activity.commits).toHaveLength(MAX_NORMALIZED_COMMITS);
    expect(activity.pullRequests).toHaveLength(MAX_NORMALIZED_PULL_REQUESTS);
    expect(activity.issues).toHaveLength(MAX_NORMALIZED_ISSUES);
    expect(activity.stats.commitCount).toBe(MAX_NORMALIZED_COMMITS);
    expect(activity.stats.pullRequestCount).toBe(MAX_NORMALIZED_PULL_REQUESTS);
    expect(activity.stats.issueCount).toBe(MAX_NORMALIZED_ISSUES);
  });

  it("caps prompt-facing package metadata collections and text fields", () => {
    const activity = normalizeGitHubActivity({
      repository,
      commits: [
        {
          sha: "abc",
          message: "m".repeat(MAX_COMMIT_MESSAGE_LENGTH + 10),
          authorName: "a".repeat(MAX_COMMIT_AUTHOR_LENGTH + 10),
          committedAt: "2026-06-06T08:00:00Z",
          url: "https://github.com/commit/abc",
        },
      ],
      pullRequests: [],
      issues: [],
      readme: null,
      packageMetadata: {
        name: "repo",
        version: "1.0.0",
        description: "d".repeat(MAX_PACKAGE_DESCRIPTION_LENGTH + 10),
        packageManager: "pnpm@11",
        engineConstraints: Array.from(
          { length: MAX_PACKAGE_COLLECTION_ITEMS + 1 },
          (_, index) => ({
            name: `${"engine".repeat(30)}-${index}`,
            constraint: `${">=1".repeat(50)}-${index}`,
          }),
        ),
        scriptNames: Array.from(
          { length: MAX_PACKAGE_COLLECTION_ITEMS + 1 },
          (_, index) => `${"script".repeat(30)}-${index}`,
        ),
        dependencyNames: Array.from(
          { length: MAX_PACKAGE_COLLECTION_ITEMS + 1 },
          (_, index) => `${"dependency".repeat(30)}-${index}`,
        ),
        devDependencyNames: Array.from(
          { length: MAX_PACKAGE_COLLECTION_ITEMS + 1 },
          (_, index) => `${"dev-dependency".repeat(30)}-${index}`,
        ),
      },
    });

    expect(activity.commits[0].message).toHaveLength(MAX_COMMIT_MESSAGE_LENGTH);
    expect(activity.commits[0].authorName).toHaveLength(
      MAX_COMMIT_AUTHOR_LENGTH,
    );
    expect(activity.packageMetadata?.description).toHaveLength(
      MAX_PACKAGE_DESCRIPTION_LENGTH,
    );
    expect(activity.packageMetadata?.engineConstraints).toHaveLength(
      MAX_PACKAGE_COLLECTION_ITEMS,
    );
    expect(activity.packageMetadata?.scriptNames).toHaveLength(
      MAX_PACKAGE_COLLECTION_ITEMS,
    );
    expect(activity.packageMetadata?.dependencyNames).toHaveLength(
      MAX_PACKAGE_COLLECTION_ITEMS,
    );
    expect(activity.packageMetadata?.devDependencyNames).toHaveLength(
      MAX_PACKAGE_COLLECTION_ITEMS,
    );
    expect(activity.stats.scriptCount).toBe(MAX_PACKAGE_COLLECTION_ITEMS);
    expect(activity.stats.dependencyCount).toBe(MAX_PACKAGE_COLLECTION_ITEMS);
    expect(activity.stats.devDependencyCount).toBe(MAX_PACKAGE_COLLECTION_ITEMS);
    expect(activity.packageMetadata?.engineConstraints[0].name).toHaveLength(
      MAX_PACKAGE_ENTRY_LENGTH,
    );
    expect(
      activity.packageMetadata?.engineConstraints[0].constraint,
    ).toHaveLength(MAX_PACKAGE_ENTRY_LENGTH);
    expect(activity.packageMetadata?.scriptNames[0]).toHaveLength(
      MAX_PACKAGE_ENTRY_LENGTH,
    );
    expect(activity.packageMetadata?.dependencyNames[0]).toHaveLength(
      MAX_PACKAGE_ENTRY_LENGTH,
    );
    expect(activity.packageMetadata?.devDependencyNames[0]).toHaveLength(
      MAX_PACKAGE_ENTRY_LENGTH,
    );
  });

  it("caps issue labels per issue", () => {
    const activity = normalizeGitHubActivity({
      repository,
      commits: [],
      pullRequests: [],
      issues: [
        {
          number: 1,
          title: "issue",
          state: "open",
          authorLogin: null,
          labels: Array.from({ length: MAX_ISSUE_LABELS + 1 }, (_, index) =>
            `${"label".repeat(30)}-${index}`,
          ),
          createdAt: "2026-06-06T08:00:00Z",
          updatedAt: "2026-06-06T08:00:00Z",
          closedAt: null,
          url: "https://github.com/issues/1",
        },
      ],
      readme: null,
      packageMetadata: null,
    });

    expect(activity.issues[0].labels).toHaveLength(MAX_ISSUE_LABELS);
    expect(activity.issues[0].labels[0]).toHaveLength(MAX_PACKAGE_ENTRY_LENGTH);
  });

  it("does not expose provider-specific raw response fields", () => {
    const activity = normalizeGitHubActivity({
      repository,
      commits: [
        {
          sha: "abc",
          message: "message",
          authorName: "author",
          committedAt: "2026-06-06T08:00:00Z",
          url: "https://github.com/commit/abc",
          html_url: "raw provider field",
        } as never,
      ],
      pullRequests: [],
      issues: [],
      readme: null,
      packageMetadata: null,
    });

    expect(JSON.stringify(activity)).not.toContain("html_url");
    expect(JSON.stringify(activity)).not.toContain("raw provider field");
  });
});
