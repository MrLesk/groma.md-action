---
type: Groma Relationships
title: Architecture relationships
---

## Relationships

| Source | Target | Description | Technology |
| --- | --- | --- | --- |
| [Maintainer](actors/maintainer.md) | [Groma GitHub Action](systems/groma-github-action/system.md) | Configures architecture export in repository workflows | GitHub Actions YAML |
| [Groma GitHub Action](systems/groma-github-action/system.md) | [Groma CLI](externals/groma-cli.md) | Invokes architecture export | Command-line interface |
