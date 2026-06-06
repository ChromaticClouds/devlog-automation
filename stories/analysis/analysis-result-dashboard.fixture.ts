import type { AnalysisResult } from "@/lib/analysis/result";
import type { GitHubRepository } from "@/lib/github/repository-url";

export const repositoryFixture: GitHubRepository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
  url: "https://github.com/ChromaticClouds/devlog-automation",
};

export const fullAnalysisResultFixture: AnalysisResult = {
  summary:
    "DevLog Automator now collects, bounds, and validates GitHub activity before sending it through a safe Gemini analysis boundary.",
  technicalHighlights: [
    "Built strict project-owned contracts for GitHub provider responses.",
    "Separated untrusted repository activity from Gemini system instructions.",
    "Added deterministic validation for structured LLM output.",
  ],
  portfolioBullets: [
    "Designed a testable GitHub-to-LLM analysis pipeline with bounded inputs.",
    "Implemented safe provider and validation error boundaries.",
  ],
  nextTasks: [
    "Connect the analysis pipeline to POST /api/analyze.",
    "Persist validated results for history views.",
  ],
  risks: [
    "Public repository content may include prompt-injection attempts.",
    "Provider rate limits require explicit API handling.",
  ],
  markdown:
    "# Development Log\n\nImplemented a safe, validated GitHub activity analysis pipeline.\n\n<script>alert('not executed')</script>",
};

export const sparseAnalysisResultFixture: AnalysisResult = {
  summary: "The repository has a valid summary with no generated list items.",
  technicalHighlights: [],
  portfolioBullets: [],
  nextTasks: [],
  risks: [],
  markdown: "# Sparse result\n\nNo list items were generated.",
};
