import {
  AnalysisNotFoundError,
  getAnalysisDetail,
  type AnalysisDetail,
} from "../../../../lib/analysis/history";
import { NextResponse } from "next/server";

const INVALID_ID_MESSAGE = "Analysis id is invalid.";
const NOT_FOUND_MESSAGE = "Analysis result was not found.";
const FAILURE_MESSAGE = "Analysis history request failed.";
const METHOD_NOT_ALLOWED_MESSAGE = "Method not allowed.";

type GetDetail = (id: number) => Promise<AnalysisDetail>;
type DetailContext = { params: Promise<{ id: string }> };

const defaultGetDetail: GetDetail = async (id) => {
  const { default: prisma } = await import("../../../../lib/prisma");

  return getAnalysisDetail(id, prisma);
};

function parseAnalysisId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function createAnalysisDetailGetHandler(getDetail: GetDetail) {
  return async function GET(
    _request: Request,
    context: DetailContext,
  ): Promise<NextResponse> {
    const id = parseAnalysisId((await context.params).id);

    if (id === null) {
      return NextResponse.json({ message: INVALID_ID_MESSAGE }, { status: 400 });
    }

    try {
      return NextResponse.json(await getDetail(id));
    } catch (error) {
      if (error instanceof AnalysisNotFoundError) {
        return NextResponse.json(
          { message: NOT_FOUND_MESSAGE },
          { status: 404 },
        );
      }

      return NextResponse.json({ message: FAILURE_MESSAGE }, { status: 500 });
    }
  };
}

export const GET = createAnalysisDetailGetHandler(defaultGetDetail);

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
