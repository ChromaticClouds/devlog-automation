import type { GitHubRepository } from "./repository-url";
import { GitHubClientError, requestGitHub } from "./client";

const DEFAULT_ISSUE_LIMIT = 10;
const MAX_ISSUE_LIMIT = 100;

export type GitHubIssue = {
  number: number;
  title: string;
  state: "open" | "closed";
  authorLogin: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  url: string;
};

type GitHubIssueLabelResponse = string | { name: string | null };

type GitHubIssueResponse = {
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    login: string;
  } | null;
  labels: GitHubIssueLabelResponse[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: unknown;
};

function isGitHubIssueResponse(value: unknown): value is GitHubIssueResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = Reflect.get(value, "state");
  const labels = Reflect.get(value, "labels");
  const closedAt = Reflect.get(value, "closed_at");

  return (
    Number.isInteger(Reflect.get(value, "number")) &&
    typeof Reflect.get(value, "title") === "string" &&
    (state === "open" || state === "closed") &&
    isNullableGitHubUser(Reflect.get(value, "user")) &&
    Array.isArray(labels) &&
    labels.every(isGitHubIssueLabelResponse) &&
    typeof Reflect.get(value, "created_at") === "string" &&
    typeof Reflect.get(value, "updated_at") === "string" &&
    (typeof closedAt === "string" || closedAt === null) &&
    typeof Reflect.get(value, "html_url") === "string"
  );
}

function isNullableGitHubUser(value: unknown): value is { login: string } | null {
  return (
    value === null ||
    (!!value &&
      typeof value === "object" &&
      typeof Reflect.get(value, "login") === "string")
  );
}

function isGitHubIssueLabelResponse(
  value: unknown,
): value is GitHubIssueLabelResponse {
  if (typeof value === "string") {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const name = Reflect.get(value, "name");

  return typeof name === "string" || name === null;
}

function getLabelName(label: GitHubIssueLabelResponse): string | null {
  const name = typeof label === "string" ? label : label.name;

  return name?.trim() || null;
}

function isPullRequest(item: GitHubIssueResponse): boolean {
  return Object.hasOwn(item, "pull_request");
}

function validateLimit(limit: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ISSUE_LIMIT) {
    throw new RangeError(
      `Issue limit must be an integer between 1 and ${MAX_ISSUE_LIMIT}.`,
    );
  }
}

export async function fetchRecentIssues(
  repository: Pick<GitHubRepository, "owner" | "name">,
  limit = DEFAULT_ISSUE_LIMIT,
): Promise<GitHubIssue[]> {
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
    `repos/${owner}/${name}/issues?${params.toString()}`,
  );

  if (!Array.isArray(response) || !response.every(isGitHubIssueResponse)) {
    throw new GitHubClientError("provider_error");
  }

  return response.filter((item) => !isPullRequest(item)).map(normalizeIssue);
}

function normalizeIssue(issue: GitHubIssueResponse): GitHubIssue {
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    authorLogin: issue.user?.login ?? null,
    labels: issue.labels
      .map(getLabelName)
      .filter((name): name is string => name !== null),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    url: issue.html_url,
  };
}
