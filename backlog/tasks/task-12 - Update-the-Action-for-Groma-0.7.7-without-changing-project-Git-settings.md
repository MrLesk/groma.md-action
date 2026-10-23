---
id: TASK-12
title: Update the Action for Groma 0.7.7 without changing project Git settings
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-23T17:58:00Z'
updated_date: '2026-10-23T19:07:00Z'
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
  - test/workflow-node-trust.test.mjs
  - publish/action.yml
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

Final code-review regression: Action-owned Node downloads must reject the incident certificate even when inherited OpenSSL trust contains it, while native Git retains caller policy. The reviewer reproduced a connection accepted through the inherited store because NODE_EXTRA_CA_CERTS is additive. Existing bundle-content and npm tests do not exercise this Node HTTPS path. Add one network test with private-root success, incident rejection and an unfiltered-store control. Scope filtered OpenSSL settings to third-party Node steps; scripts running the pinned patched Node use its bundled roots plus filtered private authorities. Keep Git and generic TLS settings out of GITHUB_ENV.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Cold simplicity review found no blockers and confirmed that separate Node setup and npm installation preparation have clear responsibilities. Its stale native Git ownership comment was corrected in the shared module and all inline copies. Implementer specification/quality review: public setup emits only Node settings, npm installation has child-only settings and no GITHUB_ENV export, and published CLI pin/real smoke are gated on Groma0.7.7. The repository own checkout/publication trust path remains strict and separate. Existing checks pass all58tests; the public bootstrap regression fails before the fix because it inspects a caller Git setting, and passes after setup stops doing so. The released-CLI smoke matrix now covers Windows Linux and macOS with Bash selected explicitly.

Full-context complexity review found no blockers. Accepted its scoped simplification: installation settings are already Node/npm-only, so installGroma no longer filters Git keys or removes the caller GIT_SSL_NO_VERIFY value from its child environment. Its npm command still explicitly enables strict SSL. Updated the existing command-observation test to prove inherited Git values survive. Public composites preserve caller Git policy; example workflows explicitly choose their own strict checkout policy.

Final full local Action suite after the accepted simplification:58 passed,0 failed. No source changes followed it. Publication and exact released-CLI three-platform smoke remain gated until Groma0.7.7 is available.

Final workflow portability review found that the old Linux-only comparison smoke used sed -i, which is not portable to macOS. Replaced that fixture edit with Node file I/O for the newly required three-platform smoke. No product behavior, test assertions or timeout changed.

Relevant final code-review P1 reproduced with the installed Node24.13.0: inherited incident OpenSSL trust accepted the HTTPS request, so the new rejection check failed before the fix. Patched Node26.12.1 independently rejects that incident chain. prepareWorkflowTrust now separates Node workflow settings from OpenSSL step settings. Both public composites export only Node settings. setup-node/cache/Pages Node actions receive the filtered CA file and empty CA directory within their own steps; scripts use the pinned patched Node bundled store plus filtered private authorities. No native Git or generic TLS override enters project commands. The setup regression passes with the older runner Node24 after the fix. Full Action suite passes all60 tests with Node26.12.1, including private-root success and incident rejection for both Node entry paths. Specification and quality re-review is limited to the P1 and these changes: the two trust scopes have named owners, original settings survive, and no preload module, caller configuration repair, compatibility layer or new dependency was added.
<!-- SECTION:NOTES:END -->
