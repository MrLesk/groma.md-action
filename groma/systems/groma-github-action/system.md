---
type: C4 System
title: Groma GitHub Action
status: stable
groma:
  id: groma-github-action
description: Architecture maps in GitHub workflows
---

The composite Action runs in a caller-provided GitHub Actions job. It validates the initialized project, installs its configured scanners, scans the current checkout, and exports a static architecture map. The caller decides how to publish the exported directory.
