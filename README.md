# groma.md Action

Architecture diffs on your pull requests. Each PR gets one comment with the change counts and a link to an interactive before/after map, with descriptions and source diffs.

See it on the [demo PR](https://github.com/MrLesk/groma.md-action/pull/4).

## Add PR comparisons

For repositories without an existing GitHub Pages site:

1. Commit your Groma architecture (`groma/` or `.groma/`) to your default branch. [New to Groma?](https://github.com/MrLesk/groma.md#get-started)
2. In **Settings → Pages**, set the source to **GitHub Actions**. In a private repository, also set the visibility to **Private** (GitHub Enterprise Cloud).
3. Copy [`examples/pull-request.yml`](examples/pull-request.yml) to `.github/workflows/groma-pr.yml` on your default branch.

PRs from the same repository get the comment, updated on each push. The map compares the PR with its merge base, so it shows what the PR introduces. No account or secret needed: the workflow uses `GITHUB_TOKEN`. Fork PRs wait for a maintainer: after review, open **Actions → Groma PR comparison → Run workflow** on the default branch and enter the PR number. This approves one comparison; later fork pushes do not trigger another export.

### Existing Pages sites

Keep your publisher. Run the build Action with `from` and `revision` (check out with `fetch-depth: 0`), then pass its `output` and `summary` to your publisher. The Groma publisher refuses to replace another Pages site.

### What runs on a PR

- `compare` is read-only. It keeps the trusted base checked out and fetches the PR commit as data. Groma exports both committed snapshots from an empty temporary working directory, without project plugin configuration, scanning, installing application dependencies or running PR scripts. The checkout's settings remain unchanged. Keep checkout's fork protection enabled.
- `publish` receives the selected PR number and exact base commit, deploys the preview to Pages and updates the comment. It skips publication if the PR head or base has changed. Keep PR-supplied commands out of this job.
- Previews stay at `/pr-<number>/architecture/auto/` after the PR closes. They are public unless the repository is private: a private repository needs private Pages visibility, because previews include source code, and the publisher refuses to deploy it to a public site.

## Publish a current map

For a repository without a Pages site, set the Pages source to **GitHub Actions** and copy [`examples/pages.yml`](examples/pages.yml). It exports the committed architecture on each push to the default branch and publishes it at `/architecture/blueprint/`. The map and PR previews share the site on the `groma-previews` branch. Each publication replaces only its own directory. The PR workflow can publish while the map workflow fails, and the site keeps the last published map. The publisher skips builds that are out of date. A private repository needs private Pages visibility, as for PR comparisons.

To add a committed map to a site you already build:

```yaml
- uses: MrLesk/groma.md-action@v1
  with:
    revision: ${{ github.sha }}
    output: site # your built site
    theme: blueprint
```

The Action requires Groma 0.7 or newer. Set `revision` to export one commit without loading the project's plugins. Leave `revision` and `from` unset to scan the checkout before exporting. In scan mode the CLI converts an existing `scanners.json`, restores missing plugins and updates npm scanners to their latest compatible releases. The Action disables background updates in its working copy so the scan and export use the same versions.

## Inputs and outputs

| Input | Default | Meaning |
| --- | --- | --- |
| `groma-version` | `0.7.8` | Groma CLI version; pin it to control reader upgrades |
| `output` | `groma-site` | Website root, relative to the checkout |
| `theme` | `auto` | `auto`, `light`, `dark` or `blueprint` |
| `exclude` | | Extra scan exclusions, one per line. Requires scan mode. |
| `from` | | Earlier commit to compare, with `revision` |
| `revision` | | Commit to export. Add `from` to compare two commits. |

| Output | Meaning |
| --- | --- |
| `output` | Absolute website root |
| `directory` | The map, at `<output>/architecture/<theme>/` |
| `summary` | Comparison JSON with the change counts; empty without `from` |

The default is Groma 0.7.8. `@v1` follows Action releases, which can change that default. Set `groma-version` to an exact release to keep reader upgrades explicit.

The publisher uses `pr-<number>/architecture/<theme>/` for previews. Set `preview-layout: comparison` when calling the publish Action to keep existing `comparison/pr-<number>/<theme>/` links. Keep the existing themes for your map and previews.

To migrate an existing Groma-only Pages site, seed `groma-previews` with the full contents of the current site. Include a root `.groma-previews` file containing the line `Groma PR previews` followed by a newline. Switch from the previous deployment workflow to the Groma publisher once that branch is ready. Sites that also publish other content can keep using their existing publisher.

Both comparison commits must contain architecture that the selected Groma version can read. After a format change, update an older PR from its base branch so its merge base and head use the current format. Choosing a version does not convert committed architecture.

## TLS trust during installation

The Action uses Node 26.12.1 and npm 12.2.1. Installation keeps strict TLS and filters the incident keys from its selected CA bundle. npm retains authentication, proxy and registry configuration. Installation settings stay with that child process; public Action setup exports only Node certificate settings. Project Git commands retain their own CA, verification, proxy, rewrite and authentication settings, including private HTTPS proxies. Pages publication requires the repository fetch and push URLs to resolve to the same destination.

The composite Actions prepare Node trust with the runner's bundled Node before provisioning Node/npm, so neither tool needs to be preinstalled on `PATH`.

The examples prepare the same filtered trust before checkout or GitHub API calls. Keep that first step and the workflow `NODE_OPTIONS` setting when adapting them. The GitHub runner prepares Action archives before job steps; that earlier phase depends on the runner vendor's trust updates.
