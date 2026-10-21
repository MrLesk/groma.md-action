---
id: TASK-11
title: Patch runtime trust and refresh Action release tooling
status: In Progress
assignee:
  - '@codex'
created_date: '2026-10-21T13:05:00Z'
updated_date: '2026-10-21T15:04:00Z'
labels: []
dependencies: []
modified_files:
  - .github/workflows/check.yml
  - .github/workflows/groma-demo.yml
  - CONTRIBUTING.md
  - README.md
  - action.yml
  - comparison.mjs
  - examples/pages.yml
  - examples/pull-request.yml
  - package.json
  - prepare-trust.mjs
  - publish/action.yml
  - publish/publish.mjs
  - test/fixtures/certificate-trust/README.md
  - test/fixtures/certificate-trust/compromised-cas.json
  - test/fixtures/certificate-trust/incident-server-aaa.pem
  - test/fixtures/certificate-trust/incident-server-emudhra.pem
  - test/fixtures/certificate-trust/registry-ca.pem
  - test/fixtures/certificate-trust/registry-server-key.pem
  - test/fixtures/certificate-trust/registry-server.pem
  - test/trust.test.mjs
  - trust-bootstrap.cjs
priority: high
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The October 2026 CA compromise affects the Action and workflow network steps before the Groma CLI can run. Recover the unpublished security hotfix after workspace loss, preserve custom/private CA and npm configuration, and prepare a locally verified release without bypassing the unavailable repository installation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The Action and all workflow examples use patched Node/npm and current Action releases, with default Groma 0.7.4.
- [x] #2 Trust preparation excludes all twelve incident SPKIs while preserving private roots, strict TLS, inherited Git configuration and native npm custom CA configuration.
- [x] #3 Behavior/security tests and all six YAML files validate under patched Node; release instructions describe GitHub Release/Marketplace and the tested v1.2.2 major-tag move.
- [ ] #4 One reviewable PR contains the recovered hotfix, with hosted checks, published Groma smoke and critical review required before release.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Read the project and Backlog workflow guidance and recover pinned runtime/key/fixture inputs. 2. Add offline CA filtering and strict npm setup, then wire it before workflow network steps and update runtime/action/CLI versions. 3. Add meaningful security/compatibility regressions, validate Node tests and six YAML files, and document coordinated release. 4. Finalize TASK-11 and commit locally without attempting remote writes.

5. Publish the reviewed tree after repository access is granted, fix hosted portability failures, and add the approved release-published v1 advancement after read-only checks and real Groma smoke.

6. Close the demonstrated Git URL-specific sslVerify override in workflow and publisher HTTPS targets; prove both incident paths are rejected with an inherited exact-URL false setting, preserve auth/indexed settings, then rerun hosted gates.

7. Preserve native npm exclusive CA policy with a distinct filtered npm bundle, resolving precedence through npm own configuration loader. Prove a separately trusted system authority cannot widen a configured private-only npm CA, then rerun hosted checks and reviews.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Recovered from clean base ea7042367a573e3b07ae00437767df04bcf284f2 into /tmp/groma-action-hotfix-recovery. The restored Node 26.12.1 archive matched independently verified SHA256 6170b2d474e1c626f43cff3adc118df9fe3b573258a4fc3d850c8dbc6b079bbd; tools remain under /tmp/action-hotfix-tools. All 38 Node tests passed, including twelve-key filtering, private CA preservation/deduplication, empty/malformed trust rejection, real native npm global cafile resolution, inherited Git settings/Schannel opt-in, strict npm arguments, and private-loopback HTTPS success with both incident chains rejected. An actual Git config subprocess also proved inherited values and strict Schannel settings. All six YAML files passed duplicate-key validation, current action/runtime pins, offline-first trust placement, and composite NODE_OPTIONS checks. Check's npm/CLI smoke is gated on PR draft readiness and explicit registry publication of Groma 0.7.3. git diff --check passed.

GitHub installation 113376443 excludes MrLesk/groma.md-action and previously returned 403. No push, PR, alternative credential or write fallback was attempted. Hosted Check and the real published Groma smoke remain required after access is restored; GitHub Release/Marketplace v1.2.2 and moving v1 follow those gates.

Security review corrected a Git environment mistake: any GIT_SSL_NO_VERIFY value, including false, disables verification. Removed it entirely from trustSettings and all four inline bootstraps; no empty GITHUB_ENV replacement is written. Explicit installer, comparison and publisher child environments omit inherited case variants of that variable. Publisher authentication now validates and appends to inherited GIT_CONFIG_COUNT instead of discarding Schannel/sslVerify entries. Regression coverage uses only fake auth values.

