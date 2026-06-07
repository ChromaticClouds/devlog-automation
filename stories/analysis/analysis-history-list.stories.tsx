import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { AnalysisHistoryList } from "@/components/analysis/analysis-history-list";

import {
  analysisHistoryItemsFixture,
  formatHistoryFixtureDate,
} from "./analysis-history-list.fixture";

const retryHistory = fn();

const meta = {
  title: "Analysis/Analysis History List",
  component: AnalysisHistoryList,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Story />
        </div>
      </main>
    ),
  ],
  tags: ["autodocs"],
  args: {
    state: { status: "success", items: analysisHistoryItemsFixture },
    formatCreatedAt: formatHistoryFixtureDate,
  },
} satisfies Meta<typeof AnalysisHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { state: { status: "loading" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Loading analysis history",
    );
  },
};

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("region", { name: "Analysis history" }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("link")).toHaveLength(2);
    await expect(
      canvas.getByRole("link", {
        name: "View devlog-automation analysis",
      }),
    ).toHaveAttribute("href", "/analyses/42");
    await expect(canvas.getByText("UTC 2026-06-07 07:00")).toBeInTheDocument();
    await expect(
      canvas.getByText(/deliberately long summary/),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { state: { status: "success", items: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No previous analyses")).toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};

export const Error: Story = {
  args: {
    state: {
      status: "error",
      message: "Analysis history request failed.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Analysis history request failed.",
    );
    await expect(
      canvas.queryByRole("button", { name: "Retry history" }),
    ).not.toBeInTheDocument();
  },
};

export const Retry: Story = {
  args: {
    state: {
      status: "error",
      message: "Analysis history request failed.",
    },
    onRetry: retryHistory,
  },
  play: async ({ canvasElement }) => {
    retryHistory.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Retry history" }),
    );
    await expect(retryHistory).toHaveBeenCalledOnce();
  },
};
