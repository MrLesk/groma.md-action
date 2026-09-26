---
type: C4 Component
title: Committed comparison export
status: stable
groma:
  id: comparison
  parent: groma-github-action
  code:
    - scanner: javascript
      file: comparison.mjs
  technology: JavaScript, Node.js, Groma CLI
description: Exports two committed revisions and summarizes their changes
---

The comparison step calls exportComparison with the merge base and actual PR head. It disables repository-selected scanner hooks while Groma exports committed architecture and source, then restores the scanner configuration. It reads the exported world to write comparison.json with exact commits and component and relationship counts. The workflow uploads that website directory for the publication job.
