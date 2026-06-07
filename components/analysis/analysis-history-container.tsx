"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AnalysisHistoryList,
  type AnalysisHistoryState,
} from "./analysis-history-list";
import {
  fetchAnalysisHistory,
  validateAnalysisHistoryItems,
  type FetchAnalysisHistoryClient,
} from "./analysis-history-client";

export type { FetchAnalysisHistoryClient } from "./analysis-history-client";

export type AnalysisHistoryContainerProps = {
  fetchHistory?: FetchAnalysisHistoryClient;
};

function errorState(error: unknown): AnalysisHistoryState {
  return {
    status: "error",
    message:
      error instanceof Error
        ? error.message
        : "Analysis history request failed.",
  };
}

export function AnalysisHistoryContainer({
  fetchHistory = fetchAnalysisHistory,
}: AnalysisHistoryContainerProps) {
  const [state, setState] = useState<AnalysisHistoryState>({
    status: "loading",
  });

  const loadHistory = useCallback(async () => {
    try {
      const items = validateAnalysisHistoryItems(await fetchHistory());

      setState({ status: "success", items });
    } catch (error) {
      setState(errorState(error));
    }
  }, [fetchHistory]);

  const retryHistory = useCallback(() => {
    setState({ status: "loading" });
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let active = true;

    fetchHistory()
      .then(validateAnalysisHistoryItems)
      .then((items) => {
        if (active) {
          setState({ status: "success", items });
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
  }, [fetchHistory]);

  return <AnalysisHistoryList onRetry={retryHistory} state={state} />;
}
