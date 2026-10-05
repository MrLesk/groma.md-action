---
id: TASK-4
title: Release the Action with Groma 0.6.2
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-05 05:00'
updated_date: '2026-10-05 05:22'
labels: []
dependencies: []
modified_files:
  - action.yml
  - README.md
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Groma 0.6.2 release requires the public Action to use the new CLI version. The current Action still installs 0.6.0. Complete the post-release checklist without changing the build or publication behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The Action installs Groma 0.6.2 and the README states the same version.
- [ ] #2 Local checks and the Check workflow pass on the exact Action release commit, including current-map and committed-comparison exports.
- [ ] #3 Action v1.0.1 is published and the v1 pointer targets that tested release.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Wait for the Groma 0.6.2 Release workflow and confirm the exact npm package. 2. Update the action.yml pin and README version, using existing tests and the integration Check workflow without adding tests for version text. 3. Commit and push, verify that exact commit in CI, publish Action v1.0.1 with the format-change note, and move v1 to the tested release.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Groma release workflow 37265828827 passed on all five hosts. All 24 expected exact npm versions are visible, and npm view groma.md@0.6.2 version returns 0.6.2. Updated only the installation pin and its README statement. Existing examples already use @v1.

Local npm run check passed all 17 tests on Node 24.11.1; git diff --check passed. Specification and quality review: the root composite Action is the only owner of CLI installation, and the README describes that pin. The diff changes two version strings and no workflow behavior. Existing integration CI covers current-map export and committed comparison, including refusal to execute a PR scanner. No new tests are needed for a version string. The exact commit CI and release publication remain pending.
<!-- SECTION:NOTES:END -->
