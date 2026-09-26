---
type: C4 Component
title: PR preview publication
status: stable
groma:
  id: publish
  parent: groma-github-action
  code:
    - scanner: javascript
      file: publish/publish.mjs
  technology: JavaScript, Node.js, GitHub API, Git
description: Retains a public comparison and updates one PR comment
---

The publish Action consumes the downloaded website and its comparison summary in a separate job. It checks the current PR revision, replaces only that PR directory on the owned groma-previews branch, deploys the retained site to GitHub Pages, and updates one bot comment with counts and the before/after link. Revision parameters keep the link tied to the published commits.
