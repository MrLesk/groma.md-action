---
id: TASK-6
title: Control the reader and checkout used for PR comparisons
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-06 10:35'
updated_date: '2026-10-06 10:39'
labels: []
dependencies: []
references:
  - 'https://github.com/MrLesk/groma.md/pull/113'
modified_files:
  - action.yml
  - README.md
  - examples/pull-request.yml
  - examples/pages.yml
  - .github/workflows/check.yml
type: bug
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Action follows a moving v1 tag but hardcodes its Groma CLI version. Updating the Action can therefore change the architecture reader without a workflow change. Groma PR #113 reproduced this when a newer reader rejected its saved older architecture. Let repositories choose their reader version independently of Action updates; preserve validation of both committed snapshots.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A workflow can select a Groma CLI version independently of the Action reference; omitted input retains the current default.
- [ ] #2 The PR and Pages examples pin their reader version and explain that both revisions must use a readable architecture format.
- [ ] #3 The Action checks verify a default-version build and an explicit-version comparison with the existing source and scanner-isolation assertions.
- [ ] #4 The fork PR workflow keeps the trusted base checked out and fetches the PR commit only as comparison data, with checkout v7 protections enabled.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add groma-version to the composite Action and pass it as a quoted environment value to npm installation. Keep the default at 0.6.5.
2. Pin 0.6.5 in the published examples and explain explicit upgrades and same-reader requirements in README.
3. Extend the existing Check integration flow to select 0.6.6 for its comparison after using the 0.6.5 default for its map. Assert the installed CLI version at each stage. Authority: reproduced implicit-reader upgrade; wrong result: input ignored. Existing unit tests cannot observe installation; reuse the real Action CI instead of source-text tests.
4. Run npm run check, review the small configuration change, and verify the GitHub Check workflow. This is delivery configuration: OKF Markdown and C4 semantics remain owned by Groma, with no new architecture metadata or compatibility reader.

Reproduced additional failure: checkout v7 refuses PR #113 head under pull_request_target (run 37451040362). Change the reusable PR example to check out its base commit and fetch the requested head without checking it out. The exporter already reads both snapshots from Git; it needs no core change. Extend the existing integration setup to return to the before commit before export. Wrong result: comparison accidentally reads the working checkout instead of its requested head. The existing source-diff assertion must still observe the after commit. This stays within the requested permanent fix for other repositories.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation uses the existing install step and scanner cache. The selected version crosses the YAML-to-shell boundary through an environment variable and stays one quoted npm package argument. No model parsing or fallback was added. Own specification/quality review found no blocking issue; all 17 Node tests pass. GitHub integration will exercise both versions before finalization.
<!-- SECTION:NOTES:END -->
