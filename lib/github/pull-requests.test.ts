import { beforeEach, describe, expect, it, vi } from "vitest";

import { GitHubClientError, requestGitHub } from "./client";
import { fetchRecentPullRequests } from "./pull-requests";

vi.mock("./client", async (importOriginal) => {
  const original = await importOriginal<typeof import("./client")>();

  return {
    ...original,
    requestGitHub: vi.fn(),
  };
});

const repository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
};

const pullRequestResponse = {
  number: 4,
  title: "feat(github): fetch recent pull requests",
  state: "open",
  user: { login: "ChromaticClouds" },
  created_at: "2026-06-06T07:50:00Z",
  updated_at: "2026-06-06T08:00:00Z",
  merged_at: null,
  html_url: "https://github.com/ChromaticClouds/devlog-automation/pull/4",
};

beforeEach(() => {
  vi.mocked(requestGitHub).mockReset();
});

describe("fetchRecentPullRequests", () => {
  it("fetches and normalizes open, closed, and merged pull requests", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([
      pullRequestResponse,
      {
        ...pullRequestResponse,
        number: 3,
        title: "feat(github): fetch recent repository commits",
        state: "closed",
        merged_at: "2026-06-06T07:45:29Z",
      },
      {
        ...pullRequestResponse,
        number: 2,
        title: "closed without merging",
        state: "closed",
      },
      {
        ...pullRequestResponse,
        number: 1,
        title: "pull request by a deleted user",
        user: null,
      },
    ]);

    await expect(fetchRecentPullRequests(repository, 5)).resolves.toEqual([
      {
        number: 4,
        title: "feat(github): fetch recent pull requests",
        state: "open",
        authorLogin: "ChromaticClouds",
        createdAt: "2026-06-06T07:50:00Z",
        updatedAt: "2026-06-06T08:00:00Z",
        mergedAt: null,
        url: "https://github.com/ChromaticClouds/devlog-automation/pull/4",
      },
      {
        number: 3,
        title: "feat(github): fetch recent repository commits",
        state: "closed",
        authorLogin: "ChromaticClouds",
        createdAt: "2026-06-06T07:50:00Z",
        updatedAt: "2026-06-06T08:00:00Z",
        mergedAt: "2026-06-06T07:45:29Z",
        url: "https://github.com/ChromaticClouds/devlog-automation/pull/4",
      },
      {
        number: 2,
        title: "closed without merging",
        state: "closed",
        authorLogin: "ChromaticClouds",
        createdAt: "2026-06-06T07:50:00Z",
        updatedAt: "2026-06-06T08:00:00Z",
        mergedAt: null,
        url: "https://github.com/ChromaticClouds/devlog-automation/pull/4",
      },
      {
        number: 1,
        title: "pull request by a deleted user",
        state: "open",
        authorLogin: null,
        createdAt: "2026-06-06T07:50:00Z",
        updatedAt: "2026-06-06T08:00:00Z",
        mergedAt: null,
        url: "https://github.com/ChromaticClouds/devlog-automation/pull/4",
      },
    ]);
  });

  it("requests all pull requests ordered by most recently updated", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([]);

    await expect(fetchRecentPullRequests(repository, 25)).resolves.toEqual([]);
    expect(requestGitHub).toHaveBeenCalledWith(
      "repos/ChromaticClouds/devlog-automation/pulls?state=all&sort=updated&direction=desc&per_page=25",
    );
  });

  it("uses the default result limit", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([]);

    await fetchRecentPullRequests(repository);

    expect(requestGitHub).toHaveBeenCalledWith(expect.stringContaining("per_page=10"));
  });

  it.each([0, 101, 1.5, Number.NaN])("rejects invalid limit %s", async (limit) => {
    await expect(
      fetchRecentPullRequests(repository, limit),
    ).rejects.toBeInstanceOf(RangeError);
    expect(requestGitHub).not.toHaveBeenCalled();
  });

  it.each([
    { pullRequests: {} },
    [{ ...pullRequestResponse, number: "4" }],
    [{ ...pullRequestResponse, state: "merged" }],
    [{ ...pullRequestResponse, user: { login: 123 } }],
    [{ ...pullRequestResponse, merged_at: 123 }],
  ])("rejects malformed provider response %#", async (response) => {
    vi.mocked(requestGitHub).mockResolvedValue(response);

    await expect(fetchRecentPullRequests(repository)).rejects.toMatchObject({
      name: "GitHubClientError",
      category: "provider_error",
      message: "GitHub request failed.",
    });
  });

  it("preserves errors from the shared GitHub client", async () => {
    const error = new GitHubClientError("rate_limited", 403);
    vi.mocked(requestGitHub).mockRejectedValue(error);

    await expect(fetchRecentPullRequests(repository)).rejects.toBe(error);
  });
});
