# Groma.md Action

Add an interactive architecture comparison to your GitHub pull requests. Reviewers see one updated comment with change counts and a link to explore the map, before/after descriptions, and owned-source diffs.

Try the [permanent demo PR](https://github.com/MrLesk/groma.md-demo/pull/1): checkout moves receipt delivery into a separate worker. Its bot comment opens the real comparison.

## Add PR comparisons

For a **public repository with no existing GitHub Pages site**:

1. Initialize Groma locally, curate its architecture, and commit `groma/` or `.groma/`, including `scanners.json`. Both compared commits need committed architecture.
2. In **Settings → Pages**, select **GitHub Actions**.
3. Copy [examples/pull-request.yml](examples/pull-request.yml) to `.github/workflows/groma-pr.yml` on your default branch. Open a PR.

The workflow needs no extra account or secret. It uses the repository's `GITHUB_TOKEN`; organization policies must allow its declared write permissions. Fork contributions use the same flow.

The PR gets one comment showing added, modified, and removed components and relationships. Every push updates that comment and its comparison link. A PR with no architecture or owned-source changes gets an explicit empty result. The comment links to the exact compared commits.

The comparison starts at the PR's **merge base** (the last common commit with the target branch) and ends at its actual head commit. This shows what the PR introduces, including when the target branch has advanced. Groma owns all change detection; this Action only counts the change facts it exports.

Previews live under `/pr-<number>/architecture/auto/`. The comment link includes the compared commit hashes so repeat visits open fresh data. They stay on the `groma-previews` branch and the Pages site after PR closure. Publishing another PR preserves earlier previews. There is no automatic cleanup or artifact-expiration dependency for published links.

### Existing Pages sites

The complete workflow owns a dedicated Pages site. It refuses a repository with an existing unrelated Pages deployment or an unrecognized `groma-previews` branch. If you already publish documentation, use the build Action's `from` and `revision` inputs, then pass its `output` and `summary` outputs to your existing publisher. Do not run two publishers for one Pages site.

### What runs on a PR

The read-only `compare` job checks out the PR, reads its committed architecture and source, and exports both revisions. It does **not** scan, install repository-selected scanners, install application dependencies, or execute PR scripts. Optional scanner source-outline hooks are disabled for this export; source text and diffs remain available. The temporary scanner configuration is restored after export.

The separate `publish` job downloads the generated site, updates only this PR's preview directory, deploys Pages, and then updates the comment. Its workflow and Actions come from trusted references. Keep that separation when adapting the example, and never add PR-supplied commands to the job with write permissions. Builds for superseded PR commits are skipped before publication.

The published website includes architecture-owned source from both commits and is public. This complete workflow rejects private repositories. GitHub Pages is static: readers need no Groma installation or GitHub login for a public preview.

## Publish a current architecture map

For a map of the current checkout, use [examples/pages.yml](examples/pages.yml). It scans using the committed scanner selections and exports to `/architecture/blueprint/`. Select **GitHub Actions** in Pages settings first; use this complete example only when the repository has no existing Pages site.

To add a map to a website you already build:

```yaml
# Your documentation build has already written site/.
- uses: MrLesk/groma.md-action@main
  with:
    output: site
    theme: blueprint
    exclude: |
      /examples/
      /test/fixtures/

# Keep your existing website publisher and publish site/.
```

The scanner packages must be selected and committed locally. Official scanners include their analysis tools; follow any setup required by custom scanners. The Action does not initialize Groma or upgrade the project's scanner versions.

## Build inputs and outputs

| Input | Default | Meaning |
| --- | --- | --- |
| `output` | `groma-site` | Website root, relative to the checkout. |
| `theme` | `auto` | `auto`, `light`, `dark`, or `blueprint`. |
| `exclude` | Empty | Additional scan patterns, one per line; single-checkout builds only. |
| `from` | Empty | Earlier comparison commit. Supply with `revision`. |
| `revision` | Empty | Later comparison commit. Supply with `from`. |

| Output | Meaning |
| --- | --- |
| `output` | Absolute website root. |
| `directory` | Exported map at `<output>/architecture/<theme>/`. |
| `summary` | Comparison JSON path, with `from`, `revision`, and `components`/`relationships` counts for `added`, `modified`, and `removed`. Empty for a single-checkout build. |

Fetch both revisions and enough history to find the merge base. The full PR example uses `fetch-depth: 0` and explicit commit hashes.

Groma reads the theme from the publication path; `?theme=` overrides it, and visitors can use the Theme menu. `auto` follows the reader's system theme. Colors match the map and code diffs across all themes.

`exclude` appends ordered Gitignore-style patterns to the CI checkout's `scanners.json`. Empty input leaves it unchanged. Later `!pattern` entries can reverse earlier matches under Groma's rules. Exclusions control scanning, not architecture already committed; they are rejected for comparisons. See [Groma's exclusion contract](https://github.com/MrLesk/groma.md/blob/main/docs/scanners/index.md#excluding-source-evidence).

## Development

The Action installs Groma `0.6.0`.

- `action.yml` and `prepare.mjs` own build inputs, runtime setup, and the scanner cache for ordinary scan/export builds.
- `comparison.mjs` exports committed revisions with scanner hooks disabled and reads Groma's counts from the generated JSON payload.
- `publish/action.yml` and `publish/publish.mjs` own retained Pages previews and one marked PR comment.
- `examples/pull-request.yml` connects the read-only build and separate publisher.

This adds no architecture model. In OKF, the committed Markdown remains readable descriptions and links. C4 actors, systems, containers, components, and relationships keep their existing meaning. Groma interprets source ownership and comparison state; the Action owns GitHub delivery only. No language-specific build command is assumed.

Run `npm run check` with Node 24 (or `bun run check`). Tests use independent temporary directories and run concurrently. GitHub CI also runs the root Action against an initialized JavaScript/TypeScript fixture and verifies the exported sources.

Usage follows `main` until an Action release is published. Pin an exact reviewed commit when adopting it before that release.

## Releases

The pinned Groma CLI version and the Action version are separate.

1. Wait for Groma's Release workflow and confirm `npm view groma.md@<version> version`.
2. Update the CLI pin and this README, run `npm run check`, then verify the **Check** workflow on that exact commit.
3. With maintainer approval, publish an Action release through [GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace), and change the example references to its major tag, such as `@v1`.
4. Move that major tag to each tested Action release; keep full version tags fixed.
