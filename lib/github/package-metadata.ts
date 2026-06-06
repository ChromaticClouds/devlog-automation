import type { GitHubRepository } from "./repository-url";
import { GitHubClientError, requestGitHub } from "./client";
import { decodeGitHubBase64Content } from "./contents";

export type GitHubPackageEngineConstraint = {
  name: string;
  constraint: string;
};

export type GitHubPackageMetadata = {
  name: string | null;
  version: string | null;
  description: string | null;
  packageManager: string | null;
  engineConstraints: GitHubPackageEngineConstraint[];
  scriptNames: string[];
  dependencyNames: string[];
  devDependencyNames: string[];
};

type GitHubPackageFileResponse = {
  content: string;
  encoding: "base64";
};

function isGitHubPackageFileResponse(
  value: unknown,
): value is GitHubPackageFileResponse {
  return (
    !!value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "content") === "string" &&
    Reflect.get(value, "encoding") === "base64"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getNullableString(
  manifest: Record<string, unknown>,
  key: string,
): string | null {
  const value = manifest[key];

  return typeof value === "string" ? value : null;
}

function getSortedStringValuedKeys(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([, entryValue]) => typeof entryValue === "string")
    .map(([key]) => key)
    .sort();
}

function getEngineConstraints(
  value: unknown,
): GitHubPackageEngineConstraint[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([, constraint]) => typeof constraint === "string")
    .map(([name, constraint]) => ({
      name,
      constraint: constraint as string,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function parsePackageJson(content: string): Record<string, unknown> {
  const parsed = JSON.parse(content);

  if (!isRecord(parsed)) {
    throw new Error("Package JSON must be an object.");
  }

  return parsed;
}

function normalizePackageMetadata(
  manifest: Record<string, unknown>,
): GitHubPackageMetadata {
  return {
    name: getNullableString(manifest, "name"),
    version: getNullableString(manifest, "version"),
    description: getNullableString(manifest, "description"),
    packageManager: getNullableString(manifest, "packageManager"),
    engineConstraints: getEngineConstraints(manifest.engines),
    scriptNames: getSortedStringValuedKeys(manifest.scripts),
    dependencyNames: getSortedStringValuedKeys(manifest.dependencies),
    devDependencyNames: getSortedStringValuedKeys(manifest.devDependencies),
  };
}

export async function fetchPackageMetadata(
  repository: Pick<GitHubRepository, "owner" | "name">,
): Promise<GitHubPackageMetadata | null> {
  const owner = encodeURIComponent(repository.owner);
  const name = encodeURIComponent(repository.name);

  try {
    const response = await requestGitHub(
      `repos/${owner}/${name}/contents/package.json`,
    );

    if (!isGitHubPackageFileResponse(response)) {
      throw new GitHubClientError("provider_error");
    }

    const content = decodeGitHubBase64Content(response.content);
    const manifest = parsePackageJson(content);

    return normalizePackageMetadata(manifest);
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
