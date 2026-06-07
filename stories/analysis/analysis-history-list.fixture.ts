import type { AnalysisHistoryItem } from "@/lib/analysis/history";

export const analysisHistoryItemsFixture: AnalysisHistoryItem[] = [
  {
    id: 42,
    repositoryName: "devlog-automation",
    repositoryUrl: "https://github.com/ChromaticClouds/devlog-automation",
    summary:
      "Connected the analysis flow and added safe history read operations.",
    createdAt: "2026-06-07T07:00:00.000Z",
  },
  {
    id: 41,
    repositoryName:
      "a-very-long-repository-name-that-must-wrap-without-breaking-the-layout",
    repositoryUrl:
      "https://github.com/ChromaticClouds/a-very-long-repository-name-that-must-wrap-without-breaking-the-layout",
    summary:
      "A deliberately long summary that demonstrates how repository history content wraps safely across narrow layouts without forcing the card beyond the available viewport width.",
    createdAt: "2026-06-06T13:30:00.000Z",
  },
];

export function formatHistoryFixtureDate(createdAt: string): string {
  return `UTC ${createdAt.slice(0, 16).replace("T", " ")}`;
}
