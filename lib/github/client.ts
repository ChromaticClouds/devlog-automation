import { config } from "../../config";

export type GitHubClientErrorCategory =
  | "not_found"
  | "rate_limited"
  | "provider_error";

export class GitHubClientError extends Error {
  readonly category: GitHubClientErrorCategory;
  readonly status?: number;

  constructor(category: GitHubClientErrorCategory, status?: number) {
    super(getErrorMessage(category));
    this.name = "GitHubClientError";
    this.category = category;
    this.status = status;
  }
}

function getErrorMessage(category: GitHubClientErrorCategory): string {
  switch (category) {
    case "not_found":
      return "GitHub repository was not found.";
    case "rate_limited":
      return "GitHub request rate limit was exceeded.";
    case "provider_error":
      return "GitHub request failed.";
  }
}

function getRequestUrl(path: string): URL {
  const baseUrl = config.GITHUB_API_BASE_URL.endsWith("/")
    ? config.GITHUB_API_BASE_URL
    : `${config.GITHUB_API_BASE_URL}/`;

  return new URL(path.replace(/^\/+/, ""), baseUrl);
}

function getError(response: Response): GitHubClientError {
  if (response.status === 404) {
    return new GitHubClientError("not_found", response.status);
  }

  if (
    response.status === 429 ||
    (response.status === 403 &&
      response.headers.get("x-ratelimit-remaining") === "0")
  ) {
    return new GitHubClientError("rate_limited", response.status);
  }

  return new GitHubClientError("provider_error", response.status);
}

export async function requestGitHub(path: string): Promise<unknown> {
  try {
    const headers = new Headers({
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    });

    if (config.GITHUB_TOKEN) {
      headers.set("Authorization", `Bearer ${config.GITHUB_TOKEN}`);
    }

    const response = await fetch(getRequestUrl(path), { headers });

    if (!response.ok) {
      throw getError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof GitHubClientError) {
      throw error;
    }

    throw new GitHubClientError("provider_error");
  }
}
