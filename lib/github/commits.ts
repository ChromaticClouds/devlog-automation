import type { GitHubRepository } from "./repository-url";
import { GitHubClientError, requestGitHub } from "./client";

const DEFAULT_COMMIT_LIMIT = 10;
const MAX_COMMIT_LIMIT = 100;

export type GitHubCommit = {
  sha: string;
  message: string;
  authorName: string;
  committedAt: string;
  url: string;
};

type GitHubCommitResponse = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
    };
    committer: {
      date: string;
    };
  };
};

function isGitHubCommitResponse(value: unknown): value is GitHubCommitResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const commit = Reflect.get(value, "commit");

  return (
    typeof Reflect.get(value, "sha") === "string" &&
    typeof Reflect.get(value, "html_url") === "string" &&
    !!commit &&
    typeof commit === "object" &&
    typeof Reflect.get(commit, "message") === "string" &&
    isNamedAuthor(Reflect.get(commit, "author")) &&
    isDatedCommitter(Reflect.get(commit, "committer"))
  );
}

function isNamedAuthor(value: unknown): value is { name: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "name") === "string"
  );
}

function isDatedCommitter(value: unknown): value is { date: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "date") === "string"
  );
}

function validateLimit(limit: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_COMMIT_LIMIT) {
    throw new RangeError(
      `Commit limit must be an integer between 1 and ${MAX_COMMIT_LIMIT}.`,
    );
  }
}

export async function fetchRecentCommits(
  repository: Pick<GitHubRepository, "owner" | "name">,
  limit = DEFAULT_COMMIT_LIMIT,
): Promise<GitHubCommit[]> {
  validateLimit(limit);

  const owner = encodeURIComponent(repository.owner);
  const name = encodeURIComponent(repository.name);
  const response = await requestGitHub(
    `repos/${owner}/${name}/commits?per_page=${limit}`,
  );

  if (!Array.isArray(response) || !response.every(isGitHubCommitResponse)) {
    throw new GitHubClientError("provider_error");
  }

  return response.map(({ sha, html_url, commit }) => ({
    sha,
    message: commit.message,
    authorName: commit.author.name,
    committedAt: commit.committer.date,
    url: html_url,
  }));
}
