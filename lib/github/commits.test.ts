import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../config";
import { GitHubClientError } from "./client";
import { fetchRecentCommits } from "./commits";

const repository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
};

const originalGitHubToken = config.GITHUB_TOKEN;

beforeEach(() => {
  config.GITHUB_TOKEN = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
  config.GITHUB_TOKEN = originalGitHubToken;
});

describe("fetchRecentCommits", () => {
  it("fetches and normalizes recent commits", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            sha: "abc123",
            html_url:
              "https://github.com/ChromaticClouds/devlog-automation/commit/abc123",
            commit: {
              message: "feat: add commit collection",
              author: { name: "Chromatic Clouds" },
              committer: { date: "2026-06-06T08:00:00Z" },
            },
          },
        ]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRecentCommits(repository, 5)).resolves.toEqual([
      {
        sha: "abc123",
        message: "feat: add commit collection",
        authorName: "Chromatic Clouds",
        committedAt: "2026-06-06T08:00:00Z",
        url: "https://github.com/ChromaticClouds/devlog-automation/commit/abc123",
      },
    ]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      "https://api.github.com/repos/ChromaticClouds/devlog-automation/commits?per_page=5",
    );
    const headers = new Headers(init.headers);
    expect(headers.get("Accept")).toBe("application/vnd.github+json");
    expect(headers.get("X-GitHub-Api-Version")).toBe("2022-11-28");
    expect(headers.get("Authorization")).toBeNull();
  });

  it("uses the default limit and returns an empty response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([])),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRecentCommits(repository)).resolves.toEqual([]);
    expect(fetchMock.mock.calls[0][0].searchParams.get("per_page")).toBe("10");
  });

  it.each([0, 101, 1.5, Number.NaN])("rejects invalid limit %s", async (limit) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRecentCommits(repository, limit)).rejects.toBeInstanceOf(
      RangeError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("translates a not found response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "provider details" }), {
          status: 404,
        }),
      ),
    );

    await expect(fetchRecentCommits(repository)).rejects.toMatchObject({
      name: "GitHubClientError",
      category: "not_found",
      status: 404,
      message: "GitHub repository was not found.",
    });
  });

  it("translates a rate limited response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "provider details" }), {
          status: 403,
          headers: { "x-ratelimit-remaining": "0" },
        }),
      ),
    );

    await expect(fetchRecentCommits(repository)).rejects.toMatchObject({
      category: "rate_limited",
      status: 403,
    });
  });

  it("translates unexpected and malformed provider responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("service unavailable", { status: 503 })),
    );

    await expect(fetchRecentCommits(repository)).rejects.toMatchObject({
      category: "provider_error",
      status: 503,
      message: "GitHub request failed.",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ commits: [] }))),
    );

    await expect(fetchRecentCommits(repository)).rejects.toBeInstanceOf(
      GitHubClientError,
    );
  });

  it("sends an optional token without exposing it in errors", async () => {
    const token = "secret-github-token";
    config.GITHUB_TOKEN = token;
    const fetchMock = vi.fn().mockRejectedValue(new Error(`failed: ${token}`));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchRecentCommits(repository);

    await expect(promise).rejects.toMatchObject({
      category: "provider_error",
      message: "GitHub request failed.",
    });
    await expect(promise).rejects.not.toThrow(token);

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get("Authorization")).toBe(
      `Bearer ${token}`,
    );
  });
});
