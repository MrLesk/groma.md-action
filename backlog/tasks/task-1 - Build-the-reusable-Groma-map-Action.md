---
id: TASK-1
title: Build the reusable Groma map Action
status: In Progress
assignee:
  - '@codex'
created_date: '2026-09-20 12:02'
updated_date: '2026-09-20 12:14'
labels: []
dependencies: []
references:
  - 'https://github.com/MrLesk/groma.md-action'
modified_files:
  - backlog/config.yml
  - action.yml
  - prepare.mjs
  - package.json
  - test/fixtures/project/groma/index.md
  - test/fixtures/project/groma/project.md
  - test/fixtures/project/groma/scanners.json
  - test/fixtures/project/package.json
  - test/fixtures/project/tsconfig.json
  - test/fixtures/project/src/catalog.ts
  - test/fixtures/project/src/client.js
  - test/fixtures/project/src/skip.generated.js
  - test/fixtures/project/examples/demo.js
  - test/fixtures/project/.gitignore
  - test/prepare.test.mjs
  - test/verify-export.mjs
  - .github/workflows/check.yml
  - examples/pages.yml
  - README.md
  - .gitignore
  - LICENSE
type: feature
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Repository maintainers need one reusable build step that restores their existing Groma scanners, refreshes architecture, and exports a website for their chosen publisher. Build the separate MrLesk/groma.md-action repository in the shared main checkout. The Action must retain Groma as the authority for scanner selection, exclusion matching, and architecture meaning. Automatic initialization, export redaction, and automatic PR-preview hosting are outside this first slice.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 An initialized repository can use the Action to restore all configured scanners at their selected versions, scan, and export one static website directory.
- [ ] #2 The output input selects the export directory and the Action exposes that directory for later workflow steps.
- [ ] #3 The multiline exclude input appends ordered global scan patterns in the CI checkout; omitted or empty input preserves configuration, and all scanner matching stays in Groma.
- [ ] #4 Scanner packages can be restored from a matching cache while architecture is scanned from the current checkout; the Action release uses a tested Groma version.
- [ ] #5 A repository without initialized Groma files fails clearly without creating a Groma project.
- [ ] #6 The dedicated groma.md-action repository contains root Action metadata, usage documentation, a complete main-branch Pages example, and an existing-site integration example.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Implement a composite Action in this repository. It installs published groma.md 0.3.3, prepares the existing groma/ or .groma/ configuration, caches scanner packages by runner, CLI version and selected packages, then calls scanner install/check, scan and export. Only output and exclude are public inputs; output is also a step output.
2. Keep one small Node script for checking initialized project files, appending literal exclusion lines, and emitting the export directory and scanner cache fingerprint. Do not implement exclusion matching or scanner selection here.
3. Add a complete Pages workflow example and an existing-site example. Keep automatic init, PR publishing, redaction, and deployment settings outside the builder.
4. Verification: no existing tests in the new repository. Add isolated concurrent Node tests for the approved input contract: preserve selected scanners/settings and existing patterns; do not rewrite configuration for empty input; honor the selected architecture directory; reject uninitialized projects without creating files. These detect changed scanner selection, lost exclusions, unexpected checkout writes, or accidental init. Use only minimum fixtures under test/fixtures.
5. Exercise published CLI end to end with a small initialized JavaScript/TypeScript fixture. Verify both scanners contribute source to one export, excluded new sources do not appear, nested asset URLs work, and a later scan reflects changed source with packages already installed. Add a GitHub CI smoke job that runs the composite Action on that fixture.
6. Run bun run check in this repository, inspect the Action and example YAML, then perform one cold simplicity review, my own specification/quality reviews, and the final full-context review. Create/push only this repository's work on main. No changes to ../groma3 are planned.

Architecture: the Action is a CI delivery adapter. Existing Groma scanner modules own the configuration and evidence rules; existing export owns the browser snapshot. Ordinary OKF Markdown and its C4 levels are unchanged. The approach uses configured package identities rather than language-specific Action logic.

The cache fingerprint test covers the approved package-cache rule: changing a configured package source must invalidate the cache, while changing source exclusions must not select different packages. No prior coverage exists in this new Action repository.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Focused checks passed: five concurrent Node tests, Ruby YAML parsing for Action/CI/Pages files, and a real published Groma 0.3.3 mixed JavaScript/TypeScript scan/export. The exported snapshot contains src/catalog.ts and src/client.js and omits configured generated files plus Action-excluded examples. Browser inspection loaded the published viewer at /site/architecture/ and showed its hierarchy and map controls. No files in ../groma3 were changed.

Cold simplicity review: no blockers; kept the two-file production split and focused tests. Applied its naming suggestion by renaming the internal hash output to scanner-key, then reran bun run check (5/5) and git diff --check. Implementer specification review: all six AC have local evidence; remote CI will exercise the composite after the initial push. Quality review traced action.yml -> prepare.mjs -> configured CLI -> exported directory, confirmed inputs are passed through environment variables, version/config authority stays in Groma, exclusion order/settings are preserved, and tests detect the documented wrong outcomes without freezing UI prose. Warm-package smoke: added src/added.js after the first export; the next scan created its component and the refreshed snapshot included it. No further task-scoped deletion or abstraction is needed.

Final full-context review found no blockers and recommended keeping the current two-file production structure, one Groma authority for scanner semantics, package-only caching, and caller-owned publication. No material recommendations need a product decision. Public repository created as MrLesk/groma.md-action. Initial implementation push will run the actual composite on GitHub before task finalization.
<!-- SECTION:NOTES:END -->
