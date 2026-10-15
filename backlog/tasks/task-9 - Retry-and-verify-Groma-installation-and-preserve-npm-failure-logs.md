---
id: TASK-9
title: Retry and verify Groma installation and preserve npm failure logs
status: Done
assignee:
  - '@codex'
created_date: '2026-10-15 21:04'
updated_date: '2026-10-15 21:09'
labels: []
dependencies: []
references:
  - >-
    https://github.com/MrLesk/Backlog.md/actions/runs/38803998437/job/116661040642
  - action.yml
  - install.sh
  - test/install.test.mjs
  - README.md
modified_files:
  - install.sh
  - action.yml
  - test/install.test.mjs
  - README.md
  - .github/workflows/check.yml
type: bug
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
npm can report success while the optional Groma platform binary is missing. The action also masks a failed groma --version command inside echo, so incomplete installs are reported as successful and fail later during export. This occurred in Backlog.md architecture comparisons with Groma 0.6.6.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A failed npm install or version command retries installation and verification together up to three attempts, with a bounded delay and no delay after the last attempt.
- [x] #2 Only a successful version command writes the version output and allows later action steps to run; exhausted attempts fail the action.
- [x] #3 npm logs from the current installation are saved as a uniquely named artifact when all attempts fail, including when the action runs more than once in a job.
- [x] #4 Tests cover immediate success, incomplete optional dependency recovery, npm command failure, exhausted retries, and failure-log wiring; the existing check suite passes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Move installation into a small Bash script, retry npm installation and a standalone version assignment together three times, and wait 10 seconds between failed attempts.
2. Give each invocation a separate npm logs directory under RUNNER_TEMP, expose its path/name as internal step outputs, and upload it only when installation exhausts its attempts.
3. Exercise the real script with controlled npm, groma and sleep commands to verify success, recovery, failures, retry bounds, outputs and log isolation. Document the behavior, run the full check suite and inspect the PR diff against origin/main.

4. Extend the existing Check workflow with an expected failed install of an unavailable version, then download its npm log artifact to verify the complete failure path on GitHub.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Local validation: npm run check passes all 32 tests, including six new installation cases. The real Bash script is exercised with controlled npm/groma/sleep commands; retries, successful and failed verification, no output on exhaustion, no final sleep, and separate invocation logs are verified. bash -n, YAML parsing, failure-only artifact wiring checks and git diff --check pass. The Check workflow now performs a deliberately failed install, asserts export did not run, downloads the uploaded npm artifact and checks its debug logs; hosted validation is pending.

Hosted Check passed: https://github.com/MrLesk/groma.md-action/actions/runs/38807525993. It successfully exported the initialized fixture with the default CLI, exported the committed comparison with Groma 0.6.6, ran all 32 tests, then exercised an unavailable version. The expected failed install stopped export and uploaded an npm debug log artifact, which the next steps downloaded and verified. The expected install error annotations belong to that controlled failure case; the job passed.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Installation now retries npm and a standalone groma --version check together up to three times, with 10-second delays between failed attempts. Successful verification alone writes the version output. Exhausted attempts fail the Action and upload the current invocation npm logs in a unique artifact retained seven days. Six subprocess regression tests cover success, recovery, npm and verification failures, retry bounds, outputs and log isolation. All 32 tests, YAML/Bash checks and the hosted full Action check pass, including actual failure-log upload/download. Existing @v1 consumers receive this after the normal Action release process.
<!-- SECTION:FINAL_SUMMARY:END -->
