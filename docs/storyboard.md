# Storyboard

## Scene 1: Landing

The user sees a short explanation and a GitHub repository URL input.

```text
Enter GitHub Repository URL
[https://github.com/user/repo        ]
[Analyze]
```

## Scene 2: Validation

If the URL is invalid, the user sees a clear error message.

```text
Please enter a valid GitHub repository URL.
```

## Scene 3: GitHub Collection

The system shows progress while collecting data.

```text
Collecting GitHub activity...
- Fetching commits
- Fetching pull requests
- Fetching issues
- Fetching README
```

## Scene 4: AI Summary

The system sends normalized activity to the LLM.

```text
Generating development log...
```

## Scene 5: Result Dashboard

The user sees:

- Summary
- Technical highlights
- Portfolio bullets
- Next tasks
- Risks
- Markdown preview

## Scene 6: Copy Markdown

The user copies the generated Markdown and reuses it in README, portfolio, resume, or weekly log.

## Scene 7: History

The user can revisit previous analysis results.

## Scene 8: Automation Test

The user runs a manual automation test that simulates scheduled analysis and stores an execution log.
