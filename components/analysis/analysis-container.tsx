"use client";

import { useState } from "react";
import { Loader2, RotateCcw, TriangleAlert } from "lucide-react";

import { AnalysisResultDashboard } from "@/components/analysis/analysis-result-dashboard";
import { RepositoryUrlForm } from "@/components/repository/repository-url-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { StoredAnalysisResult } from "@/lib/analysis/persistence";

const FALLBACK_ERROR_MESSAGE = "Repository analysis failed.";

export type AnalyzeRepositoryClient = (
  repoUrl: string,
) => Promise<StoredAnalysisResult>;

export type AnalysisContainerProps = {
  analyzeRepository?: AnalyzeRepositoryClient;
};

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; analysis: StoredAnalysisResult }
  | { status: "error"; message: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStoredAnalysisResult(value: unknown): value is StoredAnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const repository = Reflect.get(value, "repository");
  const result = Reflect.get(value, "result");

  return (
    typeof Reflect.get(value, "analysisId") === "number" &&
    !!repository &&
    typeof repository === "object" &&
    typeof Reflect.get(repository, "owner") === "string" &&
    typeof Reflect.get(repository, "name") === "string" &&
    typeof Reflect.get(repository, "url") === "string" &&
    !!result &&
    typeof result === "object" &&
    typeof Reflect.get(result, "summary") === "string" &&
    isStringArray(Reflect.get(result, "technicalHighlights")) &&
    isStringArray(Reflect.get(result, "portfolioBullets")) &&
    isStringArray(Reflect.get(result, "nextTasks")) &&
    isStringArray(Reflect.get(result, "risks")) &&
    typeof Reflect.get(result, "markdown") === "string"
  );
}

function getSafeErrorMessage(value: unknown): string {
  return (
    value &&
    typeof value === "object" &&
    typeof Reflect.get(value, "message") === "string"
      ? Reflect.get(value, "message")
      : FALLBACK_ERROR_MESSAGE
  );
}

export async function fetchAnalyzeRepository(
  repoUrl: string,
): Promise<StoredAnalysisResult> {
  const response = await fetch("/api/analyze", {
    body: JSON.stringify({ repoUrl }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getSafeErrorMessage(body));
  }

  if (!isStoredAnalysisResult(body)) {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  return body;
}

export function AnalysisContainer({
  analyzeRepository = fetchAnalyzeRepository,
}: AnalysisContainerProps) {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [lastRepoUrl, setLastRepoUrl] = useState<string | null>(null);
  const isLoading = state.status === "loading";

  async function runAnalysis(repoUrl: string) {
    setLastRepoUrl(repoUrl);
    setState({ status: "loading" });

    try {
      const analysis = await analyzeRepository(repoUrl);

      if (!isStoredAnalysisResult(analysis)) {
        throw new Error(FALLBACK_ERROR_MESSAGE);
      }

      setState({ status: "success", analysis });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE,
      });
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze a GitHub repository</CardTitle>
          <CardDescription>
            Enter a public GitHub repository URL to generate a development log.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepositoryUrlForm isSubmitting={isLoading} onSubmit={runAnalysis} />
        </CardContent>
      </Card>

      {state.status === "idle" ? (
        <AnalysisResultDashboard
          repository={{
            owner: "owner",
            name: "repository",
            url: "https://github.com/owner/repository",
          }}
          result={null}
        />
      ) : null}

      {state.status === "loading" ? (
        <Empty className="min-h-80 border bg-card" role="status">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 aria-hidden="true" className="animate-spin" />
            </EmptyMedia>
            <EmptyTitle>Analyzing repository</EmptyTitle>
            <EmptyDescription>
              Collecting repository activity and generating a summary.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {state.status === "error" ? (
        <Card role="alert">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <TriangleAlert aria-hidden="true" className="size-4" />
              Analysis failed
            </CardTitle>
            <CardDescription>{state.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              disabled={!lastRepoUrl}
              onClick={() => lastRepoUrl && runAnalysis(lastRepoUrl)}
              type="button"
              variant="outline"
            >
              <RotateCcw aria-hidden="true" />
              Retry analysis
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "success" ? (
        <AnalysisResultDashboard
          repository={state.analysis.repository}
          result={state.analysis.result}
        />
      ) : null}
    </section>
  );
}
