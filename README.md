# Feedback Board

A feedback management system developed with Next.js and PocketBase. The platform supports multi-tenant workspaces, threaded discussions, and custom voting mechanics, designed for product teams to collect and organize user input.

## Features

- Workspaces: Multi-tenant environment support. Users can create, join, and filter suggestions by workspace context.
- Suggestions & Voting: Core system for creating suggestions, complete with upvote and downvote capabilities.
- Discussion Threads: Multi-level nested commenting system.
- Administrative Controls: Dedicated admin dashboard for content moderation, category management, and workflow configuration.
- Workspace Customization: Configurable URL slugs and prefixes per workspace.
- Infrastructure Monitoring: Prometheus and Grafana integration for stack telemetry (Nginx, PocketBase, Redis, and container metrics via cAdvisor).
- User Profiles: Avatar management, security settings, and access control.

## Technology Stack

### Frontend
- Next.js 15 (App Router)
- React
- Tailwind CSS

### Backend & Infrastructure
- PocketBase (Authentication, Database, API)
- Grafana & Prometheus (Monitoring)

## Project Structure

```
feedback-board/
├── app/                  # Next.js App Router (Pages, Layouts)
│   ├── admin/           # Admin Dashboard
│   ├── auth/            # Authentication flows
│   ├── w/               # Workspace-specific routing
│   └── suggestions/     # Suggestion details & discussions
├── components/          # React components
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities
├── public/              # Static assets
└── types/               # TypeScript definitions
```

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd feedback-board
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure PocketBase:
   - Download the PocketBase executable.
   - Start the server: `./pocketbase serve`
   - Access the admin UI at `http://127.0.0.1:8090/_/` and import the schema definition (`pb-schema.json`) via Settings -> Import collections.

4. Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Infrastructure & Monitoring

The project includes configurations for telemetry and monitoring. Refer to the monitoring configuration files to provision the stack, which includes:
- Prometheus (Metrics collection)
- Grafana (Dashboards)
- cAdvisor (Container metrics)
- Specialized exporters

## Security & Access Control

- Data access is governed by workspace membership and visibility settings.
- Comments and suggestions can be managed by their respective authors or system administrators.
- The Admin Panel requires explicit role designation.
- PocketBase API rules enforce data boundaries between workspaces and users.

## License

MIT
