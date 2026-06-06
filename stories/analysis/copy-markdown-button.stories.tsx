import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { CopyMarkdownButton } from "@/components/analysis/copy-markdown-button";

import { fullAnalysisResultFixture } from "./analysis-result-dashboard.fixture";

const markdown = fullAnalysisResultFixture.markdown;
const successfulWrite = fn(async () => undefined);
const pendingWrite = fn(() => new Promise<void>(() => undefined));
const failingWrite = fn(async () => {
  throw new Error("Browser clipboard denied.");
});

let retryAttempt = 0;
const retryWrite = fn(async () => {
  retryAttempt += 1;

  if (retryAttempt === 1) {
    throw new Error("Browser clipboard denied.");
  }
});

const meta = {
  title: "Analysis/Copy Markdown Button",
  component: CopyMarkdownButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    markdown,
    writeText: successfulWrite,
  },
} satisfies Meta<typeof CopyMarkdownButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    successfulWrite.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy Markdown" }),
    );

    await expect(successfulWrite).toHaveBeenCalledWith(markdown);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Markdown copied.",
    );
  },
};

export const Pending: Story = {
  args: {
    writeText: pendingWrite,
  },
  play: async ({ canvasElement }) => {
    pendingWrite.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy Markdown" }),
    );

    await expect(pendingWrite).toHaveBeenCalledWith(markdown);
    await expect(
      canvas.getByRole("button", { name: "Copying..." }),
    ).toBeDisabled();
  },
};

export const Failed: Story = {
  args: {
    writeText: failingWrite,
  },
  play: async ({ canvasElement }) => {
    failingWrite.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy Markdown" }),
    );

    await expect(failingWrite).toHaveBeenCalledWith(markdown);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Could not copy Markdown. Try again.",
    );
    await expect(
      canvas.getByRole("button", { name: "Retry copy" }),
    ).toBeEnabled();
  },
};

export const RetryAfterFailure: Story = {
  args: {
    writeText: retryWrite,
  },
  play: async ({ canvasElement }) => {
    retryAttempt = 0;
    retryWrite.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy Markdown" }),
    );
    await expect(canvas.getByRole("alert")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Retry copy" }));

    await expect(retryWrite).toHaveBeenCalledTimes(2);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Markdown copied.",
    );
  },
};
