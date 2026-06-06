import type { GitHubCommit } from "../github/commits";
import type { GitHubIssue } from "../github/issues";
import type { GitHubPackageMetadata } from "../github/package-metadata";
import type { GitHubPullRequest } from "../github/pull-requests";
import type { GitHubReadme } from "../github/readme";
import type { GitHubRepository } from "../github/repository-url";

export const MAX_NORMALIZED_COMMITS = 20;
export const MAX_NORMALIZED_PULL_REQUESTS = 20;
export const MAX_NORMALIZED_ISSUES = 20;
export const MAX_README_EXCERPT_LENGTH = 4000;

export type NormalizeGitHubActivityInput = {
  repository: GitHubRepository;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  readme: GitHubReadme | null;
  packageMetadata: GitHubPackageMetadata | null;
};

export type NormalizedRepositorySummary = {
  owner: string;
  name: string;
  url: string;
};

export type NormalizedCommitSummary = {
  sha: string;
  message: string;
  authorName: string;
  committedAt: string;
  url: string;
};

export type NormalizedPullRequestSummary = {
  number: number;
  title: string;
  state: "open" | "closed";
  isMerged: boolean;
  authorLogin: string | null;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  url: string;
};

export type NormalizedIssueSummary = {
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

export type NormalizedReadmeSummary = {
  path: string;
  excerpt: string;
  url: string;
  isTruncated: boolean;
} | null;

export type NormalizedPackageSummary = {
  name: string | null;
  version: string | null;
  description: string | null;
  packageManager: string | null;
  engineConstraints: GitHubPackageMetadata["engineConstraints"];
  scriptNames: string[];
  dependencyNames: string[];
  devDependencyNames: string[];
} | null;

export type NormalizedActivityStats = {
  commitCount: number;
  pullRequestCount: number;
  openPullRequestCount: number;
  closedPullRequestCount: number;
  mergedPullRequestCount: number;
  issueCount: number;
  openIssueCount: number;
  closedIssueCount: number;
  scriptCount: number;
  dependencyCount: number;
  devDependencyCount: number;
};

export type NormalizedGitHubActivity = {
  repository: NormalizedRepositorySummary;
  stats: NormalizedActivityStats;
  commits: NormalizedCommitSummary[];
  pullRequests: NormalizedPullRequestSummary[];
  issues: NormalizedIssueSummary[];
  readme: NormalizedReadmeSummary;
  packageMetadata: NormalizedPackageSummary;
};

function trimText(value: string): string {
  return value.trim();
}

function trimNullableText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = trimText(value);

  return trimmed || null;
}

function trimLabels(labels: string[]): string[] {
  return labels.map(trimText).filter(Boolean);
}

function truncateText(value: string, maxLength: number): {
  text: string;
  isTruncated: boolean;
} {
  if (value.length <= maxLength) {
    return { text: value, isTruncated: false };
  }

  return {
    text: value.slice(0, maxLength),
    isTruncated: true,
  };
}

function normalizeCommits(commits: GitHubCommit[]): NormalizedCommitSummary[] {
  return commits
    .map((commit) => ({
      sha: trimText(commit.sha),
      message: trimText(commit.message),
      authorName: trimText(commit.authorName),
      committedAt: trimText(commit.committedAt),
      url: trimText(commit.url),
    }))
    .filter(
      (commit) =>
        commit.sha &&
        commit.message &&
        commit.authorName &&
        commit.committedAt &&
        commit.url,
    )
    .slice(0, MAX_NORMALIZED_COMMITS);
}

function normalizePullRequests(
  pullRequests: GitHubPullRequest[],
): NormalizedPullRequestSummary[] {
  return pullRequests
    .map((pullRequest) => ({
      number: pullRequest.number,
      title: trimText(pullRequest.title),
      state: pullRequest.state,
      isMerged: pullRequest.mergedAt !== null,
      authorLogin: trimNullableText(pullRequest.authorLogin),
      createdAt: trimText(pullRequest.createdAt),
      updatedAt: trimText(pullRequest.updatedAt),
      mergedAt: trimNullableText(pullRequest.mergedAt),
      url: trimText(pullRequest.url),
    }))
    .filter(
      (pullRequest) =>
        pullRequest.title &&
        pullRequest.createdAt &&
        pullRequest.updatedAt &&
        pullRequest.url,
    )
    .slice(0, MAX_NORMALIZED_PULL_REQUESTS);
}

