import { config } from "@/config";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${config.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Daily analysis cron executed",
  });
};
