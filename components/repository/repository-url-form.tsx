"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseGitHubRepositoryUrl } from "@/lib/github/repository-url";

const EMPTY_URL_ERROR = "Enter a GitHub repository URL.";
const INVALID_URL_ERROR = "Enter a valid public GitHub repository URL.";

export type RepositoryUrlFormProps = {
  onSubmit(repoUrl: string): void;
  isSubmitting?: boolean;
  initialUrl?: string;
};

export function RepositoryUrlForm({
  onSubmit,
  isSubmitting = false,
  initialUrl = "",
}: RepositoryUrlFormProps) {
  const [repoUrl, setRepoUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const descriptionId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!repoUrl.trim()) {
      setError(EMPTY_URL_ERROR);
      return;
    }

    const repository = parseGitHubRepositoryUrl(repoUrl);

    if (repository === null) {
      setError(INVALID_URL_ERROR);
      return;
    }

    setError(null);
    onSubmit(repository.url);
  }

  return (
    <form className="w-full max-w-2xl space-y-4" onSubmit={handleSubmit}>
      <Field data-invalid={error ? "true" : undefined}>
        <FieldLabel htmlFor={inputId}>GitHub repository URL</FieldLabel>
        <Input
          aria-describedby={
            error ? `${descriptionId} ${errorId}` : descriptionId
          }
          aria-invalid={error ? true : undefined}
          autoComplete="url"
          disabled={isSubmitting}
          id={inputId}
          onChange={(event) => {
            setRepoUrl(event.target.value);
            setError(null);
          }}
          placeholder="https://github.com/owner/repository"
          type="url"
          value={repoUrl}
        />
        <FieldDescription id={descriptionId}>
          Enter the URL of a public GitHub repository to analyze.
        </FieldDescription>
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </Field>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <Search aria-hidden="true" />
        )}
        {isSubmitting ? "Analyzing repository..." : "Analyze repository"}
      </Button>
    </form>
  );
}
