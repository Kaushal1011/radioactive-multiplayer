# ☢️ Radioactive

> A real-time multiplayer racing game platform built with a modern web stack

🎮 **[Play Now](https://radioactive.dev/)** | 🚀 Built with Next.js, Cloudflare Workers & WebSockets

---

## 🌟 Features

- **Real-time Multiplayer Racing**: Compete with players in live racing sessions
- **Live Telemetry**: Track player positions, speed, and race metrics in real-time
- **Modern Auth**: Secure authentication powered by Clerk
- **Serverless Architecture**: Built on Cloudflare Workers for global low-latency gameplay
- **Responsive UI**: Sleek interface with Tailwind CSS and Radix UI components

---

## 📦 Monorepo Structure

```
radioactive/
├── ra-frontend/    # Next.js App Router frontend
│   ├── React 19, Tailwind CSS, Framer Motion
│   ├── Clerk Authentication
│   └── Real-time race UI components
│
└── ra-backend/     # Cloudflare Workers backend
    ├── Hono web framework
    ├── Drizzle ORM (D1 database)
    └── Physics simulation & race logic
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended package manager)
- [Cloudflare account](https://cloudflare.com/) (for backend deployment)
- [Clerk account](https://clerk.com/) (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kaushal1011/radioactive-multiplayer.git
   cd radioactive-multiplayer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

---

## 🎨 Frontend (ra-frontend)

### Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Auth**: [Clerk](https://clerk.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Development

```bash
cd ra-frontend
pnpm install
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Project Structure
```
ra-frontend/
├── app/              # Next.js app directory (routes, layouts, pages)
├── components/       # Reusable React components
│   ├── ui/          # Base UI components (Radix-based)
│   └── ...          # Game-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries and helpers
├── public/          # Static assets (images, fonts, etc.)
└── package.json     # Dependencies and scripts
```

### Available Scripts

```bash
pnpm dev          # Start development server (with Turbopack)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm preview      # Preview on Cloudflare Pages locally
pnpm deploy-pg    # Deploy to Cloudflare Pages
```

### Deployment

The frontend can be deployed to:
- **[Vercel](https://vercel.com/)** (recommended for Next.js)
- **[Cloudflare Pages](https://pages.cloudflare.com/)** (using `@cloudflare/next-on-pages`)

For Vercel deployment:
```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
cd ra-frontend
vercel
```

---

## ⚙️ Backend (ra-backend)

### Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/) (lightweight web framework)
- **Language**: TypeScript
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Auth**: Clerk Backend SDK

### Development

```bash
cd ra-backend
pnpm install

# Configure environment variables
# Create a .dev.vars file with your Clerk keys

pnpm dev
```

### Project Structure

```
ra-backend/
├── src/
│   ├── index.ts      # Main worker entry point
│   ├── room.ts       # Game room management
│   ├── physics.ts    # Physics simulation engine
│   ├── types.ts      # TypeScript type definitions
│   └── db/
│       └── schema.ts # Drizzle database schema
├── migrations/       # Database migration scripts
├── wrangler.jsonc    # Cloudflare Workers configuration
└── package.json      # Dependencies and scripts
```

### Available Scripts

```bash
pnpm dev          # Start local development server
pnpm deploy       # Deploy to Cloudflare Workers
pnpm cf-typegen   # Generate TypeScript types for Workers
```

### Database Setup

The backend uses Cloudflare D1 with Drizzle ORM. To set up the database:

```bash
# Run migrations
wrangler d1 migrations apply YOUR_DATABASE_NAME
```

### Deployment

Deploy to Cloudflare Workers:
```bash
cd ra-backend
pnpm deploy
```

Make sure to configure your `wrangler.jsonc` with the correct account ID and bindings.

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`ra-frontend/.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_BACKEND_URL=your_backend_worker_url
```

#### Backend (`ra-backend/.dev.vars`)
```env
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

---

## 🎮 Game Architecture

The game uses a client-server architecture with real-time synchronization:

1. **Frontend**: Renders the game UI and sends player inputs
2. **Backend (Cloudflare Workers)**:
   - Manages game rooms and player sessions
   - Runs physics simulations
   - Broadcasts game state to all connected players
3. **Real-time Communication**: WebSocket connections for low-latency updates

---

## 🛠️ Development Tips

- **Monorepo Management**: This is a pnpm workspace. Dependencies in the root `package.json` are shared across workspaces.
- **Hot Reload**: Frontend uses Turbopack for fast hot-reloading during development.
- **Type Safety**: Both frontend and backend use TypeScript with strict type checking.
- **Linting**: Run `pnpm lint` in `ra-frontend` to check code quality.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Hono Framework](https://hono.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Built with ❤️ by [Kaushal1011](https://github.com/Kaushal1011)**
