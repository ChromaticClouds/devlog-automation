import { beforeEach, describe, expect, it, vi } from "vitest";

import { GitHubClientError, requestGitHub } from "./client";
import { fetchPackageMetadata } from "./package-metadata";

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

function packageFileResponse(manifest: unknown) {
  return {
    content: Buffer.from(JSON.stringify(manifest)).toString("base64"),
    encoding: "base64",
  };
}

beforeEach(() => {
  vi.mocked(requestGitHub).mockReset();
});

describe("fetchPackageMetadata", () => {
  it("fetches and normalizes deterministic package metadata", async () => {
    vi.mocked(requestGitHub).mockResolvedValue(
      packageFileResponse({
        name: "devlog-automator",
        version: "0.1.0",
        description: "Collect GitHub activity.",
        packageManager: "pnpm@11.0.0",
        engines: {
          pnpm: ">=10",
          node: ">=20",
          unsupported: 123,
        },
        scripts: {
          build: "next build",
          dev: "next dev",
          ignored: false,
        },
        dependencies: {
          zod: "^4.4.3",
          next: "16.2.7",
        },
        devDependencies: {
          vitest: "^4.1.8",
          eslint: "^9",
        },
      }),
    );

    await expect(fetchPackageMetadata(repository)).resolves.toEqual({
      name: "devlog-automator",
      version: "0.1.0",
      description: "Collect GitHub activity.",
      packageManager: "pnpm@11.0.0",
      engineConstraints: [
        { name: "node", constraint: ">=20" },
        { name: "pnpm", constraint: ">=10" },
      ],
      scriptNames: ["build", "dev"],
      dependencyNames: ["next", "zod"],
      devDependencyNames: ["eslint", "vitest"],
    });
    expect(requestGitHub).toHaveBeenCalledWith(
      "repos/ChromaticClouds/devlog-automation/contents/package.json",
    );
  });

  it("normalizes unsupported manifest field shapes conservatively", async () => {
    vi.mocked(requestGitHub).mockResolvedValue(
      packageFileResponse({
        name: 123,
        version: null,
        description: ["not", "a", "string"],
        packageManager: undefined,
        engines: ">=20",
        scripts: null,
        dependencies: [],
        devDependencies: { vitest: false },
      }),
    );

    await expect(fetchPackageMetadata(repository)).resolves.toEqual({
      name: null,
      version: null,
      description: null,
      packageManager: null,
      engineConstraints: [],
      scriptNames: [],
      dependencyNames: [],
      devDependencyNames: [],
    });
  });

  it("decodes Base64 content containing GitHub-inserted whitespace", async () => {
    const content = Buffer.from(JSON.stringify({ name: "repo" })).toString(
      "base64",
    );
    vi.mocked(requestGitHub).mockResolvedValue({
      content: `${content.slice(0, 4)}\n${content.slice(4, 12)}\r\n${content.slice(12)}`,
      encoding: "base64",
    });

    await expect(fetchPackageMetadata(repository)).resolves.toMatchObject({
      name: "repo",
    });
  });

  it("URL-encodes repository identity in the request path", async () => {
    vi.mocked(requestGitHub).mockResolvedValue(packageFileResponse({}));

    await fetchPackageMetadata({
      owner: "owner name",
      name: "repository/name",
    });

    expect(requestGitHub).toHaveBeenCalledWith(
      "repos/owner%20name/repository%2Fname/contents/package.json",
    );
  });

  it("returns null when root package.json is not found", async () => {
    vi.mocked(requestGitHub).mockRejectedValue(
      new GitHubClientError("not_found", 404),
    );

    await expect(fetchPackageMetadata(repository)).resolves.toBeNull();
  });

  it.each([
    { content: Buffer.from("{}").toString("base64") },
    { content: 123, encoding: "base64" },
    { content: Buffer.from("{}").toString("base64"), encoding: "utf-8" },
    { content: "not valid base64", encoding: "base64" },
    { content: Buffer.from("{").toString("base64"), encoding: "base64" },
    { content: Buffer.from("[]").toString("base64"), encoding: "base64" },
  ])("rejects malformed or unsupported provider response %#", async (response) => {
    vi.mocked(requestGitHub).mockResolvedValue(response);

    await expect(fetchPackageMetadata(repository)).rejects.toMatchObject({
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

    await expect(fetchPackageMetadata(repository)).rejects.toBe(error);
  });

  it("translates unexpected failures into a safe provider error", async () => {
    vi.mocked(requestGitHub).mockRejectedValue(
      new Error("raw provider details"),
    );

    await expect(fetchPackageMetadata(repository)).rejects.toMatchObject({
      name: "GitHubClientError",
      category: "provider_error",
      message: "GitHub request failed.",
    });
  });
});
