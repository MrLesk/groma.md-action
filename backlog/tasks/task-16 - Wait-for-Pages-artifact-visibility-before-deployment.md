---
id: TASK-16
title: Wait for Pages artifact visibility before deployment
status: Done
assignee:
  - '@codex'
created_date: '2026-11-21T18:17:00Z'
updated_date: '2026-11-21T18:18:00Z'
labels: []
dependencies: []
references:
  - publish/action.yml
  - https://github.com/actions/deploy-pages/issues/451
modified_files:
  - publish/action.yml
type: bug
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A successful Pages upload can briefly be absent from the artifact listing. The published deploy action stops after one lookup, so the Groma map or preview can fail even though its archive exists.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Allow the Pages artifact listing time to catch up after a successful upload and before deployment.
- [x] #2 The shared publisher still uploads and deploys once, keeps existing URLs and permissions, and skips stale builds.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add a short pause at the existing upload-to-deploy boundary and verify the composite still deploys once per current snapshot.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
The shared publisher pauses for 10 seconds after upload while GitHub catches up. The composite keeps the same storage, deployment, and link steps, with no new permissions. YAML and shell checks passed. The candidate and baseline share the same five local native Git/npm trust test failures. Remove the pause once the released Pages action retries missing-artifact lookup.
<!-- SECTION:FINAL_SUMMARY:END -->
