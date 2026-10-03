# AGENTS.md

- A PR that changes `src/` must include a changeset (`pnpm changeset`).
- Before pushing: `pnpm lint && pnpm typecheck && pnpm build`.
- Releases are automated (Changesets, npm trusted publishing); never publish by hand.
