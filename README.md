# Feedback Board

A modern feedback management system built with Next.js 16 and PocketBase.

## 🚀 Features

- **Suggestions**: Create, view, and manage feedback suggestions.
- **Nested Comments**: Multi-level threaded discussions with real-time updates.
- **Advanced Voting**: Upvote and downvote systems for both suggestions and comments.
- **Dynamic Categories**: Manage categories with custom icons directly from the Admin Panel.
- **Real-time Notifications**: Get notified about status changes and new comments.
- **Admin Panel**: Comprehensive dashboard for moderators to manage content and categories.
- **User Settings**: Customizable profiles with avatar uploads and password security.
- **Modern UI**: Sleek dark-themed design with smooth animations and responsive layout.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Backend**: PocketBase (Go-based BaaS)
- **Styling**: Vanilla CSS (Premium Custom Design) + Tailwind CSS
- **State/Data**: PocketBase SDK + React Hooks
- **Icons**: Lucide React + Custom Emoji Picker

## 📂 Project Structure

```
feedback-board/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── admin/           # Admin Dashboard
│   ├── auth/            # Login, Register, Settings
│   └── suggestions/     # Suggestion details & discussions
├── components/          # Reusable UI components
├── hooks/               # Custom hooks (Auth, Comments, Votes, etc.)
├── lib/                 # Core utilities (PocketBase client)
├── public/              # Static assets (images, fonts)
├── types/               # TypeScript definitions
└── pb-schema.json       # PocketBase collection & rule definitions
```

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd feedback-board
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure PocketBase:**
   - Download [PocketBase](https://pocketbase.io/).
   - Start the server: `./pocketbase serve`.
   - Import `pb-schema.json` via the PocketBase Admin UI (Settings -> Import collections).

4. **Environment Variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔐 Permissions & Security

- **Suggestions**: Publicly viewable; creation and voting require authentication.
- **Comments**: Authors can edit/delete; anyone authenticated can vote.
- **Admin**: Only users with the `admin` role can access the dashboard.
- **Rules**: PocketBase API rules are optimized for data isolation and cross-user interactions.

## 📜 License

MIT
