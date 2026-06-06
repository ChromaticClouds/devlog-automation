import type { GitHubRepository } from "./repository-url";
import { GitHubClientError, requestGitHub } from "./client";

export type GitHubReadme = {
  path: string;
  content: string;
  url: string;
};

type GitHubReadmeResponse = {
  path: string;
  content: string;
  encoding: "base64";
  html_url: string;
};

function isGitHubReadmeResponse(value: unknown): value is GitHubReadmeResponse {
  return (
    !!value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "path") === "string" &&
    typeof Reflect.get(value, "content") === "string" &&
    Reflect.get(value, "encoding") === "base64" &&
    typeof Reflect.get(value, "html_url") === "string"
  );
}

function decodeBase64(content: string): string {
  const normalized = content.replace(/\s/g, "");

  if (
    normalized.length % 4 !== 0 ||
    !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/.test(
      normalized,
    )
  ) {
    throw new Error("Invalid Base64 content.");
  }

  return Buffer.from(normalized, "base64").toString("utf8");
}

export async function fetchRepositoryReadme(
  repository: Pick<GitHubRepository, "owner" | "name">,
): Promise<GitHubReadme | null> {
  const owner = encodeURIComponent(repository.owner);
  const name = encodeURIComponent(repository.name);

  try {
    const response = await requestGitHub(`repos/${owner}/${name}/readme`);

    if (!isGitHubReadmeResponse(response)) {
      throw new GitHubClientError("provider_error");
    }

    return {
      path: response.path,
      content: decodeBase64(response.content),
      url: response.html_url,
    };
  } catch (error) {
    if (error instanceof GitHubClientError) {
      if (error.category === "not_found") {
        return null;
      }

      throw error;
    }

    throw new GitHubClientError("provider_error");
  }
}
