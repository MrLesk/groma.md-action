# Groma.md Action

Build a static [Groma](https://github.com/MrLesk/Groma.md) architecture map from an initialized repository. This Action restores the project's configured scanners, scans the checkout, and exports one website directory.

## Before using the Action

Initialize Groma and select scanners locally. Commit the architecture in `groma/` or `.groma/`, including `scanners.json`. The Action uses those selections and does not initialize a project or upgrade scanner versions.

The examples use an Ubuntu GitHub-hosted runner. Official scanners include their analysis tools, so the fixture and basic source scan do not need the application's dependencies or build. Follow any setup required by your own scanner packages. Local scanner paths must be available in the checkout.

## Publish to GitHub Pages

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source.
2. Copy [examples/pages.yml](examples/pages.yml) to `.github/workflows/groma.yml`. Change the branch name if your default branch is not `main`.
3. Push the workflow. Its deployment links to the published map.

Use this complete example when the repository has no existing Pages site. It publishes the map at `/architecture/blueprint/` beneath the project site, for example `https://<owner>.github.io/<repository>/architecture/blueprint/`.

## Add to an existing website

Run Groma after your documentation build, then publish the combined website directory:

```yaml
# Your existing checkout and documentation build write to site/.
- uses: MrLesk/groma.md-action@main
  with:
    output: ./site
    theme: blueprint
    exclude: |
      /examples/
      /test/fixtures/

- uses: actions/upload-pages-artifact@v4
  with:
    path: ./site
# Keep your existing Pages deployment job.
```

The map is available under `/architecture/blueprint/`. The Action writes into that directory inside the website root; it does not publish or remove the rest of your website.

## Inputs and output

| Input | Default | Meaning |
| --- | --- | --- |
| `output` | `groma-site` | Website root to publish, relative to the repository root. |
| `theme` | `auto` | `auto`, `light`, `dark`, or `blueprint`. |
| `exclude` | Empty | Additional global scan patterns, one per line. |

The export is written to `<output>/architecture/<theme>/`. The `output` step output is the absolute website root. Upload that root to preserve the theme path on Pages or another static host.

Groma reads the theme from the publication path. An explicit `?theme=` choice takes priority, and visitors can change it in the Theme menu. `auto` follows the visitor's system theme.

**Pending Groma release:** the directory layout is ready, but the pinned Groma `0.3.3` does not read themes from paths. After releasing that Groma change, update the pin, verify the published path opens in the selected theme, and remove this note. See the [release checklist](#releases).

`exclude` appends its ordered patterns to `scanners.json` in the CI checkout. Empty input leaves that file unchanged. Scanner selections, settings, and existing patterns are retained. Subsequent steps see the updated configuration; the Action does not commit it.

Patterns use Groma's existing Gitignore rules, relative to the repository root. They apply across all configured scanners. Later `!pattern` entries can reverse earlier matches under those rules.

**Exclusions control scanning. They do not hide or delete architecture already stored in Groma.** An export can include architecture-owned source and Backlog task details. Choose the exported content and host accordingly. See [Groma's exclusion contract](https://github.com/MrLesk/Groma.md/blob/main/docs/scanners/index.md#excluding-source-evidence).

## Execution and caching

The Action installs Groma `0.3.3`, then runs:

```sh
groma scanner install
groma scanner check
groma scan
groma export <output>/architecture/<theme>
```

The scanner package cache is keyed by runner OS and CPU, Groma version, and configured scanner sources. Package installation still runs after restoration to ensure the configured packages are available. Architecture and exported pages are rebuilt from the checkout on every run.

Publishing remains in the calling workflow. PR preview creation, preservation, and cleanup are not handled by this Action. A PR workflow can use the same builder with its selected checkout and publisher.

## Development

- `action.yml` owns runtime setup, the scanner cache, and CLI orchestration.
- `prepare.mjs` translates workflow inputs into the existing scanner configuration.
- Groma owns scanner validation, exclusion matching, architecture meaning, and export.

Run `npm run check` with Node 24. The check runs independent temporary fixtures concurrently; `bun run check` invokes the same suite. GitHub CI also runs the composite Action on the initialized JavaScript/TypeScript fixture and checks the resulting snapshot.

This repository contains the root Action metadata needed for a Marketplace release. Usage currently follows `main`.

## Releases

The Groma version pinned in `action.yml` and the Action's release version are separate. A tag such as `v1` points to an Action release, which installs one tested Groma version.

1. After every Groma release, wait for its Release workflow to succeed and confirm the exact version is available with `npm view groma.md@<version> version`.
2. Update the `groma.md@<version>` pin in `action.yml` and the version stated in this README. For the first Action release, also change the usage examples here and in `examples/pages.yml` from `@main` to the chosen major tag, such as `@v1`.
3. Run `bun run check`, commit and push the change, and wait for the **Check** workflow on that exact commit. It must pass the configured-scanner scan and export as well as the input tests.
4. Draft an Action release with a new full version tag, such as `v1.2.3`, targeting that tested commit. Name the installed Groma version in its release notes. Obtain the maintainer's approval, then publish through [GitHub's Marketplace release flow](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace).
5. **After each Action release, bump its major-version pointer** to that release's commit. For example, after publishing `v1.2.3`, run the following in this repository:

   ```sh
   git fetch origin tag v1.2.3
   git tag --force v1 'v1.2.3^{commit}'
   git push origin refs/tags/v1 --force
   ```

   Substitute the actual release and matching major version. Keep full version tags fixed, and verify that the major tag resolves to the released commit. This lets workflows using `@v1` receive the update, following [GitHub's Action versioning guidance](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/manage-custom-actions#using-tags-for-release-management).
