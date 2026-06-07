import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  AnalysisHistoryContainer,
  type FetchAnalysisHistoryClient,
} from "@/components/analysis/analysis-history-container";
import {
  createHistoryListEmptyHandler,
  createHistoryListErrorHandler,
  createHistoryListSuccessHandler,
  historyErrorResponses,
  historyItems,
} from "@/mocks/history";

const successFetch = fn(async () => historyItems);
const emptyFetch = fn(async () => []);
const pendingFetch = fn(() => new Promise<typeof historyItems>(() => undefined));
const errorFetch = fn(async () => {
  throw new Error(historyErrorResponses.processingError.message);
});
const malformedFetch = fn(
  async () => [{ malformed: true }] as unknown as Awaited<
    ReturnType<FetchAnalysisHistoryClient>
  >,
);
let retryAttempt = 0;
const retryFetch = fn(async () => {
  retryAttempt += 1;

  if (retryAttempt === 1) {
    throw new Error(historyErrorResponses.processingError.message);
  }

  return historyItems;
});

const meta = {
  title: "Analysis/Analysis History Container",
  component: AnalysisHistoryContainer,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [createHistoryListSuccessHandler()] },
  },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Story />
        </div>
      </main>
    ),
  ],
  args: { fetchHistory: successFetch },
} satisfies Meta<typeof AnalysisHistoryContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { fetchHistory: pendingFetch },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Loading analysis history",
    );
  },
};

export const Populated: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole("region", { name: "Analysis history" }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("link")).toHaveLength(historyItems.length);
  },
};

export const Empty: Story = {
  args: { fetchHistory: emptyFetch },
  parameters: { msw: { handlers: [createHistoryListEmptyHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText("No previous analyses"),
    ).toBeInTheDocument();
  },
};

export const SafeError: Story = {
  args: { fetchHistory: errorFetch },
  parameters: { msw: { handlers: [createHistoryListErrorHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      historyErrorResponses.processingError.message,
    );
  },
};

export const MalformedSuccess: Story = {
  args: { fetchHistory: malformedFetch },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Analysis history request failed.",
    );
  },
};

export const RetryToSuccess: Story = {
  args: { fetchHistory: retryFetch },
  parameters: {
    msw: {
      handlers: [createHistoryListErrorHandler(), createHistoryListSuccessHandler()],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", { name: "Retry history" }),
    );

    await expect(retryFetch).toHaveBeenCalledTimes(2);
    await expect(
      await canvas.findByRole("region", { name: "Analysis history" }),
    ).toBeInTheDocument();
  },
};
