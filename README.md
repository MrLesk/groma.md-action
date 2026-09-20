# Groma.md Action

Build a static [Groma](https://github.com/MrLesk/Groma.md) architecture map from an initialized repository. This Action restores the project's configured scanners, scans the checkout, and exports one website directory.

## Before using the Action

Initialize Groma and select scanners locally. Commit the architecture in `groma/` or `.groma/`, including `scanners.json`. The Action uses those selections and does not initialize a project or upgrade scanner versions.

The examples use an Ubuntu GitHub-hosted runner. Official scanners include their analysis tools, so the fixture and basic source scan do not need the application's dependencies or build. Follow any setup required by your own scanner packages. Local scanner paths must be available in the checkout.

## Publish to GitHub Pages

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source.
2. Copy [examples/pages.yml](examples/pages.yml) to `.github/workflows/groma.yml`. Change the branch name if your default branch is not `main`.
3. Push the workflow. Its deployment links to the published map.

Use this complete example when the repository has no existing Pages site. It publishes the map at the project site's root.

## Add to an existing website

Run Groma after your documentation build, then publish the combined website directory:

```yaml
# Your existing checkout and documentation build write to site/.
- uses: MrLesk/groma.md-action@main
  with:
    output: ./site/architecture
    exclude: |
      /examples/
      /test/fixtures/

- uses: actions/upload-pages-artifact@v4
  with:
    path: ./site
# Keep your existing Pages deployment job.
```

The map is available under `/architecture/`. The Action writes its export into the selected directory; it does not publish or remove the rest of your website.

## Inputs and output

| Input | Default | Meaning |
| --- | --- | --- |
| `output` | `groma-site` | Website directory, relative to the repository root. |
| `exclude` | Empty | Additional global scan patterns, one per line. |

The `output` step output is the absolute path of the generated directory. A later step can upload it to Pages, keep it as a workflow artifact, or send it to another static host.

`exclude` appends its ordered patterns to `scanners.json` in the CI checkout. Empty input leaves that file unchanged. Scanner selections, settings, and existing patterns are retained. Subsequent steps see the updated configuration; the Action does not commit it.

Patterns use Groma's existing Gitignore rules, relative to the repository root. They apply across all configured scanners. Later `!pattern` entries can reverse earlier matches under those rules.

**Exclusions control scanning. They do not hide or delete architecture already stored in Groma.** An export can include architecture-owned source and Backlog task details. Choose the exported content and host accordingly. See [Groma's exclusion contract](https://github.com/MrLesk/Groma.md/blob/main/docs/scanners/index.md#excluding-source-evidence).

## Execution and caching

The Action installs Groma `0.3.3`, then runs:

```sh
groma scanner install
groma scanner check
groma scan
groma export <output>
```

The scanner package cache is keyed by runner OS and CPU, Groma version, and configured scanner sources. Package installation still runs after restoration to ensure the configured packages are available. Architecture and exported pages are rebuilt from the checkout on every run.

Publishing remains in the calling workflow. PR preview creation, preservation, and cleanup are not handled by this Action. A PR workflow can use the same builder with its selected checkout and publisher.

## Development

- `action.yml` owns runtime setup, the scanner cache, and CLI orchestration.
- `prepare.mjs` translates workflow inputs into the existing scanner configuration.
- Groma owns scanner validation, exclusion matching, architecture meaning, and export.

Run `npm run check` with Node 24. The check runs independent temporary fixtures concurrently; `bun run check` invokes the same suite. GitHub CI also runs the composite Action on the initialized JavaScript/TypeScript fixture and checks the resulting snapshot.

This repository contains the root Action metadata needed for a Marketplace release. Usage currently follows `main`.
