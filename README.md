# nxcore

NXCore - Next.js Enterprise Starter Kit dengan Redux Toolkit, NextAuth v5, dan Feature-Based Architecture.

## Installation

```bash
npm i nxcore
```

## Quick Start

```bash
npx nxcore my-app
cd my-app
npm run dev
```

## Features

- ⚡ **Next.js 16** - Latest Next.js with App Router
- 🔐 **NextAuth v5** - Authentication dengan session management
- 🗃️ **Redux Toolkit** - State management dengan RTK Query
- 🎨 **Tailwind CSS v4** - Styling dengan utility-first CSS
- 📦 **Feature-Based Architecture** - Modular dan scalable structure
- 🌙 **Dark Mode** - Built-in theme switching
- 🧩 **Radix UI** - Accessible component primitives
- 📱 **Responsive** - Mobile-first design

## Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── (root)/            # Main app routes
│   └── layout.tsx         # Root layout
├── features/              # Feature modules
│   ├── auth/              # Authentication feature
│   ├── menu/              # Menu/navigation feature
│   └── production-sewing/ # Example feature module
├── shared/                # Shared utilities
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility functions
│   └── config/            # Configuration
├── core/                  # Core configuration
│   ├── auth/              # Auth configuration
│   ├── store/             # Redux store
│   └── providers/         # App providers
├── assets/                # Global styles
└── types/                 # TypeScript types
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"
```

## Scripts

```bash
npm run dev      # Start development server (port 2000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This project follows a **Feature-Based Architecture** pattern:

- Each feature is self-contained with its own components, hooks, store, and types
- Shared code is in the `shared/` directory
- Core configuration is in the `core/` directory

Read `features/ARCHITECTURE.md` for detailed documentation.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Redux Toolkit |
| Auth | NextAuth v5 |
| UI | Radix UI, Lucide Icons |
| Notifications | Sonner |

## License

MIT © ozandilah
