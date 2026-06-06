import {
  ExternalLink,
  FileText,
  Lightbulb,
  ListChecks,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import {
  CopyMarkdownButton,
  type CopyMarkdownTextWriter,
} from "@/components/analysis/copy-markdown-button";
import { AnalysisResultList } from "@/components/analysis/analysis-result-list";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
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
import type { AnalysisResult } from "@/lib/analysis/result";
import type { GitHubRepository } from "@/lib/github/repository-url";

export type AnalysisResultDashboardProps = {
  repository: GitHubRepository;
  result: AnalysisResult | null;
  copyMarkdownText?: CopyMarkdownTextWriter;
};

export function AnalysisResultDashboard({
  repository,
  result,
  copyMarkdownText,
}: AnalysisResultDashboardProps) {
  if (result === null) {
    return (
      <Empty className="min-h-80 border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No analysis result yet</EmptyTitle>
          <EmptyDescription>
            Run a repository analysis to generate a development summary.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section
      aria-labelledby="analysis-result-title"
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      <header className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Badge variant="secondary">Analysis result</Badge>
          <h1
            className="break-words text-2xl font-semibold tracking-tight sm:text-3xl"
            id="analysis-result-title"
          >
            {repository.owner}/{repository.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Validated development activity summary
          </p>
        </div>
        <a
          className="inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={repository.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          View repository
          <ExternalLink aria-hidden="true" className="size-4" />
          <span className="sr-only">
            {repository.owner}/{repository.name} on GitHub
          </span>
        </a>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <Sparkles
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Summary
            </h2>
          </CardTitle>
          <CardDescription>Repository activity at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-7">{result.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <AnalysisResultList
          emptyMessage="No technical highlights were identified."
          icon={ListChecks}
          items={result.technicalHighlights}
          title="Technical highlights"
        />
        <AnalysisResultList
          emptyMessage="No portfolio bullets were generated."
          icon={Sparkles}
          items={result.portfolioBullets}
          title="Portfolio bullets"
        />
        <AnalysisResultList
          emptyMessage="No next tasks were suggested."
          icon={Lightbulb}
          items={result.nextTasks}
          title="Next tasks"
        />
        <AnalysisResultList
          emptyMessage="No risks were identified."
          icon={TriangleAlert}
          items={result.risks}
          title="Risks"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <FileText
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Markdown preview
            </h2>
          </CardTitle>
          <CardDescription>
            Plain text preview. Markdown and HTML are not interpreted.
          </CardDescription>
          <CardAction>
            <CopyMarkdownButton
              markdown={result.markdown}
              writeText={copyMarkdownText}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-mono text-sm leading-6">
            {result.markdown}
          </pre>
        </CardContent>
      </Card>
    </section>
  );
}
