# Touch Grass — Project Status

Last audited: 10 October 2026. This report is based on repository source, package scripts, README, and the three product/technical PDFs in `.docs/`. It does not treat requirements or the prior agent's report as implementation evidence. No application source or dependencies were changed for this audit.

## Product purpose and gameplay loop

Touch Grass is a real-world outdoor challenge game: choose an experience and duration, receive a short mission, put the phone away, do the activity outside, submit only the required evidence, then receive deterministic XP and see progression. Players can play solo or compare progress with friends in asynchronous Spaces. The product principle in the game specification is “the phone is the scoreboard; the game happens outside.”

## Actual stack and architecture

- pnpm 11 workspace and Turborepo; TypeScript throughout.
- `apps/web`: Next.js 16.4 App Router, React 19, Tailwind CSS 4.
- `apps/api`: Express 4 REST API, JWT auth, bcryptjs, Helmet, CORS, express-rate-limit, Zod validation.
- `packages/shared`: shared TypeScript domain types and Zod schemas.
- `packages/game`: deterministic XP, levels, evidence/status validation, scoring and ranking.
- `packages/ai`: provider interface, mock provider, OpenAI-compatible Gemma provider, generation/evaluation workflows. Supports mock, Groq, Together, Ollama, OpenRouter, and custom base URL in factory; no live model call was verified.
- `packages/db`: MongoDB driver client, indexes, repositories for users, challenges, completions and spaces. `.env.example` defaults to local MongoDB, not proof of Atlas connectivity.
- There is no evidence in source of a separate Mastra workflow implementation despite the package dependency/spec phrasing; the orchestration currently consists of local workflow classes. No Cloudinary SDK integration is present.

API mount points (all under `/api/v1`): health; auth (`register`, `login`, `logout`, `me`); users (profile, history, public profile); challenges (generate, active, get, start, complete); evidence (upload-signature metadata); spaces; global and space leaderboards. Authentication and route authorization vary; inspect controller behavior before relying on an endpoint. Upload-signature returns mock values when Cloudinary is absent and does not itself upload a file.

Frontend routes present in source: `/` redirects to `/dashboard`; `/login`; `/dashboard`; `/mission/briefing`; `/mission/active`; `/mission/submit`; `/mission/results`; `/spaces`; `/leaderboard`. These pages exist, but existence alone does not prove every screen is complete or connected to every backend capability.

## Implementation status

| Area | Status | Evidence / limitations |
|---|---|---|
| Monorepo and shared contracts | Implemented | Workspace, Turbo config, package exports, types and Zod schemas exist. |
| XP and levels | Partially implemented | Deterministic engine and unit tests exist. Current duration XP in shared constants must be compared against game spec; the game spec recommends 20/35/50/80 base XP and at most +10 bonus, while README advertises 200/350/500/750 plus larger AI bonuses. This is a product requirements conflict, not resolved here. |
| Authentication | Partially implemented | Register/login/JWT/hash/protected middleware exist; client stores JWT in `localStorage`. Must verify ownership/security edge cases and persistence against a running DB. |
| MongoDB persistence | Implemented in code, runtime unverified | Mongo client, repositories, indexes, bootstrap connection exist. No successful connection evidence in repository or this audit. |
| Challenge generation | Partially implemented | Mock and remote provider, schema validation and fallback workflow exist. Mock is default; remote provider not verified. Recent challenge titles are supplied, but do not assume meaningful novelty. |
| Evidence evaluation | Partially implemented | Structured provider result and fallback baseline exist; evaluator fallback accepts with base reward and 50% bonus ratio, which differs from spec language calling for no arbitrary bonus on model failure. |
| Photo upload | Missing / stub | Signature endpoint emits Cloudinary fields/mock metadata; no signature generation, browser upload flow, MIME/size enforcement, or storage persistence found. |
| Completion, scoring, idempotency | Partially implemented; correctness risk | Server validates required evidence and checks existing completion, then separately updates XP, challenge, and completion. These are separate writes, so concurrent/retried requests can create consistency or duplicate-award risks without transaction/atomic idempotency. Inspect further before production use. |
| Spaces | Partially implemented | Create/join/member/challenge routes and repositories exist. Full group challenge lifecycle/UI behavior is not established; frontend primarily exposes create/join/list. |
| Leaderboards | Partially implemented | Global and space endpoints exist; current global leaderboard ranks total XP (lifetime), not a weekly period. |
| Frontend/game loop | Partially implemented | Screens and context/API client exist. No E2E verification. Client currently synthesizes fallback text/photo evidence if fields are blank (including a stock Unsplash image URL), which is not actual evidence. |
| Tests | Partial | Vitest suites exist for game, AI, API health only. No Playwright package/script or E2E suite found. |
| Lint/deployment | Missing/unverified | Workspace lint commands are placeholder `echo`; no deployment configuration was identified in repository inventory. |

