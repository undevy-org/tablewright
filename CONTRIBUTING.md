# Contributing

## Setup

Node 20, pnpm via `corepack enable` (version pinned in `packageManager`).

```bash
pnpm install --frozen-lockfile
pnpm storybook   # dev server on :6006
```

## Before opening a PR

```bash
pnpm lint && pnpm typecheck && pnpm build
STORYBOOK_BASE_PATH=/tablewright/ pnpm build-storybook
```

There are no unit tests; CI runs the same checks. `pnpm check:render` is an optional headless-Chrome check that
styles hold up against a hostile host stylesheet.

## Changesets and releases

A PR that changes `src/` adds a changeset (`pnpm changeset`): `minor` for features, `patch` for fixes (version is `0.x`).
Docs-, CI- and tooling-only PRs need none.

Merging to `main` never publishes by itself. The release workflow collects pending changesets into a
"chore: version packages" PR; merging that PR publishes to npm. Do not publish by hand.

## Conventions

Conventional Commits (`feat:`, `fix:`, `chore:`), squash-merged PRs, branches named `feat/…`, `fix/…`, `chore/…`.
