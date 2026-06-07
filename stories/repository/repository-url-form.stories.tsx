import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { RepositoryUrlForm } from "@/components/repository/repository-url-form";

const submitRepository = fn();

const meta = {
  title: "Repository/Repository URL Form",
  component: RepositoryUrlForm,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <main className="w-screen max-w-3xl p-6">
        <Story />
      </main>
    ),
  ],
  tags: ["autodocs"],
  args: {
    onSubmit: submitRepository,
  },
} satisfies Meta<typeof RepositoryUrlForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const EmptyValidation: Story = {
  play: async ({ canvasElement }) => {
    submitRepository.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Analyze repository" }),
    );

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter a GitHub repository URL.",
    );
    await expect(canvas.getByLabelText("GitHub repository URL")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(submitRepository).not.toHaveBeenCalled();
  },
};

export const InvalidThenEdit: Story = {
  play: async ({ canvasElement }) => {
    submitRepository.mockClear();
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("GitHub repository URL");

    await userEvent.type(input, "https://example.com/not-github");
    await userEvent.click(
      canvas.getByRole("button", { name: "Analyze repository" }),
    );
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter a valid public GitHub repository URL.",
    );

    await userEvent.type(input, "/edited");

    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(submitRepository).not.toHaveBeenCalled();
  },
};

export const CanonicalSubmission: Story = {
  args: {
    initialUrl: "https://github.com/ChromaticClouds/devlog-automation.git/",
  },
  play: async ({ canvasElement }) => {
    submitRepository.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Analyze repository" }),
    );

    await expect(submitRepository).toHaveBeenCalledOnce();
    await expect(submitRepository).toHaveBeenCalledWith(
      "https://github.com/ChromaticClouds/devlog-automation",
    );
  },
};

export const Submitting: Story = {
  args: {
    initialUrl: "https://github.com/ChromaticClouds/devlog-automation",
    isSubmitting: true,
  },
  play: async ({ canvasElement }) => {
    submitRepository.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText("GitHub repository URL")).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Analyzing repository..." }),
    ).toBeDisabled();
    await expect(submitRepository).not.toHaveBeenCalled();
  },
};
