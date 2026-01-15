# Social Club Platform

A modern, full-featured social club and networking platform built with React, TypeScript, and Supabase.

## 🚀 Live Demo

- **Preview**: [Preview URL](https://id-preview--c4cc7ef9-b4c3-4c97-8cd0-fc758a50847e.lovable.app)
- **Production**: [Production URL](https://makefriendsandsocializecom.lovable.app)

## ✨ Features

### Core Features
- **Member Portal** - Dashboard, profile management, connections
- **Events System** - RSVP, waitlists, calendar integration
- **Slow Dating** - Curated matchmaking with compatibility scoring
- **Business Directory** - Professional networking and introductions
- **Connected Circles** - Exclusive community groups
- **Journal/Blog** - Content with likes, comments, bookmarks

### Technical Features
- **Authentication** - Email/password with MFA for admins
- **Payments** - Stripe integration for subscriptions and one-time purchases
- **Notifications** - Email (Resend), SMS (Twilio), Push (Web Push API)
- **Analytics** - Google Analytics, custom event tracking
- **Error Tracking** - Sentry integration
- **PWA Support** - Installable, offline capable

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Payments**: Stripe
- **Email**: Resend
- **SMS**: Twilio
- **Monitoring**: Sentry, UptimeRobot

## 📁 Project Structure

```
├── src/
│   ├── components/      # React components
│   │   ├── admin/       # Admin dashboard components
│   │   ├── auth/        # Authentication components
│   │   ├── dating/      # Slow dating features
│   │   ├── home/        # Landing page sections
│   │   ├── layout/      # Header, Footer, Layout
│   │   ├── portal/      # Member portal components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   └── integrations/    # External service clients
├── supabase/
│   ├── functions/       # Edge functions
│   ├── migrations/      # Database migrations
│   └── seed.sql         # Test data
├── docs/                # Documentation
├── e2e/                 # Playwright E2E tests
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) for complete setup instructions.

Required variables:
- `VITE_SUPABASE_URL` - Auto-configured
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Auto-configured
- `RESEND_API_KEY` - Email service
- `STRIPE_SECRET_KEY` - Payment processing

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

### E2E Tests (Playwright)

```bash
# Install browsers
npx playwright install

# Run tests
npx playwright test

# With UI
npx playwright test --ui
```

## 📦 Deployment

### Deploy to Production

1. In Lovable, click **Share** → **Publish**
2. Connect custom domain in Project Settings → Domains

### Deployment Checklist

See [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) for complete steps including:
- Environment variables setup
- CDN configuration (Cloudflare)
- Monitoring setup (UptimeRobot, Sentry)
- Load testing with k6

## 🗄 Database

### Migrations

Database schema is managed through Supabase migrations in `supabase/migrations/`.

### Seed Data

```bash
# Apply seed data for testing
# Run supabase/seed.sql in Supabase SQL editor
```

### Key Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles and preferences |
| `memberships` | Subscription status and tiers |
| `events` | Event listings |
| `event_rsvps` | Event registrations |
| `dating_profiles` | Slow dating profiles |
| `dating_matches` | Match records |
| `connections` | Member connections |

## 📚 Documentation

- [Environment Setup](docs/ENVIRONMENT_SETUP.md)
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
- [Monitoring Guide](docs/MONITORING.md)
- [Email Setup](docs/EMAIL_SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE_400K.md)

## 🔒 Security

- Row Level Security (RLS) on all tables
- MFA required for admin access
- Rate limiting on sensitive endpoints
- Encrypted sensitive data storage
- CORS properly configured
- Webhook signature verification

## 📊 Monitoring

### Error Tracking
Sentry captures and reports frontend and backend errors.

### Uptime Monitoring
UptimeRobot monitors key endpoints with 5-minute intervals.

### Analytics
- Google Analytics 4 for user behavior
- Custom analytics_events table for business metrics

## 🤝 Contributing

1. Create a feature branch
2. Make changes with tests
3. Submit pull request

## 📝 License

Private - All rights reserved

## 🆘 Support

For issues or questions:
- Check documentation in `/docs`
- Contact: support@yourplatform.com
