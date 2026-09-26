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

The root action.yml invokes prepare.mjs before export. It requires both revision inputs for a comparison and rejects scan exclusions in that mode. It validates the theme and initialized Groma configuration, then returns the website directory, map directory, configuration path, and scanner cache key to the workflow.
