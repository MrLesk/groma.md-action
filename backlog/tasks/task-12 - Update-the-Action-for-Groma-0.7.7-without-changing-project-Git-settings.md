---
id: TASK-12
title: Update the Action for Groma 0.7.7 without changing project Git settings
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-23T17:58:00Z'
updated_date: '2026-10-23T18:10:00Z'
labels: []
dependencies: []
references:
  - action.yml
  - prepare-trust.mjs
  - trust-bootstrap.cjs
  - .github/workflows/check.yml
modified_files:
  - test/trust.test.mjs
  - trust-bootstrap.cjs
  - prepare-trust.mjs
  - action.yml
  - .github/workflows/check.yml
  - .github/workflows/groma-demo.yml
  - examples/pages.yml
  - examples/pull-request.yml
  - README.md
  - CONTRIBUTING.md
type: bug
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Action must adopt the coordinated Groma hotfix while keeping its Node/npm download protections scoped to its own operations. Its public composite bootstrap currently exports native Git trust overrides that would keep HTTPS proxies blocked even after the CLI fix.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The Action default and documented examples use published Groma0.7.7 and npm12.2.1 for installation.
- [ ] #2 Public Action setup and Groma installation do not export Git or generic native TLS overrides into later project commands; native Git proxy and CA settings remain unchanged.
- [ ] #3 The Action check suite and real CLI export smoke pass on Windows Linux and macOS before one stable patch release advances v1.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Keep the repositories own hosted checkout and release trust preparation. Narrow the public composite setup bootstrap to Node certificate settings only and stop exporting npm installation child settings to the workflow. This fixes the reproduced public Action environment problem without replacing user Git configuration or adding fallback behavior. Update the existing bootstrap test to assert no Git or generic native TLS override is exported and keep existing owned-download tests. Update CLI and npm patch pins, run tests, then verify the real released CLI smoke on three platforms and publish one Action release.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Cold simplicity review found no blockers and confirmed that separate Node setup and npm installation preparation have clear responsibilities. Its stale native Git ownership comment was corrected in the shared module and all inline copies. Implementer specification/quality review: public setup emits only Node settings, npm installation has child-only settings and no GITHUB_ENV export, and published CLI pin/real smoke are gated on Groma0.7.7. The repository own checkout/publication trust path remains strict and separate. Existing checks pass all58tests; the public bootstrap regression fails before the fix because it inspects a caller Git setting, and passes after setup stops doing so. The released-CLI smoke matrix now covers Windows Linux and macOS with Bash selected explicitly.

Full-context complexity review found no blockers. Accepted its scoped simplification: installation settings are already Node/npm-only, so installGroma no longer filters Git keys or removes the caller GIT_SSL_NO_VERIFY value from its child environment. Its npm command still explicitly enables strict SSL. Updated the existing command-observation test to prove inherited Git values survive. Public composites preserve caller Git policy; example workflows explicitly choose their own strict checkout policy.

Final full local Action suite after the accepted simplification:58 passed,0 failed. No source changes followed it. Publication and exact released-CLI three-platform smoke remain gated until Groma0.7.7 is available.

Final workflow portability review found that the old Linux-only comparison smoke used sed -i, which is not portable to macOS. Replaced that fixture edit with Node file I/O for the newly required three-platform smoke. No product behavior, test assertions or timeout changed.
<!-- SECTION:NOTES:END -->
