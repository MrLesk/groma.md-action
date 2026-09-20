---
id: TASK-2
title: Select an architecture publication theme
status: In Progress
assignee:
  - '@codex'
created_date: '2026-09-20 12:29'
updated_date: '2026-09-20 12:35'
labels: []
dependencies: []
references:
  - >-
    ../groma3/backlog/tasks/task-453 -
    Read-Web-themes-from-architecture-URL-paths.md
modified_files:
  - action.yml
  - prepare.mjs
  - test/prepare.test.mjs
  - .github/workflows/check.yml
  - examples/pages.yml
  - README.md
type: feature
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Repository maintainers need to choose a publication theme in the reusable Action and publish at architecture/{theme}/. The user approved treating output as the website root: output=site and theme=blueprint writes site/architecture/blueprint and Pages uploads site. Theme interpretation belongs to Groma TASK-453, not an Action HTML patch. Groma's release and this Action's version-pin update are explicitly deferred until later.

Scenario: Build a Blueprint architecture website
Given an initialized repository and output set to site
When its workflow runs the Action with theme set to blueprint
Then the export is written under site/architecture/blueprint
And the Action output identifies site as the directory to publish.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The Action accepts theme values auto, light, dark and blueprint, defaulting to Auto as the existing viewer does.
- [ ] #2 The output input and output identify the website root, while the export is written under architecture/{theme}/ inside it.
- [ ] #3 Pages and existing-site examples preserve the theme path when uploading the website root; scanner installation, exclusions and package caching keep their existing behavior.
- [ ] #4 Input tests and CI verify the chosen directory layout; documentation records that path theme selection needs the next Groma release and the later CLI-pin update.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Keep the Action as a delivery adapter. Add theme with default auto; prepare.mjs validates the four current viewer choices and computes <output>/architecture/<theme>. Keep output as the website root and expose the export directory only as an internal step output.
2. Pass the prepared export directory to the existing groma export command. Leave scanner configuration, exclusion matching, scanning and package cache ownership unchanged.
3. Update the complete Pages and existing-site examples to upload the website root. Explain the approved layout, theme precedence, and the explicitly deferred Groma release/pin update.
4. Extend the existing prepare tests rather than creating a second test module. Supported user rule: selected theme determines the nested export path while output still names the root. Detect wrong paths, changed package keys, or invalid theme names accepted as directories. Existing tests cover output and cache only, so add the minimum assertions and one invalid-choice test.
5. Exercise the actual composite in CI using blueprint and verify the snapshot at <output>/architecture/blueprint. Verify the same directory with the locally changed Groma renderer for browser theme selection. Run bun run check and diff/YAML checks; perform the implementer's specification/quality review and the final full-context review before committing only task files.

No automatic release, HTML rewriting, additional theme renderer, or deployment service is introduced.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Validation: seven concurrent preparation tests pass, and all three YAML files parse. The input helper kept website output as the root and selected its architecture/blueprint child. Real scan/export verification found both expected source files and kept exclusions effective. The complete theme selection was exercised using the changed local Groma, because the user explicitly deferred its release and the Action pin update.

Implementer specification/quality review: the four AC are covered by input tests, the prepared layout, existing scan/export fixture verification, and updated usage/release documentation. Input validation runs before scanner config mutation; theme does not enter the package cache key. action.yml owns orchestration, prepare.mjs owns path preparation, Groma owns theme interpretation. No HTML patching or extra deployment behavior was added. Actual composite CI will run after the implementation push.

The full-context review found one example regression: the deployment link still opened the website root. Corrected the Pages example to construct the map URL from the deployed site URL and one shared GROMA_THEME value. No new Action output, redirect, or routing logic is needed. The reviewer otherwise recommended keeping the current ownership, helper and focused tests.

The targeted final-review check confirmed that the nested deployment link is corrected with no regression. YAML parsing and the representative project-site URL check passed. The Groma source implementation is complete as TASK-453; its release and the Action pin remain deferred by the user.
<!-- SECTION:NOTES:END -->
