import Link from "next/link";
import { Clock3, History, Loader2, RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import type { AnalysisHistoryItem } from "@/lib/analysis/history";

export type AnalysisHistoryState =
  | { status: "loading" }
  | { status: "success"; items: AnalysisHistoryItem[] }
  | { status: "error"; message: string };

type AnalysisHistoryListProps = {
  state: AnalysisHistoryState;
  onRetry?: () => void;
  getDetailHref?: (id: number) => string;
  formatCreatedAt?: (createdAt: string) => string;
};

function defaultDetailHref(id: number): string {
  return `/analyses/${id}`;
}

function defaultFormatCreatedAt(createdAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(createdAt));
}

function HistoryEmpty() {
  return (
    <Empty className="min-h-72 border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <History aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No previous analyses</EmptyTitle>
        <EmptyDescription>
          Analyze a repository to create your first reusable development log.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function AnalysisHistoryList({
  state,
  onRetry,
  getDetailHref = defaultDetailHref,
  formatCreatedAt = defaultFormatCreatedAt,
}: AnalysisHistoryListProps) {
  if (state.status === "loading") {
    return (
      <Empty className="min-h-72 border bg-card" role="status">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Loader2 aria-hidden="true" className="animate-spin" />
          </EmptyMedia>
          <EmptyTitle>Loading analysis history</EmptyTitle>
          <EmptyDescription>
            Retrieving your previous repository analyses.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (state.status === "error") {
    return (
      <Card role="alert">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert aria-hidden="true" className="size-4" />
            History unavailable
          </CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        {onRetry ? (
          <CardContent>
            <Button onClick={onRetry} type="button" variant="outline">
              <RotateCcw aria-hidden="true" />
              Retry history
            </Button>
          </CardContent>
        ) : null}
      </Card>
    );
  }

  if (state.items.length === 0) {
    return <HistoryEmpty />;
  }

  return (
    <section aria-label="Analysis history" className="grid gap-4">
      {state.items.map((item) => (
        <Card className="min-w-0" key={item.id}>
          <CardHeader className="min-w-0">
            <CardTitle className="min-w-0 [overflow-wrap:anywhere]">
              {item.repositoryName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 shrink-0" />
              <time dateTime={item.createdAt}>
                {formatCreatedAt(item.createdAt)}
              </time>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="min-w-0 leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
              {item.summary}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href={getDetailHref(item.id)}>
                View {item.repositoryName} analysis
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}