function normalizeIssues(issues: GitHubIssue[]): NormalizedIssueSummary[] {
  return issues
    .map((issue) => ({
      number: issue.number,
      title: trimText(issue.title),
      state: issue.state,
      authorLogin: trimNullableText(issue.authorLogin),
      labels: trimLabels(issue.labels),
      createdAt: trimText(issue.createdAt),
      updatedAt: trimText(issue.updatedAt),
      closedAt: trimNullableText(issue.closedAt),
      url: trimText(issue.url),
    }))
    .filter((issue) => issue.title && issue.createdAt && issue.updatedAt && issue.url)
    .slice(0, MAX_NORMALIZED_ISSUES);
}

function normalizeReadme(readme: GitHubReadme | null): NormalizedReadmeSummary {
  if (readme === null) {
    return null;
  }

  const { text, isTruncated } = truncateText(
    trimText(readme.content),
    MAX_README_EXCERPT_LENGTH,
  );

  return {
    path: trimText(readme.path),
    excerpt: text,
    url: trimText(readme.url),
    isTruncated,
  };
}

function normalizePackageMetadata(
  packageMetadata: GitHubPackageMetadata | null,
): NormalizedPackageSummary {
  if (packageMetadata === null) {
    return null;
  }

  return {
    name: trimNullableText(packageMetadata.name),
    version: trimNullableText(packageMetadata.version),
    description: trimNullableText(packageMetadata.description),
    packageManager: trimNullableText(packageMetadata.packageManager),
    engineConstraints: packageMetadata.engineConstraints
      .map((engine) => ({
        name: trimText(engine.name),
        constraint: trimText(engine.constraint),
      }))
      .filter((engine) => engine.name && engine.constraint),
    scriptNames: trimLabels(packageMetadata.scriptNames),
    dependencyNames: trimLabels(packageMetadata.dependencyNames),
    devDependencyNames: trimLabels(packageMetadata.devDependencyNames),
  };
}

function getStats(
  commits: NormalizedCommitSummary[],
  pullRequests: NormalizedPullRequestSummary[],
  issues: NormalizedIssueSummary[],
  packageMetadata: NormalizedPackageSummary,
): NormalizedActivityStats {
  return {
    commitCount: commits.length,
    pullRequestCount: pullRequests.length,
    openPullRequestCount: pullRequests.filter(
      (pullRequest) => pullRequest.state === "open",
    ).length,
    closedPullRequestCount: pullRequests.filter(
      (pullRequest) => pullRequest.state === "closed",
    ).length,
    mergedPullRequestCount: pullRequests.filter(
      (pullRequest) => pullRequest.isMerged,
    ).length,
    issueCount: issues.length,
    openIssueCount: issues.filter((issue) => issue.state === "open").length,
    closedIssueCount: issues.filter((issue) => issue.state === "closed").length,
    scriptCount: packageMetadata?.scriptNames.length ?? 0,
    dependencyCount: packageMetadata?.dependencyNames.length ?? 0,
    devDependencyCount: packageMetadata?.devDependencyNames.length ?? 0,
  };
}

export function normalizeGitHubActivity(
  input: NormalizeGitHubActivityInput,
): NormalizedGitHubActivity {
  const commits = normalizeCommits(input.commits);
  const pullRequests = normalizePullRequests(input.pullRequests);
  const issues = normalizeIssues(input.issues);
  const readme = normalizeReadme(input.readme);
  const packageMetadata = normalizePackageMetadata(input.packageMetadata);

  return {
    repository: {
      owner: trimText(input.repository.owner),
      name: trimText(input.repository.name),
      url: trimText(input.repository.url),
    },
    stats: getStats(commits, pullRequests, issues, packageMetadata),
    commits,
    pullRequests,
    issues,
    readme,
    packageMetadata,
  };
}
