import {
  createActivitySampleMetadata,
  type NormalizedActivitySampleMetadata,
} from "./activity-sampling";

export type NormalizedActivityStats = {
  sample: NormalizedActivitySampleMetadata;
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

type CountedPullRequest = {
  state: "open" | "closed";
  isMerged: boolean;
};

type CountedIssue = {
  state: "open" | "closed";
};

type CountedPackageMetadata = {
  scriptNames: string[];
  dependencyNames: string[];
  devDependencyNames: string[];
} | null;

export type CreateNormalizedActivityStatsInput = {
  commits: readonly unknown[];
  pullRequests: readonly CountedPullRequest[];
  issues: readonly CountedIssue[];
  packageMetadata: CountedPackageMetadata;
  limits: {
    commits: number;
    pullRequests: number;
    issues: number;
  };
};

export function createNormalizedActivityStats({
  commits,
  pullRequests,
  issues,
  packageMetadata,
  limits,
}: CreateNormalizedActivityStatsInput): NormalizedActivityStats {
  return {
    sample: createActivitySampleMetadata({
      commitCount: commits.length,
      commitLimit: limits.commits,
      pullRequestCount: pullRequests.length,
      pullRequestLimit: limits.pullRequests,
      issueCount: issues.length,
      issueLimit: limits.issues,
    }),
    commitCount: commits.length,
    pullRequestCount: pullRequests.length,
    openPullRequestCount: pullRequests.filter(({ state }) => state === "open")
      .length,
    closedPullRequestCount: pullRequests.filter(
      ({ state }) => state === "closed",
    ).length,
    mergedPullRequestCount: pullRequests.filter(({ isMerged }) => isMerged)
      .length,
    issueCount: issues.length,
    openIssueCount: issues.filter(({ state }) => state === "open").length,
    closedIssueCount: issues.filter(({ state }) => state === "closed").length,
    scriptCount: packageMetadata?.scriptNames.length ?? 0,
    dependencyCount: packageMetadata?.dependencyNames.length ?? 0,
    devDependencyCount: packageMetadata?.devDependencyNames.length ?? 0,
  };
}
