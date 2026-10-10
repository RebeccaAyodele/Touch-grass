<div align="center">

# 🌱 Touch Grass

### *The phone is the scoreboard. The game happens outside.*

**An AI-powered real-world outdoor challenge game built for the Hacktoberfest Open-Source AI Challenge.**

[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-green?style=flat-square)](https://github.com/RebeccaAyodele/Touch-grass)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Powered by Gemma 2](https://img.shields.io/badge/AI-Gemma%202%20(Open%20Weight)-blue?style=flat-square)](https://ai.google.dev/gemma)
[![Built with Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square)](https://nextjs.org)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=flat-square)](https://www.mongodb.com/atlas)

[Demo](#) · [Report Bug](https://github.com/RebeccaAyodele/Touch-grass/issues) · [Request Feature](https://github.com/RebeccaAyodele/Touch-grass/issues)

</div>

---

## 🎯 What is Touch Grass?

Touch Grass is an **open-source, AI-powered game** that gets you off your screen and into the real world. Instead of doom-scrolling, you complete **AI-generated real-world outdoor missions** — noticing nature, exploring your surroundings, doing mindful pauses — and earn XP for it.

**The twist:** the phone is just the scoreboard. The actual game happens outside.

### Core Loop
```
Choose a vibe  →  AI generates a real-world mission  →  Put phone away
→  Go outside & do the mission  →  Come back & submit evidence
→  AI evaluates your observation  →  Earn XP + discovery bonus  →  Level up
```

---

## ✨ Features

- 🤖 **Open-Weight AI Game Master** — Powered by [Gemma 2](https://ai.google.dev/gemma) (9B), an open-weight model. Runs via Groq/Together AI (cloud) or Ollama (100% local, no API key needed)
- 🌍 **7 Experience Themes** — Observe, Calm, Discover, Explore, Active, Social, Surprise
- ⏱️ **4 Duration Tiers** — 10, 20, 30, or 60-minute missions with scaled XP rewards
- 📊 **Deterministic XP Engine** — Transparent, auditable scoring with discovery bonuses evaluated by AI
- 🏕️ **Spaces** — Create friend rooms for asynchronous group quests and leaderboards
- 📵 **Phone-Away Mode** — Minimalist screen encouraging you to actually go outside
- 🎉 **Level-Up Celebrations** — Confetti, animations, and XP breakdowns
- 🔒 **JWT Authentication** — Secure user sessions with bcrypt password hashing
- 🌐 **Fully Open Source** — Self-hostable, hackable, and contribution-friendly

---

## 🏗️ Architecture

```
touch-grass/                    # pnpm + Turborepo monorepo
├── apps/
│   ├── web/                    # Next.js 16 (App Router) frontend
│   └── api/                    # Express.js REST API
└── packages/
    ├── shared/                 # Zod schemas & TypeScript types
    ├── game/                   # Pure TS game engine (XP, levels, anti-cheat)
    ├── ai/                     # Gemma 2 provider + Mastra workflows
    └── db/                     # MongoDB repositories & indexes
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, Tailwind CSS v4, TypeScript |
| **Backend** | Express.js, JWT, Zod, bcrypt |
| **AI Model** | Gemma 2 9B (open-weight) via Groq / Together AI / Ollama |
| **Database** | MongoDB Atlas (free M0 tier) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Language** | TypeScript throughout |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- A MongoDB instance (Atlas free tier or local)

### 1. Clone the repo

```bash
git clone https://github.com/RebeccaAyodele/Touch-grass.git
cd Touch-grass
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/touch_grass

# AI Provider (choose one — or leave as 'mock' for offline dev)
AI_PROVIDER=mock           # No API key needed
# AI_PROVIDER=groq         # https://console.groq.com (free tier)
# AI_PROVIDER=ollama       # Local inference (see below)
```

### 4. Run in development

```bash
# In separate terminals:
pnpm --filter api dev    # API → http://localhost:4000
pnpm --filter web dev    # Web → http://localhost:3000
```

---

## 🤖 AI Provider Options

Touch Grass supports three AI backends — all using the open-weight **Gemma 2** model:

### Option A: Mock (Offline, zero setup)
```env
AI_PROVIDER=mock
```
Uses deterministic fallback challenges. No API key or internet required. Perfect for development.

### Option B: Groq (Cloud, free tier)
```env
AI_PROVIDER=groq
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=your_groq_api_key
AI_MODEL=gemma2-9b-it
```
Get a free API key at [console.groq.com](https://console.groq.com). Fastest inference.

### Option C: Together AI
```env
AI_PROVIDER=together
AI_BASE_URL=https://api.together.xyz/v1
AI_API_KEY=your_together_api_key
AI_MODEL=google/gemma-2-9b-it
```

### Option D: Ollama (100% Local, no API key)
```bash
# Install Ollama: https://ollama.ai
ollama pull gemma2:9b
```
```env
AI_PROVIDER=ollama
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=gemma2:9b
```

---

## 🎮 Game Mechanics

### XP & Scoring

| Duration | Base XP | Max Discovery Bonus |
|----------|---------|-------------------|
| 10 min   | 200 XP  | +80 XP |
| 20 min   | 350 XP  | +140 XP |
| 30 min   | 500 XP  | +200 XP |
| 60 min   | 750 XP  | +300 XP |

The **Discovery Bonus** (0–100%) is evaluated by the AI Game Master based on the quality, detail, and novelty of your field observation submission.

### Level Progression

Level N requires: `XP = 100 × (N-1) × N ÷ 2`

| Level | Total XP Required |
|-------|-----------------|
| 1     | 0 XP |
| 2     | 100 XP |
| 5     | 1,000 XP |
| 10    | 4,500 XP |

### Experience Themes

| Theme | Emoji | Description |
|-------|-------|-------------|
| Observe | 👀 | Notice details hidden in plain sight |
| Calm | 🌿 | Mindful pause, listening & stillness |
| Discover | 📸 | Botanical & texture foraging |
| Explore | 🧭 | New perspective on familiar space |
| Active | 🏃 | Movement & perimeter circuit |
| Social | 👥 | Partner discovery with a friend |
| Surprise | 🎲 | Spontaneous creative mission |

---

## 📡 API Reference

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Service health check |
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Login & get JWT |
| `GET` | `/auth/me` | Yes | Get current user |
| `POST` | `/challenges/generate` | Yes | AI generates a mission |
| `POST` | `/challenges/:id/start` | Yes | Start active mission |
| `POST` | `/challenges/:id/complete` | Yes | Submit evidence & earn XP |
| `GET` | `/leaderboard` | Yes | Global XP rankings |
| `POST` | `/spaces` | Yes | Create a friend space |
| `POST` | `/spaces/join` | Yes | Join via invite code |

---

## 🤝 Contributing

Contributions are what make open source amazing! All contributions are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Ideas for contributions
- 🌍 Localization / translations
- 🏅 New badge types and achievement system
- 📱 React Native / mobile app
- 🗺️ Map integration for location-based missions
- 🎵 Ambient sound mode for Phone-Away screen

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [Google DeepMind](https://deepmind.google/) for the open-weight [Gemma 2](https://ai.google.dev/gemma) model
- [Groq](https://groq.com/) for blazing-fast open-model inference
- [Ollama](https://ollama.ai/) for making local AI inference accessible
- [MongoDB Atlas](https://www.mongodb.com/atlas) for the free database tier
- Built for [Hacktoberfest](https://hacktoberfest.com/) Open-Source AI Challenge 🎃

---

<div align="center">
Made with 🌿 by <a href="https://github.com/RebeccaAyodele">Rebecca Ayodele</a>
<br/>
<em>Go touch some grass.</em>
</div>
