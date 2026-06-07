import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  AnalysisHistoryDetailContainer,
  type FetchAnalysisDetailClient,
} from "@/components/analysis/analysis-history-detail-container";
import {
  createHistoryDetailErrorHandler,
  createHistoryDetailInvalidIdHandler,
  createHistoryDetailMalformedHandler,
  createHistoryDetailNotFoundHandler,
  createHistoryDetailRetryToSuccessHandler,
  createHistoryDetailSuccessHandler,
  historyDetail,
  historyErrorResponses,
} from "@/mocks/history";

const pendingFetch = fn(
  () => new Promise<Awaited<ReturnType<FetchAnalysisDetailClient>>>(() => undefined),
);
const successFetch = fn(async () => historyDetail);
const malformedFetch = fn(
  async () =>
    ({ malformed: true }) as unknown as Awaited<
      ReturnType<FetchAnalysisDetailClient>
    >,
);
let retryAttempt = 0;
const retryFetch = fn(async () => {
  retryAttempt += 1;

  if (retryAttempt === 1) {
    throw new Error(historyErrorResponses.processingError.message);
  }

  return historyDetail;
});

function rejectingFetch(
  key: keyof typeof historyErrorResponses,
): FetchAnalysisDetailClient {
  return fn(async () => {
    throw new Error(historyErrorResponses[key].message);
  });
}

const meta: Meta<typeof AnalysisHistoryDetailContainer> = {
  title: "Analysis/Analysis History Detail Container",
  component: AnalysisHistoryDetailContainer,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [createHistoryDetailSuccessHandler()] },
  },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <Story />
        </div>
      </main>
    ),
  ],
  args: {
    analysisId: String(historyDetail.id),
    fetchDetail: successFetch,
    formatCreatedAt: (createdAt: string) =>
      `UTC ${createdAt.slice(0, 16).replace("T", " ")}`,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { fetchDetail: pendingFetch },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Loading analysis detail",
    );
  },
};

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole("heading", {
        name: "ChromaticClouds/devlog-automation",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/Created\s+UTC 2026-06-07 07:00/),
    ).toBeInTheDocument();
    await expect(canvas.getByText(historyDetail.result.summary)).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Copy Markdown" }),
    ).toBeInTheDocument();
  },
};

export const InvalidId: Story = {
  args: { analysisId: "invalid", fetchDetail: rejectingFetch("invalidId") },
  parameters: { msw: { handlers: [createHistoryDetailInvalidIdHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      historyErrorResponses.invalidId.message,
    );
  },
};

export const NotFound: Story = {
  args: { analysisId: "999", fetchDetail: rejectingFetch("notFound") },
  parameters: { msw: { handlers: [createHistoryDetailNotFoundHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      historyErrorResponses.notFound.message,
    );
  },
};

export const SafeFailure: Story = {
  args: { fetchDetail: rejectingFetch("processingError") },
  parameters: { msw: { handlers: [createHistoryDetailErrorHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      historyErrorResponses.processingError.message,
    );
  },
};

export const MalformedSuccess: Story = {
  args: { fetchDetail: malformedFetch },
  parameters: { msw: { handlers: [createHistoryDetailMalformedHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Analysis history request failed.",
    );
  },
};

export const RetryToSuccess: Story = {
  args: { fetchDetail: retryFetch },
  parameters: { msw: { handlers: [createHistoryDetailRetryToSuccessHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", { name: "Retry detail" }),
    );

    await expect(
      await canvas.findByRole("heading", {
        name: "ChromaticClouds/devlog-automation",
      }),
    ).toBeInTheDocument();
  },
};
