# Touch Grass — Agent Instructions

## Project shape
- This is a pnpm 11 workspace/Turborepo monorepo (`apps/web`, `apps/api`, and packages `shared`, `game`, `ai`, `db`). Read each package's `package.json`; the root scripts fan out through Turbo.
- Web: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4. API: Express 4 + TypeScript. Data: MongoDB driver 6. AI: provider interface with mock and OpenAI-compatible inference clients. Shared contracts are Zod schemas/types.
- `apps/web/AGENTS.md` contains a Next.js-specific instruction: before editing web code, consult the installed Next.js guides under `apps/web/node_modules/next/dist/docs/` (or resolve the package location) for the relevant API/version.

## Durable implementation guidance
- Preserve the existing app and package boundaries. Put API handlers in `apps/api/src/controllers` and route mounts in `routes`; MongoDB access belongs in `packages/db/src/repositories`; deterministic game rules belong in `packages/game`; AI adapters/workflows belong in `packages/ai`; shared API/domain contracts belong in `packages/shared`.
- The server loads `.env` using `dotenv` in `apps/api/src/config/env.ts`. Use `.env.example` as the variable inventory; never read, print, copy into docs, or commit `.env` secrets.
- Keep XP/level math server-authoritative and deterministic. Validate AI-generated output with shared schemas; provider output is not authoritative for identity, XP, level, or access.
- Before changing behavior, read `.docs/Touch grass PRD.pdf`, `.docs/TOUCH GRASS TRD.pdf`, and `.docs/Touch grass game specification.pdf`. Treat them as requirements, not proof of implementation. Current discrepancies are tracked in `PROJECT_STATUS.md`.
- The root `lint` tasks currently use placeholder echo scripts in workspaces, not a configured linter. `pnpm test` runs tests only in packages defining a test script. There is no root `test:e2e` script today.
- Do not claim MongoDB, cloud AI, Cloudinary, deployment, or end-to-end integration has been verified unless an actual verification is run and recorded.

## Commands
Run from repository root with pnpm 11.28.5 available:
- `pnpm dev` — Turbo dev tasks; note API and web each have persistent dev commands.
- `pnpm build` — workspace builds (Next build plus TypeScript package/API builds).
- `pnpm typecheck` — Turbo typecheck tasks.
- `pnpm lint` — currently mostly placeholder scripts; not meaningful lint coverage.
- `pnpm test` — configured Vitest suites in API, AI, and game packages.
- Individual app commands: `pnpm --filter web dev`, `pnpm --filter api dev`.

Avoid dependency changes or broad rewrites when a targeted fix will do. Do not add tests unless requested; if asked to verify, use existing scripts and report limitations accurately.
