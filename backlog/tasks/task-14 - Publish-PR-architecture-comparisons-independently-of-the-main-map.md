---
id: TASK-14
title: Publish PR architecture comparisons independently of the main map
status: Done
assignee:
  - '@codex'
created_date: '2026-11-21T15:15:00Z'
updated_date: '2026-11-21T15:21:00Z'
labels: []
dependencies: []
references:
  - https://github.com/MrLesk/Backlog.md/actions/runs/44915994922
  - publish/publish.mjs
  - action.yml
modified_files:
  - publish/publish.mjs
  - publish/action.yml
  - action.yml
  - prepare.mjs
  - comparison.mjs
  - examples/pages.yml
  - examples/pull-request.yml
  - .github/workflows/check.yml
  - README.md
  - test/prepare.test.mjs
  - test/publish.test.mjs
  - test/verify-export.mjs
  - test/verify-publication.mjs
type: bug
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Backlog.md successfully built PR comparisons but skipped deployment and comments when the default-branch scan could not install a work source. The Action should preserve the previous map and deliver the built PR comparison at its existing URL.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The default map example exports committed architecture and the existing scan mode stays available.
- [x] #2 The shared publisher updates a PR preview independently of default-branch scans, preserves existing content and supports the established Backlog.md paths.
- [x] #3 Independent publish jobs queue across PRs and default-branch updates, and keep the existing trust and stale-revision checks.
- [x] #4 Validate the failed-main-scan case against Backlog.md and verify the second playground with codex-hackathons.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add committed-map mode to the build Action and make it the default example.
2. Reuse the publisher with explicit opt-in to the existing PR URL layout, and queue publication.
3. Exercise the real compare, publisher and retained site against a failed Backlog main scan and against codex-hackathons.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Backlog.md proof used the exact published Groma 0.7.8 and Node 26.12.1 runtime. The live scan failed restoring Backlog.md. The comparison for PR #1240 matched the hosted artifact, published through the shared store and link steps at /comparison/pr-1240/auto/, and retained all 25 prior files byte-for-byte. Codex Events compared the real photo-gallery change in an isolated Git checkout and published at /pr-42/architecture/auto/ after its live scan failed on a missing scanner. Both local sites returned HTTP 200. Backlog.md production Pages accepts main only, and its site was preserved.

The Action release smoke uses a committed Backlog work-source configuration and deliberately fails a live scan, then runs the publisher against a retained map. Local workflow-equivalent smoke and 29 focused tests passed with Node 26.12.1. The complete local test suite has the same four native-Git TLS fixture failures on both the baseline and this change.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
The Action exports committed maps without project plugins, queues each Pages publication, and updates a PR preview independently with either the standard or the existing comparison URL layout. Both named projects proved publication after a failed scan in isolated Git and HTTP environments.
<!-- SECTION:FINAL_SUMMARY:END -->
