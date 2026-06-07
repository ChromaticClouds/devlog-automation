"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Loader2, RotateCcw, TriangleAlert } from "lucide-react";

import { AnalysisResultDashboard } from "@/components/analysis/analysis-result-dashboard";
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
import type { AnalysisDetail } from "@/lib/analysis/history";

import {
  fetchAnalysisDetail,
  validateAnalysisDetail,
  type FetchAnalysisDetailClient,
} from "./analysis-history-detail-client";

export type { FetchAnalysisDetailClient };

type AnalysisDetailState =
  | { status: "loading" }
  | { status: "success"; detail: AnalysisDetail }
  | { status: "error"; message: string };

export type AnalysisHistoryDetailContainerProps = {
  analysisId: string;
  fetchDetail?: FetchAnalysisDetailClient;
  formatCreatedAt?: (createdAt: string) => string;
};

function defaultFormatCreatedAt(createdAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(createdAt));
}

function errorState(error: unknown): AnalysisDetailState {
  return {
    status: "error",
    message:
      error instanceof Error
        ? error.message
        : "Analysis history request failed.",
  };
}

export function AnalysisHistoryDetailContainer({
  analysisId,
  fetchDetail = fetchAnalysisDetail,
  formatCreatedAt = defaultFormatCreatedAt,
}: AnalysisHistoryDetailContainerProps) {
  const [state, setState] = useState<AnalysisDetailState>({
    status: "loading",
  });

  const loadDetail = useCallback(async () => {
    try {
      const detail = validateAnalysisDetail(await fetchDetail(analysisId));

      setState({ status: "success", detail });
    } catch (error) {
      setState(errorState(error));
    }
  }, [analysisId, fetchDetail]);

  const retryDetail = useCallback(() => {
    setState({ status: "loading" });
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    let active = true;

    fetchDetail(analysisId)
      .then(validateAnalysisDetail)
      .then((detail) => {
        if (active) {
          setState({ status: "success", detail });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState(errorState(error));
        }
      });

    return () => {
      active = false;
    };
  }, [analysisId, fetchDetail]);

  if (state.status === "loading") {
    return (
      <Empty className="min-h-80 border bg-card" role="status">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Loader2 aria-hidden="true" className="animate-spin" />
          </EmptyMedia>
          <EmptyTitle>Loading analysis detail</EmptyTitle>
          <EmptyDescription>
            Retrieving the saved repository analysis.
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
            Analysis detail unavailable
          </CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={retryDetail} type="button" variant="outline">
            <RotateCcw aria-hidden="true" />
            Retry detail
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />
            Saved analysis
          </CardTitle>
          <CardDescription>
            Created {formatCreatedAt(state.detail.createdAt)}
          </CardDescription>
        </CardHeader>
      </Card>

      <AnalysisResultDashboard
        repository={state.detail.repository}
        result={state.detail.result}
      />
    </div>
  );
}
