# Radioactive

Radioactive is a real-time multiplayer racing game platform built with a modern web stack.

## Monorepo Structure

```
radioactive/
├── ra-frontend/   # Next.js App Router frontend (React, Tailwind CSS, Clerk Auth)
├── ra-backend/    # Backend (TypeScript, Drizzle, Cloudflare Workers)
```

---

## ra-frontend

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Auth:** [Clerk](https://clerk.com/)
- **UI:** React, Tailwind CSS
- **Features:** Live race view, player list, command panel, telemetry bar

### Getting Started

```bash
cd ra-frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Project Structure

- `app/` — Next.js app directory (routes, pages, layouts)
- `components/` — Reusable React components
- `hooks/` — Custom React hooks
- `lib/` — Utility libraries
- `public/` — Static assets

### Linting

```bash
pnpm lint
```

### Deployment

Deploy easily on [Vercel](https://vercel.com/).

---

## ra-backend

- **Language:** TypeScript
- **Database:** Drizzle ORM
- **Platform:** Cloudflare Workers

### Getting Started

```bash
cd ra-backend
pnpm install
# Setup environment variables in `.env`
# Run migrations if needed
# Start the worker (see wrangler.jsonc for config)
```

### Project Structure

- `src/` — Source code for backend logic
- `migrations/` — Database migration scripts

---

## Development

- Use [pnpm](https://pnpm.io/) for dependency management.
- Each package (`ra-frontend`, `ra-backend`) is developed and run independently.

---

## License

MIT

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)