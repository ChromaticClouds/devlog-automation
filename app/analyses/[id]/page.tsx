import Link from "next/link";

import { AnalysisHistoryDetailContainer } from "@/components/analysis/analysis-history-detail-container";

type AnalysisDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisDetailPage({
  params,
}: AnalysisDetailPageProps) {
  const { id } = await params;

  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <Link
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href="/analyses"
          >
            Back to analysis history
          </Link>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Review a saved analysis.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Load the stored repository summary, generated Markdown, portfolio
            bullets, risks, and next tasks for this previous analysis.
          </p>
        </div>

        <AnalysisHistoryDetailContainer analysisId={id} />
      </section>
    </main>
  );
}
