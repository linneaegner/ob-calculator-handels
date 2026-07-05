#!/usr/bin/env bash
# Apply no-auto-merge settings to every personal repo for the authenticated GitHub user.
#
# Requires a token with repo administration scope (classic: repo; fine-grained: Administration).
# Usage:
#   ./scripts/configure-github-no-automerge-all-repos.sh
#   DRY_RUN=1 ./scripts/configure-github-no-automerge-all-repos.sh
#   SYNC_AGENT_FILES=1 ./scripts/configure-github-no-automerge-all-repos.sh
#
# SYNC_AGENT_FILES clones each repo and opens a PR adding AGENTS.md + .cursor/rules when missing.

set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
SYNC_AGENT_FILES="${SYNC_AGENT_FILES:-1}"
OWNER="${GITHUB_OWNER:-$(gh api user --jq .login)}"
POLICY_DIR="$(cd "$(dirname "$0")/../.github/agent-policy" && pwd)"
BRANCH_NAME="cursor/add-no-automerge-policy-2f13"

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

echo "GitHub account: $OWNER"
echo "DRY_RUN=$DRY_RUN SYNC_AGENT_FILES=$SYNC_AGENT_FILES"
echo

configure_repo_settings() {
  local repo="$1"
  local default_branch="$2"

  echo "==> $repo (branch: $default_branch)"

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "    [dry-run] PATCH allow_auto_merge=false"
    echo "    [dry-run] PUT branch protection: require 1 PR review"
    return 0
  fi

  if ! gh api -X PATCH "repos/$repo" -f allow_auto_merge=false >/dev/null; then
    echo "    warning: could not disable allow_auto_merge (skipped)" >&2
  else
    echo "    disabled allow_auto_merge"
  fi

  local payload
  payload="$(jq -n \
    --arg branch "$default_branch" \
    '{
      required_status_checks: null,
      enforce_admins: false,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        required_approving_review_count: 1
      },
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false
    }')"

  if gh api -X PUT "repos/$repo/branches/$default_branch/protection" --input - <<<"$payload" >/dev/null 2>&1; then
    echo "    branch protection: require 1 approving review on $default_branch"
  else
    echo "    warning: could not set branch protection (needs admin + public repo or GitHub Pro for private)" >&2
  fi
}

policy_files_present() {
  local dir="$1"
  [[ -f "$dir/.cursor/rules/cloud-agent-pr-policy.mdc" ]] \
    && grep -q "Never auto-merge" "$dir/AGENTS.md" 2>/dev/null
}

sync_agent_policy_files() {
  local repo="$1"
  local name="${repo#*/}"
  local workdir
  workdir="$(mktemp -d)"

  trap 'rm -rf "$workdir"' RETURN

  if ! gh repo clone "$repo" "$workdir" -- --depth 1 -q; then
    echo "    warning: could not clone $repo (skipped file sync)" >&2
    return 0
  fi

  if policy_files_present "$workdir"; then
    echo "    agent policy files already present"
    return 0
  fi

  mkdir -p "$workdir/.cursor/rules"
  if [[ ! -f "$workdir/AGENTS.md" ]]; then
    cp "$POLICY_DIR/AGENTS.md" "$workdir/AGENTS.md"
  elif ! grep -q "Never auto-merge" "$workdir/AGENTS.md"; then
    printf '\n%s\n' "$(cat "$POLICY_DIR/AGENTS.md")" >> "$workdir/AGENTS.md"
  fi
  cp "$POLICY_DIR/cloud-agent-pr-policy.mdc" "$workdir/.cursor/rules/cloud-agent-pr-policy.mdc"

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "    [dry-run] would open PR with agent policy files"
    return 0
  fi

  pushd "$workdir" >/dev/null
  git checkout -b "$BRANCH_NAME"
  git add AGENTS.md .cursor/rules/cloud-agent-pr-policy.mdc
  git commit -m "Add cloud agent policy: no auto-merge PRs

Require draft PRs and human review. GitHub branch protection should also
require an approving review before merge."
  git push -u origin "$BRANCH_NAME"

  if gh pr view "$BRANCH_NAME" --json url --jq .url >/dev/null 2>&1; then
    echo "    PR already exists for $BRANCH_NAME"
  else
    gh pr create \
      --base "$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)" \
      --head "$BRANCH_NAME" \
      --title "Add cloud agent policy: no auto-merge PRs" \
      --body "Adds \`AGENTS.md\` and \`.cursor/rules/cloud-agent-pr-policy.mdc\` so Cursor cloud agents open draft PRs and never merge automatically.

Run from [passbyte-kalkylator](https://github.com/linneaegner/passbyte-kalkylator) account setup script." \
      --draft
    echo "    opened draft PR"
  fi
  popd >/dev/null
}

mapfile -t REPOS < <(
  gh repo list "$OWNER" --source --limit 1000 --json nameWithOwner,isArchived,defaultBranchRef \
    | jq -r '.[] | select(.isArchived == false) | [.nameWithOwner, .defaultBranchRef.name] | @tsv'
)

if [[ "${#REPOS[@]}" -eq 0 ]]; then
  echo "No repositories found for $OWNER"
  exit 1
fi

for entry in "${REPOS[@]}"; do
  repo="${entry%%$'\t'*}"
  default_branch="${entry#*$'\t'}"
  configure_repo_settings "$repo" "$default_branch"
  if [[ "$SYNC_AGENT_FILES" == "1" && "$repo" != "$OWNER/passbyte-kalkylator" ]]; then
    sync_agent_policy_files "$repo"
  fi
  echo
done

echo "Done. All repos should now:"
echo "  - have allow_auto_merge disabled"
echo "  - require at least 1 approving review on the default branch (when branch protection is available)"
echo
echo "To allow auto-merge on a specific repo later, disable or relax branch protection in GitHub Settings → Branches."
