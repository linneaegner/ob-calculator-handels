# Agent instructions

## Pull requests

**Never auto-merge.** A human must review and merge every PR.

When opening a PR:

1. Target the repository default branch unless the task says otherwise.
2. Open as a **draft** PR.
3. Push your branch and stop — do not merge, approve, enable GitHub auto-merge, or mark the PR ready for review unless the user explicitly asks.
4. Do not use `merge_pull_request` or equivalent GitHub/GitLab APIs to merge your own work.

If you need to override this for a one-off task, the user must say so explicitly in the prompt (e.g. "merge when CI passes"). Default is always human review.
