import { beforeEach, describe, expect, it, vi } from "vitest";

import { GitHubClientError, requestGitHub } from "./client";
import { fetchRepositoryReadme } from "./readme";

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

const readmeResponse = {
  path: "README.md",
  content: Buffer.from("# DevLog Automator\n\nCollect GitHub activity.").toString(
    "base64",
  ),
  encoding: "base64",
  html_url: "https://github.com/ChromaticClouds/devlog-automation/blob/main/README.md",
};

beforeEach(() => {
  vi.mocked(requestGitHub).mockReset();
});

describe("fetchRepositoryReadme", () => {
  it("fetches and normalizes a Base64 README", async () => {
    vi.mocked(requestGitHub).mockResolvedValue(readmeResponse);

    await expect(fetchRepositoryReadme(repository)).resolves.toEqual({
      path: "README.md",
      content: "# DevLog Automator\n\nCollect GitHub activity.",
      url: "https://github.com/ChromaticClouds/devlog-automation/blob/main/README.md",
    });
    expect(requestGitHub).toHaveBeenCalledWith(
      "repos/ChromaticClouds/devlog-automation/readme",
    );
  });

  it("decodes Base64 content containing GitHub-inserted line breaks", async () => {
    const content = Buffer.from("line one\nline two\n").toString("base64");
    vi.mocked(requestGitHub).mockResolvedValue({
      ...readmeResponse,
      content: `${content.slice(0, 8)}\n${content.slice(8, 16)}\r\n${content.slice(16)}`,
    });

    await expect(fetchRepositoryReadme(repository)).resolves.toMatchObject({
      content: "line one\nline two\n",
    });
  });

  it("accepts an empty README", async () => {
    vi.mocked(requestGitHub).mockResolvedValue({
      ...readmeResponse,
      content: "",
    });

    await expect(fetchRepositoryReadme(repository)).resolves.toMatchObject({
      content: "",
    });
  });

  it("URL-encodes repository identity in the request path", async () => {
    vi.mocked(requestGitHub).mockResolvedValue(readmeResponse);

    await fetchRepositoryReadme({
      owner: "owner name",
      name: "repository/name",
    });

    expect(requestGitHub).toHaveBeenCalledWith(
      "repos/owner%20name/repository%2Fname/readme",
    );
  });

  it("returns null when the default README is not found", async () => {
    vi.mocked(requestGitHub).mockRejectedValue(
      new GitHubClientError("not_found", 404),
    );

    await expect(fetchRepositoryReadme(repository)).resolves.toBeNull();
  });

  it.each([
    { content: readmeResponse.content },
    { ...readmeResponse, path: 123 },
    { ...readmeResponse, content: 123 },
    { ...readmeResponse, encoding: "utf-8" },
    { ...readmeResponse, html_url: null },
    { ...readmeResponse, content: "not valid base64" },
  ])("rejects malformed or unsupported provider response %#", async (response) => {
    vi.mocked(requestGitHub).mockResolvedValue(response);

    await expect(fetchRepositoryReadme(repository)).rejects.toMatchObject({
      name: "GitHubClientError",
      category: "provider_error",
      message: "GitHub request failed.",
    });
  });

  it.each([
    new GitHubClientError("rate_limited", 403),
    new GitHubClientError("provider_error", 503),
  ])("preserves non-not-found GitHub client errors", async (error) => {
    vi.mocked(requestGitHub).mockRejectedValue(error);

    await expect(fetchRepositoryReadme(repository)).rejects.toBe(error);
  });

  it("translates unexpected failures into a safe provider error", async () => {
    vi.mocked(requestGitHub).mockRejectedValue(
      new Error("raw provider details"),
    );

    await expect(fetchRepositoryReadme(repository)).rejects.toMatchObject({
      name: "GitHubClientError",
      category: "provider_error",
      message: "GitHub request failed.",
    });
  });
});
