import { describe, expect, it } from "vitest";

import {
  isGitHubRepositoryUrl,
  parseGitHubRepositoryUrl,
} from "./repository-url";

describe("parseGitHubRepositoryUrl", () => {
  it.each([
    [
      "https://github.com/ChromaticClouds/devlog-automation",
      {
        owner: "ChromaticClouds",
        name: "devlog-automation",
        url: "https://github.com/ChromaticClouds/devlog-automation",
      },
    ],
    [
      " https://github.com/owner/repository.git ",
      {
        owner: "owner",
        name: "repository",
        url: "https://github.com/owner/repository",
      },
    ],
    [
      "https://github.com/owner/repository/",
      {
        owner: "owner",
        name: "repository",
        url: "https://github.com/owner/repository",
      },
    ],
  ])("parses and normalizes %s", (input, expected) => {
    expect(parseGitHubRepositoryUrl(input)).toEqual(expected);
  });

  it.each([
    "",
    "owner/repository",
    "http://github.com/owner/repository",
    "https://gitlab.com/owner/repository",
    "https://github.com/owner",
    "https://github.com/owner/repository/issues",
    "https://github.com/owner/repository?tab=readme",
    "https://github.com/owner/repository#readme",
    "https://github.com/-owner/repository",
    "https://github.com/owner/..",
  ])("rejects %s", (input) => {
    expect(parseGitHubRepositoryUrl(input)).toBeNull();
  });
});

describe("isGitHubRepositoryUrl", () => {
  it("reports whether a URL can be parsed", () => {
    expect(isGitHubRepositoryUrl("https://github.com/owner/repository")).toBe(
      true,
    );
    expect(isGitHubRepositoryUrl("https://example.com/owner/repository")).toBe(
      false,
    );
  });
});
