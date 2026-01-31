# Portfolio Website

This is a modern, responsive portfolio website built with Vite, React, TypeScript, Tailwind CSS, and Zod.

## Applications

- **Frontend**: React + Vite app (apps/frontend)
- **API**: Fastify + tRPC server (apps/api)

## Installation

1. **Clone the repository:**

	```sh
	git clone https://github.com/faering/portfolio-website.git
	cd portfolio-website
	```

2. **Install dependencies:**

	```sh
	pnpm install
	```

## Usage

### Development

Start the local development servers (frontend + API) together:

```sh
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or as indicated in your terminal).

### Run apps individually

Frontend only:

```sh
pnpm frontend:dev
```

API only:

```sh
pnpm api:dev
```

### Debugging the API (localhost:3001)

The API runs on [http://localhost:3001](http://localhost:3001). Useful endpoints:

- `GET /auth/me` — check current auth session
- `GET /trpc/projects.list` — tRPC query (requires correct tRPC client payload)

Logs are printed to the terminal running `pnpm api:dev`.

### Accessing Postgres via pgAdmin (localhost:5050)

Start your Docker stack, then open pgAdmin at [http://localhost:5050](http://localhost:5050).

Use the connection settings from your docker-compose + env:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `portfolio`
- **Username**: `portfolio`
- **Password**: `portfolio`

### Production Build

To build the app for production:

```sh
pnpm build
```

To preview the production build locally:

```sh
pnpm preview
```

---

For more details, see [CHANGELOG.md](CHANGELOG.md) and [DEVLOG.md](DEVLOG.md).
