export type NormalizedActivitySampleKind =
  | "commits"
  | "pullRequests"
  | "issues";

export type NormalizedActivityCollectionSample = {
  kind: NormalizedActivitySampleKind;
  sampledCount: number;
  collectionLimit: number;
};

export type NormalizedActivitySampleMetadata = {
  scope: "recent_collected_activity_sample";
  countsRepresent: "collected_sample_only";
  interpretationGuidance: string;
  commits: NormalizedActivityCollectionSample;
  pullRequests: NormalizedActivityCollectionSample;
  issues: NormalizedActivityCollectionSample;
};

export type CreateActivitySampleMetadataInput = {
  commitCount: number;
  commitLimit: number;
  pullRequestCount: number;
  pullRequestLimit: number;
  issueCount: number;
  issueLimit: number;
};

export function createActivitySampleMetadata({
  commitCount,
  commitLimit,
  pullRequestCount,
  pullRequestLimit,
  issueCount,
  issueLimit,
}: CreateActivitySampleMetadataInput): NormalizedActivitySampleMetadata {
  return {
    scope: "recent_collected_activity_sample",
    countsRepresent: "collected_sample_only",
    interpretationGuidance:
      "Counts describe only the recent collected sample, not repository-wide or lifetime activity.",
    commits: {
      kind: "commits",
      sampledCount: commitCount,
      collectionLimit: commitLimit,
    },
    pullRequests: {
      kind: "pullRequests",
      sampledCount: pullRequestCount,
      collectionLimit: pullRequestLimit,
    },
    issues: {
      kind: "issues",
      sampledCount: issueCount,
      collectionLimit: issueLimit,
    },
  };
}
