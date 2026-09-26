---
type: Groma Relationships
title: Architecture relationships
---

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [Maintainer](actors/maintainer.md) | [Groma GitHub Action](systems/groma-github-action/system.md) | Configures architecture export in repository workflows | GitHub Actions YAML |
| [Groma GitHub Action](systems/groma-github-action/system.md) | [Groma CLI](externals/groma-cli.md) | Invokes architecture export | Command-line interface |
| [prepare.mjs](../prepare.mjs) | [comparison.mjs](../comparison.mjs) | Provides the validated configuration and export paths | GitHub Actions step outputs |
| [comparison.mjs](../comparison.mjs) | [publish/publish.mjs](../publish/publish.mjs) | Supplies the exported comparison website and change summary | GitHub Actions artifact |
| [PR preview publication](systems/groma-github-action/components/publish.md) | [GitHub publication](externals/github-publication.md) | Stores and deploys the preview, then updates its review comment | Git, GitHub API, Pages deployment |
