export function decodeGitHubBase64Content(content: string): string {
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
