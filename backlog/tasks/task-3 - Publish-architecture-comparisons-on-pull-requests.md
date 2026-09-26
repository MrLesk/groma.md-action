---
id: TASK-3
title: Publish architecture comparisons on pull requests
status: Done
assignee:
  - '@codex'
created_date: '2026-09-26 16:25'
updated_date: '2026-09-26 17:20'
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
- [x] #1 An initialized repository can export two committed revisions without scanning or installing repository-selected scanners; ordinary single-checkout builds retain their scan/export flow.
- [x] #2 A documented complete public-repository workflow compares the PR merge base with its actual head, publishes a separate retained preview, and posts or updates one comment with component and relationship counts plus a direct comparison link.
- [x] #3 PR updates refresh the same comment and preview without deleting other published previews; publication runs separately from read-only comparison building and does not execute PR-supplied scripts.
- [x] #4 The workflow reports an empty comparison accurately, makes the compared commits visible, and never silently publishes a private repository or replaces an existing unrelated Pages site.
- [x] #5 An implementation PR has passing automated checks, and a permanent demo PR shows a real code and architecture change through the documented workflow with a verified public comparison link.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
This permanent draft mirrors the real automatic PR comparison feature from PR #1. Its fixed base preserves the original source with curated Groma records. The head contains the actual implementation and its corresponding architecture. Keep this PR open and unmerged so the feature diff remains available.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
All original implementation files initially matched cd53e54 byte for byte. The baseline preserves original source from 7090157. Demo documentation now links to groma.md-action PR #2. The public workflow succeeded in run 36258622506; bot comment 5848261852 reports two added and one modified component, plus three added relationships. Browser verification opened the real prepare.mjs comparison-input diff. Tests pass: 17/17. Final task record and implementation delivery live in PR #1.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Permanent demonstration of the actual PR-comparison feature: prepare.mjs changes, comparison.mjs and publish/publish.mjs additions, committed Groma architecture and a working public comparison.
<!-- SECTION:FINAL_SUMMARY:END -->
