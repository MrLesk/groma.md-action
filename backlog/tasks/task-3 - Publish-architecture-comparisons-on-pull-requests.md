---
id: TASK-3
title: Publish architecture comparisons on pull requests
status: In Progress
assignee:
  - '@codex'
created_date: '2026-09-26 16:25'
updated_date: '2026-09-26 16:44'
labels: []
dependencies: []
documentation:
  - README.md
modified_files:
  - action.yml
  - prepare.mjs
  - comparison.mjs
  - publish/action.yml
  - publish/publish.mjs
  - examples/pull-request.yml
  - test/verify-export.mjs
  - test/comparison.test.mjs
  - test/publish.test.mjs
  - test/prepare.test.mjs
  - README.md
  - test/fixtures/project/groma/scanners.json
  - .github/workflows/check.yml
priority: high
type: feature
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
PR reviewers need one automatic comment that opens the architecture and owned-source changes introduced by a pull request. Alex approved a public, GitHub-hosted first version, committed architecture as the comparison authority, and a permanent public demo PR using the same workflow. The Action remains a delivery adapter over Groma comparison facts; OKF Markdown and C4 boundaries do not change.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 An initialized repository can export two committed revisions without scanning or installing repository-selected scanners; ordinary single-checkout builds retain their scan/export flow.
- [ ] #2 A documented complete public-repository workflow compares the PR merge base with its actual head, publishes a separate retained preview, and posts or updates one comment with component and relationship counts plus a direct comparison link.
- [ ] #3 PR updates refresh the same comment and preview without deleting other published previews; publication runs separately from read-only comparison building and does not execute PR-supplied scripts.
- [ ] #4 The workflow reports an empty comparison accurately, makes the compared commits visible, and never silently publishes a private repository or replaces an existing unrelated Pages site.
- [ ] #5 An implementation PR has passing automated checks, and a permanent demo PR shows a real code and architecture change through the documented workflow with a verified public comparison link.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Extend the existing build Action with explicit revision inputs and comparison summary outputs, using Groma as the only comparison authority. Add a complete two-job pull_request_target workflow: a read-only job fetches the exact PR commits and exports; a separate publisher stores previews on a dedicated branch, deploys that branch through Pages, then updates one marked PR comment. Retain previews after closure. Use public repositories with a dedicated Pages site for this complete recipe; existing-site users retain their publisher and use the comparison builder outputs. Pin a published CLI containing TASK-480. Build a small permanent demo repository with committed C4 architecture and a draft PR moving receipt delivery to a worker. Tests extend the current Node suite for endpoint resolution, summary counts, comment replacement, and publication preservation: these catch wrong PR baselines, inflated counts, duplicate comments, and deletion of other previews. Verify the actual hosted workflow, its update path, and the browser link before finalization. Required reviews: cold simplicity, implementer specification/quality, final full-context complexity.

Before tests: comparison export must not execute repository-selected outline hooks (AC1/3); add a direct helper test that observes empty scanner selections during export and exact restoration on success/failure. Summary tests use changed and unchanged facts to catch inflated counts and empty-state mistakes (AC2/4). Publisher tests catch duplicate comments, lost unrelated previews, invalid artifact counts, and accepting a private or existing unrelated Pages site (AC3/4). Existing prepare tests cover input/config mutation; extend them for paired revisions and exclusion rejection. Merge-base behavior will be checked against a diverged Git history and through the real demo workflow, without a unit test that merely repeats Git.

Add one integration check to the existing CI fixture after its scan/export: commit before/after source revisions, configure a local scanner module that leaves a marker if loaded, invoke the actual comparison Action, and assert the exported modified-component fact plus absence of the marker. The helper unit test cannot detect a future Groma release changing where scanner configuration is loaded; this closes that concrete AC1/3 gap at the published CLI boundary.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Cold simplicity review passed: the reviewer traced build → scanner-hook-free export → Groma counts → retained Pages branch → one updated comment and found no material simplification or defect. Local Node checks pass 17 tests. Upgraded the existing scanner fixture to the current 0.2.0 configuration required by Groma 0.6.0.

Implementation PR: https://github.com/MrLesk/groma.md-action/pull/1. Permanent draft demo: https://github.com/MrLesk/groma.md-demo/pull/1. Demo code test passes and local current-Groma export reports components added=2 modified=1 removed=1; relationships added=2 modified=0 removed=1. Groma 0.6.0 release prerequisites are still building Windows scanners; initial Action CI failures are solely npm version unavailable, to be rerun after publication.

Implementer specification review: AC1–4 map directly to the two Action entry points, documented workflow, and focused checks; AC5 awaits public deployment. Quality review traced inputs → CLI export → JSON counts → retained branch → Pages → comment; no blocking code defect found. Demo browser verification confirmed the changed-only hierarchy, counts, readable Checkout before/after text, and the exact +3/-3 source diff. Demo cold simplicity review passed. Existing Groma limitation: an authored relationship to a deleted source remains as an unresolved Markdown row, absent from the current map; changing core relationship deletion is outside scope.

Final full-context complexity review passed; corrected README input/output wording. Actual CLI regression proof passed against the release source: direct export executed a controlled local scanner marker, while exportComparison suppressed it and still exported the modified-source diff. The CI fixture now uses a valid scanner manifest to exercise that same boundary.
<!-- SECTION:NOTES:END -->
