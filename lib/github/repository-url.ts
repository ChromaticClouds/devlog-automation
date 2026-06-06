const GITHUB_HOSTNAME = "github.com";
const OWNER_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const REPOSITORY_PATTERN = /^[a-z\d._-]+$/i;

export type GitHubRepository = {
  owner: string;
  name: string;
  url: string;
};

export function parseGitHubRepositoryUrl(
  input: string,
): GitHubRepository | null {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== GITHUB_HOSTNAME ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length !== 2) {
    return null;
  }

  const [owner, repositorySegment] = segments;
  const name = repositorySegment.endsWith(".git")
    ? repositorySegment.slice(0, -4)
    : repositorySegment;

  if (
    !OWNER_PATTERN.test(owner) ||
    !REPOSITORY_PATTERN.test(name) ||
    name === "." ||
    name === ".."
  ) {
    return null;
  }

  return {
    owner,
    name,
    url: `https://${GITHUB_HOSTNAME}/${owner}/${name}`,
  };
}

export function isGitHubRepositoryUrl(input: string): boolean {
  return parseGitHubRepositoryUrl(input) !== null;
}
