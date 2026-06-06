"use client";

import { useId, useState } from "react";
import {
  Check,
  Clipboard,
  Loader2,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export type CopyMarkdownTextWriter = (text: string) => Promise<void>;

export type CopyMarkdownButtonProps = {
  markdown: string;
  writeText?: CopyMarkdownTextWriter;
};

type CopyState = "idle" | "copying" | "success" | "error";

async function writeToClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is unavailable.");
  }

  await navigator.clipboard.writeText(text);
}

function getButtonLabel(state: CopyState): string {
  switch (state) {
    case "copying":
      return "Copying...";
    case "success":
      return "Copied";
    case "error":
      return "Retry copy";
    case "idle":
      return "Copy Markdown";
  }
}

function getButtonIcon(state: CopyState) {
  switch (state) {
    case "copying":
      return <Loader2 aria-hidden="true" className="size-4 animate-spin" />;
    case "success":
      return <Check aria-hidden="true" className="size-4" />;
    case "error":
      return <RotateCcw aria-hidden="true" className="size-4" />;
    case "idle":
      return <Clipboard aria-hidden="true" className="size-4" />;
  }
}

export function CopyMarkdownButton({
  markdown,
  writeText = writeToClipboard,
}: CopyMarkdownButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const feedbackId = useId();
  const isCopying = state === "copying";

  async function handleCopy() {
    if (isCopying) {
      return;
    }

    setState("copying");

    try {
      await writeText(markdown);
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        aria-describedby={state === "idle" ? undefined : feedbackId}
        disabled={isCopying}
        onClick={handleCopy}
        type="button"
        variant="outline"
      >
        {getButtonIcon(state)}
        {getButtonLabel(state)}
      </Button>
      {state === "success" ? (
        <p
          className="text-sm text-muted-foreground"
          id={feedbackId}
          role="status"
        >
          Markdown copied.
        </p>
      ) : null}
      {state === "error" ? (
        <p
          className="flex items-center gap-1 text-sm text-destructive"
          id={feedbackId}
          role="alert"
        >
          <TriangleAlert aria-hidden="true" className="size-4" />
          Could not copy Markdown. Try again.
        </p>
      ) : null}
    </div>
  );
}
