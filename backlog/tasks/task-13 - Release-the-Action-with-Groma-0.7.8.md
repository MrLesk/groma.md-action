---
id: TASK-13
title: Release the Action with Groma 0.7.8
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-25T19:08:00Z'
updated_date: '2026-10-25T19:09:00Z'
labels: []
dependencies: []
references:
  - 'https://github.com/MrLesk/groma.md/releases/tag/v0.7.8'
  - action.yml
  - .github/workflows/check.yml
modified_files:
  - action.yml
  - README.md
  - CONTRIBUTING.md
  - .github/workflows/check.yml
type: chore
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Groma release checklist requires the Action default to adopt each successfully published CLI hotfix. This release carries the component-move and Unicode-ID fixes from Groma 0.7.8.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The Action default, README and release checklist use Groma 0.7.8, and real CLI smoke checks require that version.
- [ ] #2 The local check suite and exact-candidate Windows, Linux and macOS checks and real CLI smoke pass after Groma 0.7.8 is published.
- [ ] #3 One stable Action patch release is published from the tested commit and its release workflow advances v1 after all checks pass.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update the existing Groma CLI version pin, README and concrete release checklist from 0.7.7 to 0.7.8. Update the existing real export/comparison smoke commands to require 0.7.8; keep their scenarios, trust boundaries, arguments and assertions unchanged.
2. No new tests: the supported release rule comes from groma.md CONTRIBUTING.md and this repository release checklist. The concrete failure would be an Action release that still installs the prior CLI or cannot export/compare using the published hotfix. Existing local checks and the three-platform real CLI smoke already detect that flow; changing their selected protocol version closes the current release gap without another harness.
3. Run npm run check with the declared Node/npm tools. After npm confirms Groma 0.7.8, publish this one-task candidate PR and verify all exact-commit checks, including the real export/comparison matrix. Perform own specification/quality review for this small pin update.
4. Merge the tested candidate, confirm the merge tree matches it, create one stable v1.2.4 GitHub Release from that commit, verify the release-published Check workflow and v1 pointer, and complete Marketplace publication if the UI allows it. Do not manually push tags or alter trust/runtime behavior.

Prepare the version-pin PR as a draft while CLI publication runs. The existing workflow explicitly skips real npm smoke for draft preparation. Mark it ready only after npm confirms 0.7.8, then verify the exact candidate including the real smoke matrix.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Local npm run check passed all 62 tests with Node 26.12.1 and npm 12.2.1; git diff --check passed. This small update changes only the CLI version pin, README/checklist versions and the existing smoke commands selected CLI version. No assertions, runtime logic, trust policy or scenarios changed. Implementer specification/quality review of the pin change found no blocker; exact-candidate CI and publication are still pending. No new tests or separate architecture/simplicity agents are needed for this constant-and-documentation update.
<!-- SECTION:NOTES:END -->
