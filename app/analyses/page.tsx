import { AnalysisHistoryContainer } from "@/components/analysis/analysis-history-container";

export default function AnalysesPage() {
  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Analysis history
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Revisit previous repository analyses.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Browse saved DevLog Automator summaries and open previous
            repository analyses when you need reusable notes, portfolio
            bullets, or next task context.
          </p>
        </div>

        <AnalysisHistoryContainer />
      </section>
    </main>
  );
}
