---
id: TASK-15
title: Trigger PR previews from regular pull request events
status: Done
assignee:
  - '@codex'
created_date: '2026-11-21T15:52:00Z'
updated_date: '2026-11-21T15:55:00Z'
labels: []
dependencies: []
references:
  - examples/pull-request.yml
  - README.md
  - examples/pull-request-signal.yml
modified_files:
  - examples/pull-request-signal.yml
  - examples/pull-request.yml
  - README.md
type: bug
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The default GitHub event policy will block pull_request_target on affected public repositories. Keep same-repository previews automatic while leaving fork previews available for maintainer review.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The examples start same-repository PR previews with a regular pull_request event and a separate publisher running from the default branch.
- [x] #2 The publisher uses trusted GitHub metadata and Git objects, and leaves fork comparisons available through manual dispatch.
- [x] #3 The README explains installing both workflows and migrating an existing setup without a repository-wide event exception.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a permission-free PR signal and have the existing trusted workflow respond to its completion.
2. Keep the publication steps and URL layout, document the change, and validate the workflow conditions and selector.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Parsed both example workflows and validated all embedded Bash. Exercised automatic PR resolution using the actual Codex Events workflow-run payload and live REST metadata, stale-head suppression, and manual lookup of a fork PR. The local Node 26.12.1/npm 12.2.1 suite matched the baseline at 58 passing and four native Git TLS fixture failures.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
PR comparison examples now publish from a trusted default-branch workflow after an unprivileged PR request. The README documents the two files and the migration from pull_request_target.
<!-- SECTION:FINAL_SUMMARY:END -->
