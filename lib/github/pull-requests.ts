import type { GitHubRepository } from "./repository-url";
import { GitHubClientError, requestGitHub } from "./client";

const DEFAULT_PULL_REQUEST_LIMIT = 10;
const MAX_PULL_REQUEST_LIMIT = 100;

export type GitHubPullRequest = {
  number: number;
  title: string;
  state: "open" | "closed";
  authorLogin: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  url: string;
};

type GitHubPullRequestResponse = {
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
};

function isGitHubPullRequestResponse(
  value: unknown,
): value is GitHubPullRequestResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = Reflect.get(value, "state");
  const mergedAt = Reflect.get(value, "merged_at");

  return (
    Number.isInteger(Reflect.get(value, "number")) &&
    typeof Reflect.get(value, "title") === "string" &&
    (state === "open" || state === "closed") &&
    isGitHubUser(Reflect.get(value, "user")) &&
    typeof Reflect.get(value, "created_at") === "string" &&
    typeof Reflect.get(value, "updated_at") === "string" &&
    (typeof mergedAt === "string" || mergedAt === null) &&
    typeof Reflect.get(value, "html_url") === "string"
  );
}

function isGitHubUser(value: unknown): value is { login: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "login") === "string"
  );
}

function validateLimit(limit: number): void {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_PULL_REQUEST_LIMIT
  ) {
    throw new RangeError(
      `Pull request limit must be an integer between 1 and ${MAX_PULL_REQUEST_LIMIT}.`,
    );
  }
}

export async function fetchRecentPullRequests(
  repository: Pick<GitHubRepository, "owner" | "name">,
  limit = DEFAULT_PULL_REQUEST_LIMIT,
): Promise<GitHubPullRequest[]> {
  validateLimit(limit);

  const owner = encodeURIComponent(repository.owner);
  const name = encodeURIComponent(repository.name);
  const params = new URLSearchParams({
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: String(limit),
  });
  const response = await requestGitHub(
    `repos/${owner}/${name}/pulls?${params.toString()}`,
  );

  if (
    !Array.isArray(response) ||
    !response.every(isGitHubPullRequestResponse)
  ) {
    throw new GitHubClientError("provider_error");
  }

  return response.map(
    ({
      number,
      title,
      state,
      user,
      created_at,
      updated_at,
      merged_at,
      html_url,
    }) => ({
      number,
      title,
      state,
      authorLogin: user.login,
      createdAt: created_at,
      updatedAt: updated_at,
      mergedAt: merged_at,
      url: html_url,
    }),
  );
}
