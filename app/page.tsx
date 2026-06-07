import { AnalysisContainer } from "@/components/analysis/analysis-container";

const workflowItems = [
  "Collect recent public GitHub activity.",
  "Generate a structured development summary.",
  "Copy reusable Markdown for logs and portfolio notes.",
];

export default function Home() {
  return (
    <main className="flex-1 bg-muted/30">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,1fr)] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                DevLog Automator
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Turn repository activity into a reusable development log.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Enter a public GitHub repository URL and generate a concise
                summary, technical highlights, portfolio bullets, next tasks,
                and Markdown output from recent project activity.
              </p>
            </div>

            <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
              {workflowItems.map((item) => (
                <li
                  className="rounded-lg border bg-background/80 p-4 shadow-sm"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <p className="text-sm font-medium text-foreground">MVP flow</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The form below uses the real <code>/api/analyze</code> client
              boundary. Build-time rendering stays quiet; live GitHub, Gemini,
              and PostgreSQL work only starts after a user submits a URL.
            </p>
          </div>
        </div>

        <AnalysisContainer />
      </section>
    </main>
  );
}
