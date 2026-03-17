# Quick Start Guide for Feedback Board

## Installation

```bash
npm install
```

This installs all dependencies for the monorepo including:
- Client dependencies (Next.js, React, Tailwind)
- Server dependencies (Express, TypeScript)
- Root dependency (concurrently)

## Running the Application

### Option 1: Run Both Client and Server (Recommended) 🎯

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/api

### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
npm run dev:client
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

## Project URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Next.js application |
| Backend | http://localhost:3001 | Express API server |
| Health Check | http://localhost:3001/api/health | API health endpoint |

## Key Endpoints

### Feedback API
- `GET /api/feedback` - List all feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback/:id` - Get feedback details
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Auth API
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

## Build for Production

```bash
npm run build
```

Start production server:
```bash
npm start
```

## NPM Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run both client & server |
| `npm run dev:client` | Run only frontend |
| `npm run dev:server` | Run only backend |
| `npm run build` | Build both apps |
| `npm run build:client` | Build only frontend |
| `npm run build:server` | Build only backend |
| `npm start` | Start production server |
| `npm run lint` | Lint both apps |

## Project Structure

```
📁 feedback-board/
├── 📁 client/              # Next.js Frontend
│   ├── app/               # App Router
│   ├── features/          # Feature modules
│   ├── config/            # Configuration
│   └── lib/               # Utilities
│
├── 📁 server/             # Express Backend
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── middleware/    # Express middleware
│   │   └── index.ts       # Entry point
│
└── 📄 package.json        # Monorepo config
```

## Adding a New Feature

1. Create feature directory:
```bash
mkdir -p client/features/myfeature
mkdir -p server/src/features/myfeature
```

2. Add files:
   - `types.ts` - TypeScript interfaces
   - `service.ts` - Business logic
   - `routes.ts` (server) - API endpoints

3. Import and use in your pages/routes

## Environment Variables

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Server (.env)
```
PORT=3001
NODE_ENV=development
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change in `client/next.config.ts` |
| Port 3001 in use | Change `PORT` in `server/.env` |
| CORS errors | Check `server/src/index.ts` middleware |
| API not responding | Ensure server is running on :3001 |

## Next Steps

- [ ] Implement database (MongoDB, PostgreSQL)
- [ ] Add form validation
- [ ] Setup authentication (JWT)
- [ ] Add tests (Jest, Vitest)
- [ ] Configure CI/CD
- [ ] Setup logging and monitoring

Happy developing! 🚀
