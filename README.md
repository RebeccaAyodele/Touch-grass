# Touch Grass

Touch Grass is an open-source outdoor challenge game. Choose an experience and a time, get a mission, put your phone away while you do it, then log what happened and earn XP.

The guiding idea is: **The phone is the scoreboard. The game happens outside.**

## How a mission works

1. Choose a vibe and a duration.
2. Generate and review a mission.
3. Start the mission, then put your phone away.
4. Return and write a short mission log.
5. The configured AI provider evaluates the log. The server applies the XP rules and saves the result.

## What is implemented

- Account registration and login with password hashing and JWT authentication.
- Seven mission vibes: Observe, Calm, Discover, Explore, Active, Social, and Surprise Me.
- Mission durations of 10, 20, 30, or 60 minutes.
- A mock AI provider for development, plus OpenAI-compatible endpoints configured for OpenRouter, Groq, Together AI, Ollama, or a custom endpoint.
- Schema validation and curated challenge fallbacks when generation fails.
- Text mission logs and structured AI evaluation. Invalid evidence can be revised and submitted again.
- Server-side XP calculation, level progression, and a duration-based XP reduction when a mission is submitted early.
- Spaces with a shareable invite code, member list, and Space leaderboard.
- A global leaderboard, account profile, and install prompt for adding the web app to a phone home screen.

## Current limitations

- Spaces use invite codes. Inviting a player by username, pending invitations, and notifications are not implemented.
- The Spaces interface does not yet provide a complete group-challenge lifecycle.
- The install prompt and web manifest support adding the site to a home screen. There is no offline service worker; missions and account features need an internet connection.
- Photo upload is not implemented end to end. The current mission generator requests text evidence; the upload-signature endpoint is not a complete Cloudinary upload flow.
- The profile screen displays account and game stats, but profile editing and mission history are not available in the screen yet. The API profile update route also needs persistence work before it should be relied on.
- The leaderboards rank by total XP. They are not weekly or seasonal rankings.
- Current code uses base rewards of 200, 350, 500, and 750 XP for 10, 20, 30, and 60 minutes, with maximum bonuses of 80, 140, 200, and 300 XP. The game specification document recommends different values; that product decision still needs to be reconciled.

## Technology and layout

- Web: Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4.
- API: Express 4, TypeScript, Zod, JWT, bcryptjs, Helmet, CORS, and express-rate-limit.
- Database: MongoDB using the official Node.js driver.
- AI: provider interface and OpenAI-compatible chat-completions adapter in `packages/ai`.
- Workspace: pnpm 11 and Turborepo.

```text
apps/web/          Next.js pages and browser API client
apps/api/          Express routes, controllers, middleware, and configuration
packages/shared/   Shared domain types and Zod schemas
packages/game/     XP, levels, score rules, and validation
packages/ai/       AI providers, workflows, prompts, and fallback challenges
packages/db/       MongoDB connection, indexes, and repositories
.docs/             Product requirements and technical specifications
```

## Requirements

- Node.js 20.9 or later.
- pnpm 11.28.5, as pinned in the root `package.json`.
- MongoDB Atlas or a reachable MongoDB instance for registration, login, and saved game data.
- An AI provider key for remote generation and evidence evaluation. The mock provider needs no key.

## Local setup

Install dependencies from the repository root:

```sh
pnpm install
```

Create `apps/api/.env` from `.env.example` and set at least the database name, MongoDB URI, and a private development JWT secret. The API loads its environment from `apps/api/.env` when started with the command below. Do not use the example JWT value outside local development.

The web app reads `NEXT_PUBLIC_API_URL` from `apps/web/.env.local`. For local development, set it to:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

To use the mock AI provider, set these in `apps/api/.env`:

```env
AI_PROVIDER=mock
AI_MODEL=gemma-2-9b-it
```

To use OpenRouter, use your own OpenRouter key and a model ID supported by that account:

```env
AI_PROVIDER=openrouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=your_openrouter_key
AI_MODEL=provider/model-id
AI_REQUEST_TIMEOUT_MS=30000
```

Keep AI keys, MongoDB credentials, and `JWT_SECRET` on the API. Never put them in a `NEXT_PUBLIC_` variable or commit an `.env` file. The `.env.example` file contains placeholders only.

Run the API and web app in separate terminals from the repository root:

```sh
pnpm --filter api dev
```

```sh
pnpm --filter web dev
```

The local addresses are `http://localhost:4000` for the API and `http://localhost:3000` for the web app.

## Commands

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start workspace development tasks through Turborepo. |
| `pnpm build` | Build configured workspace packages and apps. |
| `pnpm typecheck` | Run TypeScript checks. |
| `pnpm test` | Run the configured Vitest suites. |
| `pnpm lint` | Run workspace lint scripts; some packages currently use placeholder scripts rather than a real linter. |
| `pnpm --filter api test:integration` | Run the MongoDB completion transaction integration test. |

The integration test requires `MONGODB_TEST_URI` for a disposable replica-set database with permission to create and drop databases. Never point it at production or a database containing data you need to keep.

## API routes

The API base path is `/api/v1`.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health/live` | Public | Liveness check. |
| `GET` | `/health` | Public | Reports the API process's current database readiness state. |
| `POST` | `/auth/register` | Public | Register an account. |
| `POST` | `/auth/login` | Public | Log in and receive a JWT. |
| `POST` | `/auth/logout` | Authenticated | Log out in the client by clearing its token. The JWT is not server-revoked. |
| `GET` | `/auth/me` | Authenticated | Get the current account. |
| `GET` | `/users/me` | Authenticated | Read the current profile and completion count. |
| `PATCH` | `/users/me` | Authenticated | Profile update endpoint; currently does not persist changes. |
| `GET` | `/users/me/history` | Authenticated | Read recent mission completions. |
| `POST` | `/challenges/generate` | Authenticated | Generate and save a mission. |
| `GET` | `/challenges/active` | Authenticated | Get the active mission. |
| `POST` | `/challenges/:id/start` | Authenticated | Start a mission. |
| `POST` | `/challenges/:id/complete` | Authenticated | Submit evidence and process its result. |
| `POST`, `GET` | `/spaces` | Authenticated | Create a Space or list the current user's Spaces. |
| `POST` | `/spaces/join` | Authenticated | Join a Space with its invite code. |
| `GET` | `/leaderboard` | Authenticated | Read the global leaderboard. |
| `GET` | `/leaderboard/spaces/:id` | Space member | Read that Space's leaderboard. |

Other implemented routes include challenge lookup, Space membership and challenge reads, public player profiles, and evidence upload-signature metadata. The API source in `apps/api/src/routes` is the authoritative route list.

## Deployment

The repository includes a root `vercel.json` that declares the `web` and `api` Vercel services and routes `/api/*` requests to the API service. A deployment still needs its environment variables configured in Vercel. Use `.env.example` as the variable inventory; set `NEXT_PUBLIC_API_URL` to the deployed API base URL and keep database, JWT, and AI credentials server-side.

The deployment configuration is present in the repository, but successful production behavior depends on the Vercel environment, MongoDB Atlas network access, and the selected AI provider. Do not assume local `.env` files are available in production.

## Contributing

Issues and pull requests are welcome. Before making changes, review the product and technical specifications in `.docs/` and check the current implementation rather than assuming every planned feature exists.

1. Create a focused branch.
2. Make a focused change and run the relevant checks.
3. Open a pull request describing the change and the checks performed.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
