import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  AnalysisContainer,
  type AnalyzeRepositoryClient,
} from "@/components/analysis/analysis-container";
import {
  analyzeErrorResponses,
  analyzeSuccessResponse,
  createAnalyzeBadRequestHandler,
  createAnalyzeNotFoundHandler,
  createAnalyzeProcessingErrorHandler,
  createAnalyzeRateLimitedHandler,
  createAnalyzeSuccessHandler,
} from "@/mocks/analyze";

const validRepoUrl = analyzeSuccessResponse.repository.url;
const successAnalyze = fn(async () => analyzeSuccessResponse);
const pendingAnalyze = fn(
  () => new Promise<typeof analyzeSuccessResponse>(() => undefined),
);
const malformedAnalyze = fn(
  async () =>
    ({ malformed: true }) as unknown as Awaited<
      ReturnType<AnalyzeRepositoryClient>
    >,
);
let retryAttempt = 0;
const retryAnalyze = fn(async () => {
  retryAttempt += 1;

  if (retryAttempt === 1) {
    throw new Error(analyzeErrorResponses.processingError.body.message);
  }

  return analyzeSuccessResponse;
});

function rejectingAnalyze(
  key: keyof typeof analyzeErrorResponses,
): AnalyzeRepositoryClient {
  return fn(async () => {
    throw new Error(analyzeErrorResponses[key].body.message);
  });
}

function typeValidUrl(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);

  return userEvent.type(
    canvas.getByLabelText("GitHub repository URL"),
    `${validRepoUrl}.git/`,
  );
}

async function submitValidUrl(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);

  await typeValidUrl(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", { name: "Analyze repository" }),
  );
}

const meta: Meta<typeof AnalysisContainer> = {
  title: "Analysis/Analysis Container",
  component: AnalysisContainer,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [createAnalyzeSuccessHandler()] },
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
    analyzeRepository: successAnalyze,
  },
};

export default meta;
type Story = StoryObj<typeof AnalysisContainer>;

export const Idle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("No analysis result yet"),
    ).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { analyzeRepository: pendingAnalyze },
  play: async ({ canvasElement }) => {
    pendingAnalyze.mockClear();
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(pendingAnalyze).toHaveBeenCalledWith(validRepoUrl);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Analyzing repository",
    );
  },
};

export const Success: Story = {
  play: async ({ canvasElement }) => {
    successAnalyze.mockClear();
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(successAnalyze).toHaveBeenCalledOnce();
    await expect(
      canvas.getByRole("heading", { name: "ChromaticClouds/devlog-automation" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: /View repository/i }),
    ).toHaveAttribute("href", validRepoUrl);
  },
};

export const EmptyBeforeSubmission: Story = Idle;

export const FormValidationError: Story = {
  play: async ({ canvasElement }) => {
    successAnalyze.mockClear();
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText("GitHub repository URL"),
      "https://example.com/not-github",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Analyze repository" }),
    );

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter a valid public GitHub repository URL.",
    );
    await expect(successAnalyze).not.toHaveBeenCalled();
  },
};

export const BadRequest: Story = {
  args: { analyzeRepository: rejectingAnalyze("badRequest") },
  parameters: { msw: { handlers: [createAnalyzeBadRequestHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      analyzeErrorResponses.badRequest.body.message,
    );
  },
};

export const NotFound: Story = {
  args: { analyzeRepository: rejectingAnalyze("notFound") },
  parameters: { msw: { handlers: [createAnalyzeNotFoundHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      analyzeErrorResponses.notFound.body.message,
    );
  },
};

export const RateLimited: Story = {
  args: { analyzeRepository: rejectingAnalyze("rateLimited") },
  parameters: { msw: { handlers: [createAnalyzeRateLimitedHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      analyzeErrorResponses.rateLimited.body.message,
    );
  },
};

export const ProcessingError: Story = {
  args: { analyzeRepository: rejectingAnalyze("processingError") },
  parameters: { msw: { handlers: [createAnalyzeProcessingErrorHandler()] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      analyzeErrorResponses.processingError.body.message,
    );
  },
};

export const MalformedSuccess: Story = {
  args: { analyzeRepository: malformedAnalyze },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Repository analysis failed.",
    );
  },
};

export const RetryAfterFailure: Story = {
  args: { analyzeRepository: retryAnalyze },
  play: async ({ canvasElement }) => {
    retryAttempt = 0;
    retryAnalyze.mockClear();
    const canvas = within(canvasElement);

    await submitValidUrl(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Retry analysis" }));

    await expect(retryAnalyze).toHaveBeenCalledTimes(2);
    await expect(
      canvas.getByRole("heading", { name: "ChromaticClouds/devlog-automation" }),
    ).toBeInTheDocument();
  },
};
