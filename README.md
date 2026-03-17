# Feedback Board - Client-Server Architecture

A modern feedback management system with a feature-driven design architecture.

## Project Structure

```
feedback-board/
├── client/                          # Next.js Frontend
│   ├── app/                         # App Router (Next.js 13+)
│   │   ├── feedback/               # Feedback feature routes
│   │   ├── auth/                   # Authentication routes
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Home page
│   ├── features/                   # Feature-driven modules
│   │   ├── feedback/               # Feedback feature
│   │   │   ├── types.ts            # Type definitions
│   │   │   └── service.ts          # Business logic
│   │   └── auth/                   # Authentication feature
│   │       ├── types.ts
│   │       └── service.ts
│   ├── config/                     # Configuration files
│   │   └── api.ts                  # API configuration
│   ├── lib/                        # Utilities
│   │   └── apiClient.ts            # Axios client with interceptors
│   ├── public/                     # Static assets
│   ├── package.json                # Client dependencies
│   └── .env.local                  # Environment variables
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── features/               # Feature-driven modules
│   │   │   ├── feedback/           # Feedback feature
│   │   │   │   ├── types.ts        # Type definitions
│   │   │   │   ├── service.ts      # Business logic
│   │   │   │   └── routes.ts       # API endpoints
│   │   │   └── auth/               # Authentication feature
│   │   │       ├── types.ts
│   │   │       ├── service.ts
│   │   │       └── routes.ts
│   │   ├── middleware/             # Global middleware
│   │   │   ├── errorHandler.ts
│   │   │   └── auth.ts
│   │   ├── config/                 # Configuration
│   │   └── index.ts                # Server entry point
│   ├── package.json                # Server dependencies
│   ├── tsconfig.json
│   └── .env                        # Environment variables
│
└── package.json                     # Root workspace configuration
```

## Architecture Features

### Feature-Driven Design

Each feature is self-contained with:
- **types.ts** - TypeScript interfaces and types
- **service.ts** - Business logic and API calls
- **routes.ts** (server) - API endpoint definitions
- **components/** (client) - UI components (optional)

### Client (Next.js + React)

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios with interceptors
- **State Management**: React hooks (can be extended with Redux/Zustand)
- **Type Safety**: TypeScript 5

### Server (Node.js + Express)

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: In-memory storage (ready for database integration)
- **API**: RESTful endpoints
- **Middleware**: Error handling, CORS, JSON parsing

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm

### Initial Setup

1. **Install root dependencies:**
   ```bash
   npm install
   ```

This will install `concurrently` for running both apps simultaneously.

### Running the Application

#### Option 1: Run Both Client and Server Together (Recommended for Development)

```bash
npm run dev
```

This starts:
- Client on `http://localhost:3000`
- Server on `http://localhost:3001`

#### Option 2: Run Client and Server Separately

**Terminal 1 - Start Client:**
```bash
npm run dev:client
```
Client runs on `http://localhost:3000`

**Terminal 2 - Start Server:**
```bash
npm run dev:server
```
Server runs on `http://localhost:3001`

### Building for Production

```bash
npm run build
```

This builds both client and server.

### Running Production Build

```bash
npm start
```

## API Endpoints

### Feedback Feature

- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/:id` - Get feedback by ID
- `POST /api/feedback` - Create new feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

### Authentication Feature

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

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

## Available Commands

### Root Commands

```bash
npm run dev              # Run both client and server
npm run dev:client       # Run only client
npm run dev:server       # Run only server
npm run build            # Build both apps
npm run build:client    # Build only client
npm run build:server    # Build only server
npm run start            # Start production server
npm run lint             # Lint both apps
```

### Client Commands

```bash
cd client
npm run dev              # Development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Server Commands

```bash
cd server
npm run dev              # Development with watch mode
npm run build            # Compile TypeScript
npm run start            # Start compiled server
npm run lint             # Run ESLint
```

## Development Workflow

1. **Features are organized by domain**, each containing all related code
2. **Types are defined** in `types.ts` for consistency
3. **Services handle** all business logic and API calls
4. **Routes/Pages use** services to fetch and manipulate data
5. **Middleware handles** cross-cutting concerns

## Extending the Architecture

### Adding a New Feature

1. Create a new directory under `features/`
2. Add `types.ts`, `service.ts`, and `routes.ts` (server) or components (client)
3. Import and use in your pages/routes

Example structure for a new "comments" feature:

```
features/comments/
├── types.ts           # Comment interfaces
├── service.ts         # Business logic
├── routes.ts          # API routes (server)
└── components/        # React components (client)
```

### Adding Shared Components

For components used across features:

```
components/
├── Button.tsx
├── Card.tsx
└── ...
```

## Next Steps for Production

- [ ] Add database integration (MongoDB, PostgreSQL, etc.)
- [ ] Implement JWT authentication
- [ ] Add validation (client & server)
- [ ] Setup CI/CD pipeline
- [ ] Add unit and integration tests
- [ ] Configure environment variables per environment
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement error tracking (Sentry)
- [ ] Setup monitoring and logging

## Troubleshooting

### Port Already in Use

- Client port 3000: Change in `client/next.config.ts`
- Server port 3001: Change `PORT` in `server/.env`

### CORS Issues

CORS is configured in `server/src/index.ts` to accept requests from localhost.

### Environment Variables Not Loading

Make sure files are named correctly:
- Client: `.env.local`
- Server: `.env`

## License

MIT
