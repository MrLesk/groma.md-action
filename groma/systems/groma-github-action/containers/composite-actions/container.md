---
type: C4 Container
title: Composite Actions
status: stable
groma:
  id: composite-actions
  parent: groma-github-action
  technology: GitHub Actions, Node.js
description: Runs the Action's steps inside the caller's workflow jobs
---

GitHub Actions runs this repository's composite Actions as steps of the caller's workflow jobs. Each step runs a Node.js script from this repository.
