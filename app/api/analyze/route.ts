import {
  orchestrateRepositoryAnalysis,
  RepositoryAnalysisError,
  type RepositoryAnalysisErrorCategory,
} from "../../../lib/analysis/orchestration";
import type { StoredAnalysisResult } from "../../../lib/analysis/persistence";
import { NextResponse } from "next/server";

const ERROR_RESPONSES: Record<
  RepositoryAnalysisErrorCategory,
  { message: string; status: number }
> = {
  invalid_input: {
    message: "GitHub repository URL is invalid.",
    status: 400,
  },
  not_found: {
    message: "GitHub repository was not found.",
    status: 404,
  },
  rate_limited: {
    message: "Repository analysis rate limit was exceeded.",
    status: 429,
  },
  processing_error: {
    message: "Repository analysis failed.",
    status: 500,
  },
};

const INVALID_REQUEST_RESPONSE = {
  message: "Analyze request body is invalid.",
  status: 400,
};

type AnalyzeRepository = (repoUrl: string) => Promise<StoredAnalysisResult>;

function getRepoUrl(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const keys = Object.keys(body);
  const repoUrl = Reflect.get(body, "repoUrl");

  return keys.length === 1 && typeof repoUrl === "string" ? repoUrl : null;
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

export function createAnalyzePostHandler(analyze: AnalyzeRepository) {
  return async function POST(request: Request): Promise<NextResponse> {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        INVALID_REQUEST_RESPONSE.message,
        INVALID_REQUEST_RESPONSE.status,
      );
    }

    const repoUrl = getRepoUrl(body);

    if (repoUrl === null) {
      return errorResponse(
        INVALID_REQUEST_RESPONSE.message,
        INVALID_REQUEST_RESPONSE.status,
      );
    }

    try {
      const result = await analyze(repoUrl);

      return NextResponse.json(result);
    } catch (error) {
      const response =
        error instanceof RepositoryAnalysisError
          ? ERROR_RESPONSES[error.category]
          : ERROR_RESPONSES.processing_error;

      return errorResponse(response.message, response.status);
    }
  };
}

export const POST = createAnalyzePostHandler(orchestrateRepositoryAnalysis);
