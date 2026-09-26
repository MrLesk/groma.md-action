---
type: C4 System
title: Groma GitHub Action
status: stable
groma:
  id: groma-github-action
description: Architecture maps and before/after PR comparisons in GitHub workflows
---

The root composite Action runs in a caller-provided GitHub Actions job. It either scans a checkout or exports a comparison between two committed revisions. The separate publish Action runs in a job with publication permissions, retains each PR preview on GitHub Pages, and updates one review comment. The documented workflow connects those jobs through a build artifact.