All 39 Node tests pass. The new native Git HTTPS regression uses one isolated config for the private CA and both compromised chains: the private CA reaches the mock404; both incident chains reach zero HTTP requests. Windows-only fixture options select Schannel and disable synthetic-leaf revocation lookup because GIT_CONFIG_NOSYSTEM hides backend selection; production revocation policy is unchanged. A mutation control restoring the old false-valued export caused native Git to reach the compromised mock and the regression failed as required. All six YAML files pass strict duplicate-key validation and git diff --check passes. GitHub access remains blocked; no push or fallback was attempted.

Repository access is now enabled and draft PR10 is open. Initial hosted checks exposed fixture isolation/portability mistakes: the native Git fixture inherited the parent count after removing parent indexed entries; Windows source matching needed CRLF normalization and a path assertion needed native separators. Fixed these test inputs without changing TLS requirements. All39 tests pass locally with the actual two-entry hosted Git environment reproduced; hosted rerun remains required.

Approved release support now extends the existing Check workflow: stable published v1.x.y releases test the exact commit in the read-only matrix and real npm CLI smoke, then an isolated contents-write job advances only v1 through a non-forced API ref update. It dereferences annotated version tags, checks the tested SHA and latest stable release, and serializes advancement. Full version tags are never written. Local39 tests, strict YAML parsing and the inline Node release-script syntax check pass; hosted candidate checks remain the gate.

Hosted fixture-fix head c87a074 passed all three OS39-test jobs. Repository access is restored; PR10 remains draft while Groma publication and the newly requested cross-project critical review are pending. Approved release-tag changes have been locally reviewed for fixed v1 write targets, exact-SHA read-only gates, strict stable version validation and non-forced latest-release advancement.

Target changed to Groma0.7.4 after the fresh audit found a JVM trust-store copy isolation defect in the unpublished0.7.3 candidate. Updated Action defaults, documentation, examples and real npm smoke gate. Released tags are unchanged; the Action remains draft until the corrected CLI is published and review/checks pass.

Root review reproduced a URL-specific Git verification bypass: generic http.sslVerify=true lost to an inherited exact-repository sslVerify=false, and native Git reached the compromised eMudhra mock before the fix. Trust preparation now appends strict exact repository URL settings for both checkout and publisher URL forms, preserving inherited indexed configuration. Six native cases cover private CA success with publisher fake authentication preserved and zero HTTP requests through both incident paths, with and without .git. All39 Node tests,6 strict YAML files and git diff --check pass. Hosted exact-head checks and the published Groma0.7.4 smoke remain required. The obsolete final summary was cleared; earlier access-blocked/0.7.3 notes are historical.

Hosted df3a9ac Windows native Git fixture timed out10s with code=null; Linux/mac passed. The earlier assertion had no case/stderr, so no certificate rejection or source cause is claimed. Added fixture-only noninteractive settings and curl header tracing retained only in captured child stderr, emitted with filename/suffix/code/signal/request count on failure. All auth is fake fixture data. Kept10s bound and tightened requirement to a completed native Git exit; no timeout counts as a zero-request security pass. Close leftover fixture sockets on failure to permit diagnostics/cleanup. Actual Windows trace is the next gate before any substantive fix.

Diagnostic Windows trace locates timeout in emudhra chain verification: private positive finishes; incident handshake completes and Schannel imports the private-only CA file, then stalls10s before any HTTP request. Appended existing terminal public ECC-G3/AAA roots to the served incident peer chains, retaining filtered client trust,10s deadline and completed certificate rejection/zeroHTTP assertions. This removes missing-issuer discovery from synthetic fixture construction. AIA/network lookup is a consistent inference from the stalled native verifier, not proven packet-level evidence; hosted Windows completed rejection remains required.

Root review also reproduced native npm exclusive-CA widening: a configured private-only cafile rejected a second authority with0HTTP, while the combined Action bundle accepted it with3HTTP. The Action now resolves effective CA precedence through the installed native npm configuration loader and writes a distinct filtered npm bundle; default Node/GitHub trust stays separate. npm installs use NPM_CONFIG_CAFILE explicitly, preserving native auth/registry/proxy resolution. Actual npm controls now reject the unselected authority with0HTTP, accept the selected private CA, and verify the other authority works only in the global-bundle control. Tests cover higher-priority user inline CA over global cafile, env cafile over user CA, unreadable selected file rejection and ignored overridden unreadable file. All40 Node tests pass on patched Node26.12.1/npm12.2.0; six strict YAML files and diff checks pass. CLI source/defaults/release instructions are complete; AC4 remains pending final exact-head hosted checks, completed code/security review and published Groma0.7.4 smoke.
<!-- SECTION:NOTES:END -->
