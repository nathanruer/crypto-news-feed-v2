# CryptoFeed

Dashboard web temps reel affichant les news crypto provenant du flux WebSocket de [Tree of Alpha](https://news.treeofalpha.com).

## Prerequisites

- [Node.js](https://nodejs.org/) 22 LTS
- [Bun](https://bun.sh/) (package manager)
- [Docker](https://www.docker.com/) (PostgreSQL local)

## Getting started

```bash
# Install dependencies
bun install

# Start PostgreSQL
docker compose up -d

# Apply database migrations
bun db:migrate

# Start dev server
bun dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun test` | Run all tests (Vitest) |
| `bun lint` | Lint (ESLint) |
| `bun lint:fix` | Lint with auto-fix |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:migrate` | Apply migrations |
| `bun db:studio` | Open Drizzle Studio |

## Environment variables

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://cryptofeed:cryptofeed@localhost:5432/cryptofeed` | PostgreSQL connection string |
| `TREE_OF_ALPHA_WS_URL` | `wss://news.treeofalpha.com/ws` | Tree of Alpha WebSocket URL |

## Architecture

See [CLAUDE.md](CLAUDE.md) for full architecture documentation, conventions, and development process.
