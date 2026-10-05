---
id: TASK-5
title: Release the Action with Groma 0.6.5
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-05 11:00'
updated_date: '2026-10-05 11:35'
labels: []
dependencies: []
modified_files:
  - action.yml
  - README.md
type: bug
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Alex requested adoption of the Groma hotfix in the Action and its examples. The current major Action tag installs Groma 0.6.2 and misses the latest CLI fixes. Both published example workflows already use @v1, so updating the tested major-tag release carries the hotfix to them without changing their build or publication behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The Action installs published Groma 0.6.5 and the README states the same version.
- [ ] #2 Local checks and the Check workflow pass on the exact Action release commit, including current-map and committed-comparison exports.
- [ ] #3 Action v1.0.2 is published and both example workflows use the v1 tag pointing to that tested release.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Wait for Groma 0.6.5 publication and verify npm metadata. 2. Update the action.yml version pin and its README, preserve the examples that already use @v1, and run npm run check. Existing tests cover build inputs and publication; the real Check workflow covers the CLI current-map and comparison exports, so add no test for version text. 3. Commit and push, verify Check on the exact commit, publish Action v1.0.2 and move v1 to that tested release. No architecture, OKF metadata, C4 semantics or model compatibility changes are needed.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Groma Release run 37300984928 passed. All five platform packages and the wrapper report version 0.6.5 on npm, and the GitHub release contains five binaries plus SHA256SUMS. Updated only the CLI pin and README version; both example workflows already use @v1. No test was added for version text: existing checks and the real Check workflow verify current-map and committed-comparison exports.

npm run check passed all 17 tests under Node 24.11.1; log /private/tmp/groma-action-1.0.2-check.log. git diff --check passed. The implementer reviewed the complete two-line change: the install step owns the exact published CLI version, and README describes that same version. Build and publication behavior, scanner configuration and examples are unchanged. The Check workflow on the release commit remains the final verification before publishing v1.0.2.
<!-- SECTION:NOTES:END -->
