import {
  listAnalysisHistory,
  type AnalysisHistoryItem,
} from "../../../lib/analysis/history";
import { NextResponse } from "next/server";

const FAILURE_MESSAGE = "Analysis history request failed.";
const METHOD_NOT_ALLOWED_MESSAGE = "Method not allowed.";

type ListHistory = () => Promise<AnalysisHistoryItem[]>;

const defaultListHistory: ListHistory = async () => {
  const { default: prisma } = await import("../../../lib/prisma");

  return listAnalysisHistory(prisma);
};

export function createAnalysisHistoryGetHandler(listHistory: ListHistory) {
  return async function GET(): Promise<NextResponse> {
    try {
      return NextResponse.json({ items: await listHistory() });
    } catch {
      return NextResponse.json({ message: FAILURE_MESSAGE }, { status: 500 });
    }
  };
}

export const GET = createAnalysisHistoryGetHandler(defaultListHistory);

function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    { message: METHOD_NOT_ALLOWED_MESSAGE },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export const HEAD = methodNotAllowed;
export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
