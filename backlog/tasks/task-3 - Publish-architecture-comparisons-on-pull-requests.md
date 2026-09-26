---
id: TASK-3
title: Publish architecture comparisons on pull requests
status: Done
assignee:
  - '@codex'
created_date: '2026-09-26 16:25'
updated_date: '2026-09-26 17:22'
labels: []
dependencies: []
references:
  - groma-github-action
  - prepare
  - maintainer
  - groma-cli
  - comparison
  - publish
  - github-publication
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
  - groma/project.md
  - groma/index.md
  - AGENTS.md
  - groma/scanners.json
  - groma/systems/groma-github-action/system.md
  - groma/systems/groma-github-action/components/prepare.md
  - groma/actors/maintainer.md
  - groma/externals/groma-cli.md
  - groma/relationships.md
  - .github/workflows/groma-demo.yml
  - groma/systems/groma-github-action/components/comparison.md
  - groma/systems/groma-github-action/components/publish.md
  - groma/externals/github-publication.md
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
- [x] #5 The implementation PR has passing automated checks, and a permanent draft PR in groma.md-action shows this feature’s actual source changes against a fixed before branch, with a verified bot comment and public before/after comparison.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Extend the existing build Action with explicit revision inputs and comparison summary outputs, using Groma as the only comparison authority. The two-job pull_request_target workflow exports the exact merge base and PR head in a read-only job, then a separate publisher retains previews on a dedicated branch, deploys Pages, and updates one marked comment. The complete recipe supports public repositories with dedicated Pages; existing-site users retain their publisher and use the builder outputs. Pin Groma 0.6.0. Keep the real implementation in PR #1 and a permanent draft of its actual source changes in PR #2, against a fixed before branch. Add committed Groma architecture to both demo snapshots through the CLI. The demo workflow is pinned to reviewed feature code and limited to that fixed base branch. Verify exact source provenance, hosted publication, the bot comment, and browser source inspection.

Test authority and coverage: AC1/3 require comparison export without repository-selected scanner hooks. A helper test observes disabled selections and exact restoration on success/failure. AC2/4 require correct counts and exact commit identities; mixed changed/unchanged facts detect inflated counts and empty-state mistakes. AC3/4 require one comment, preservation of other previews and dedicated public Pages; publisher tests observe those results. Existing preparation tests cover input/config mutation; extensions check paired revisions and exclusion rejection. Verify merge-base selection through diverged Git history and the real workflow. No new tests are needed for the demo link and architecture documentation correction; use source provenance checks, two stable rescans, existing tests and the live browser.

Review the demo model against OKF and C4: readable Markdown carries meaning and links; Groma owns identity, source ownership and map interpretation. Components identify responsibilities supported by the actual JavaScript source. Do not invent container evidence or extra scanner support for YAML. Complete cold simplicity, implementer specification/quality and final full-context complexity reviews.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
The build Action now supports paired from/revision inputs, exports committed architecture with repository-selected scanner hooks disabled, and writes counts from Groma comparison facts. The separate publisher retains each PR preview on an owned branch, deploys dedicated public Pages, and updates one bot comment. Revision/from URL parameters solve the reproduced stale-page repeat-visit failure. Ordinary scanner export remains supported.

Validation: all 17 Node tests pass. GitHub CI exercises real Groma 0.6.0 scanner export and committed comparison, with a controlled local scanner module proving the comparison path does not execute it. Groma 0.6.0 release and npm publication succeeded. Existing publisher tests verify single-comment updates, preserving other previews, private-repository rejection and dedicated-Pages ownership. Prior live publication also proved comment replacement and fresh links.

Correct permanent demo: https://github.com/MrLesk/groma.md-action/pull/2. The fixed before branch d4dd5c3 preserves every original source file from 7090157. The initial after snapshot d6edcb5 contains all 14 implementation patch files byte for byte from cd53e54, plus curated Groma records. The README and task records are then updated to point at this actual feature demo. No runtime code was changed for the correction. The previously prepared shop example was rejected because it did not show this feature.

Architecture: ordinary OKF Markdown carries descriptions and links; Groma interprets existing identity, source ownership and relationship metadata. The three C4 components are project preparation, committed comparison export and PR preview publication. The JavaScript scanner does not establish GitHub Action job/container boundaries or own YAML. Components remain in the supported unidentified placement; GitHub shows the actual YAML changes. Two consecutive rescans preserved all curated records and ownership. This is a demo of current supported behavior, with no new scanner or model capability.

Cold simplicity review passed for both the implementation and corrected demo. Own specification and quality review traced workflow inputs → committed export → artifact → retained Pages site → review comment → source diff. Demo check runs 36258619847 and 36258622482 passed, and publication run 36258622506 succeeded. Bot comment 5848261852 reports +2/~1/0 components and +3/0/0 relationships with exact commits. Public browser verification opened the changed descriptions and the real prepare.mjs +7/-5 source diff, including paired revision validation. No blocking findings remain; final documentation sync and full-context review pending.

Permanent demo README now links to actual feature PR #2.

Final full-context complexity review passed with no blocking findings or architecture changes. Demo head c1005a5 passed check runs 36258704299/36258706327 and publication run 36258705552. The same bot comment, 5848261852, now links to c1005a5 and fixed merge base d4dd5c3. Browser verification of that exact updated URL confirmed the visible map, hierarchy counts and source ownership. The rejected shop PR was closed, its README redirects to the actual feature demo, and implementation PR #1 links to demo PR #2. Runtime source and tests in the corrected demo remain identical to the implementation.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added automatic committed before/after comparisons, retained GitHub Pages previews and one updated PR comment. Real implementation: groma.md-action PR #1. Permanent actual-feature demo: PR #2, based on fixed original source and showing prepare.mjs modified plus comparison.mjs and publish/publish.mjs added. Verified 17 tests, real CLI CI, exact source provenance, successful public publication, same-comment updates and browser source inspection. All required reviews passed. No compatibility or additional scanner behavior was introduced.
<!-- SECTION:FINAL_SUMMARY:END -->
