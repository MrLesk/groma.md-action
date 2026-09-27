# Contributing

## Development

Run `npm run check` with Node 24 (or `bun run check`). Tests use their own temporary directories and run concurrently. CI also runs the root Action against an initialized JavaScript/TypeScript fixture and verifies the exported sources.

- `action.yml` and `prepare.mjs`: build inputs, runtime setup and the scanner cache.
- `comparison.mjs`: exports committed revisions with scanner hooks disabled and reads Groma's change counts.
- `publish/action.yml` and `publish/publish.mjs`: retained Pages previews and the PR comment.
- `examples/pull-request.yml`: connects the read-only build to the separate publisher.

## Releases

The Groma CLI version pinned in `action.yml` and the Action's own version are separate.

1. Wait for Groma's Release workflow and confirm `npm view groma.md@<version> version`.
2. Update the CLI pin and the README, run `npm run check`, then verify the **Check** workflow on that exact commit.
3. With maintainer approval, publish an Action release through [GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace), and change the example references to its major tag, such as `@v1`.
4. Move that major tag to each tested Action release; keep full version tags fixed.
