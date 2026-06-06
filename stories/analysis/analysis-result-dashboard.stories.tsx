import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { AnalysisResultDashboard } from "@/components/analysis/analysis-result-dashboard";

import {
  fullAnalysisResultFixture,
  repositoryFixture,
  sparseAnalysisResultFixture,
} from "./analysis-result-dashboard.fixture";

const dashboardWriteText = fn(async () => undefined);

const meta = {
  title: "Analysis/Analysis Result Dashboard",
  component: AnalysisResultDashboard,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-muted/40 p-4 sm:p-8">
        <Story />
      </main>
    ),
  ],
  tags: ["autodocs"],
  args: {
    repository: repositoryFixture,
    result: fullAnalysisResultFixture,
    copyMarkdownText: dashboardWriteText,
  },
} satisfies Meta<typeof AnalysisResultDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    dashboardWriteText.mockClear();
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "ChromaticClouds/devlog-automation",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { name: "Technical highlights" }),
    ).toBeInTheDocument();

    const repositoryLink = canvas.getByRole("link", {
      name: /View repository/i,
    });
    await expect(repositoryLink).toHaveAttribute("target", "_blank");
    await expect(repositoryLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(canvas.getByText(/alert\('not executed'\)/)).toBeInTheDocument();
    await expect(canvasElement.querySelector("script")).toBeNull();

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy Markdown" }),
    );
    await expect(dashboardWriteText).toHaveBeenCalledWith(
      fullAnalysisResultFixture.markdown,
    );
  },
};

export const SparseSections: Story = {
  args: {
    result: sparseAnalysisResultFixture,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("No technical highlights were identified."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("No portfolio bullets were generated."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("No next tasks were suggested."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("No risks were identified."),
    ).toBeInTheDocument();
  },
};

export const NoResult: Story = {
  args: {
    result: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("No analysis result yet"),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: /copy markdown/i }),
    ).not.toBeInTheDocument();
  },
};