## Known bugs, blockers, and risks

- **Build/runtime checks pending:** first `pnpm` invocations were blocked because PowerShell prohibited `pnpm.ps1`. The `pnpm.cmd` invocations started but did not return output during the audit window; results need confirmation. See check status below.
- `pnpm dev` is configured as `turbo dev`, but the web `dev` and API `dev` tasks are persistent. Confirm Turbo task scheduling and actual simultaneous startup locally; README instead documents separate terminals.
- `apps/api/src/server.ts` catches any startup failure in development and starts Express in fallback mode. This can make `/health` appear available while MongoDB-backed endpoints cannot work; health reports `healthy` without DB status.
- `ChallengeController.getById` fetches by ID without an ownership or Space membership check. This may expose another user's challenge data to any authenticated user.
- Completion flow checks prior completion and updates user XP/challenge/completion in separate operations. Atomicity and concurrent duplicate submission are unresolved.
- Evidence provider fallback returns valid evaluation with a positive bonus ratio; failure handling can grant bonus without AI assessment.
- Cloudinary endpoint is a placeholder and exposes `mock-key` in fallback response. Do not consider photo evidence storage implemented.
- Client-side evidence defaults fabricate a generic observation and external stock photo rather than requiring user-provided evidence.
- README is visibly mojibake in places, markets higher XP values than game rules PDF, and claims/advertises integrations not demonstrated by current source. The previous agent status claims a connected Atlas DB, fully live UI/API, and completed phases; those claims were not independently verified and should not be treated as current facts.
- PDF requirements and current implementation conflict on base XP and bonus limits; there is no identified release deadline in the checked-in requirements. Hacktoberfest is context, not a dated project deadline.

## Remaining work ranked by priority

1. **Establish a trustworthy end-to-end baseline before release:** run checks successfully, start web/API with an explicitly configured test database, verify register → generate → start → submit real evidence → award exactly once → persisted profile/history. Fix blockers discovered there, especially authorization and atomic award behavior. This is the highest-priority next task because the core loop and data integrity are release-critical and currently unverified.
2. Resolve product rules against product owner/spec: XP schedule/bonus cap, evidence policy on AI failure, leaderboard period, and required photo-storage behavior. Avoid silently choosing between README and game-spec values.
3. Complete secure evidence storage and actual frontend upload flow, or explicitly cut photo upload from the release scope.
4. Complete and verify Space group challenge participation/results and access controls; clarify whether this is in the MVP deadline.
5. Add missing automated integration/E2E coverage and a real lint setup; then validate deployment configuration and external services.
6. Correct README claims/encoding and deployment/setup instructions after behavior is established.

## Checks and commands

Available root scripts from `package.json`:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Format writes files: `pnpm format` (not run during this audit).

Useful individual commands: `pnpm --filter web dev` (port 3000), `pnpm --filter api dev` (port 4000); health URL `http://localhost:4000/api/v1/health`.

Audit check attempts: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` initially failed to launch because PowerShell execution policy blocked `pnpm.ps1`. Retried through `pnpm.cmd`; the pnpm launcher then refused to run the pinned pnpm 11.28.5 because registry signature verification could not complete (fetch failed). Therefore typecheck, lint, tests and build did not execute; **no code-level pass/fail result is available.** `lint` is low-value currently because package scripts are placeholders. No dependencies were installed or changed.

## Important files and decisions to preserve

- `.docs/Touch grass PRD.pdf`, `.docs/TOUCH GRASS TRD.pdf`, `.docs/Touch grass game specification.pdf`: requirements/design sources; consult before behavior changes.
- `apps/web/src/app/`, `apps/web/src/context/GameContext.tsx`, `apps/web/src/lib/api.ts`: UI routes, state and API client.
- `apps/api/src/app.ts`, `routes/`, `controllers/`, `middleware/`: REST surface and backend enforcement.
- `packages/shared/src/schemas/index.ts`, `types/index.ts`: cross-layer contracts.
- `packages/game/src/`: authoritative deterministic progression/scoring/validation.
- `packages/ai/src/providers/`, `workflows/`: provider boundary and fallback behavior.
- `packages/db/src/client.ts`, `repositories/`, `indexes.ts`: persistence boundary.
- `apps/web/AGENTS.md`: installed Next.js guidance required before web edits.

Preserve the monorepo boundaries, existing gameplay routes, schema contracts, provider abstraction, and server-authoritative deterministic XP model. Do not rewrite the application or claim unverified external integrations. Root `AGENTS.md` contains durable agent guidance.

