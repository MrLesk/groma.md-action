---
type: C4 Component
title: Project preparation
status: stable
groma:
  id: prepare
  parent: groma-github-action
  code:
    - scanner: javascript
      file: prepare.mjs
  technology: JavaScript, Node.js
description: Validates export inputs and prepares the initialized project
---

The root action.yml invokes prepare.mjs before scanning. It validates the theme, finds the Groma configuration, applies additional scan exclusions, and returns the output directory and scanner cache key to the workflow.
