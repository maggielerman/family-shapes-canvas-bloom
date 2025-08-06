# Family Shapes - Family Tree & Donor Connection Platform

> **DB Migrations & Drift Policy:** See [`.cursorrules`](./.cursorrules) and [Agent / Automation Instructions](./documentation/agents.md).

A comprehensive web application for building interactive family trees, managing donor connections, and facilitating biological family relationships. Built for fertility clinics, sperm banks, donor communities, and families seeking to connect with biological relatives.

## 🌟 Key Features

### 🏗️ Interactive Family Tree Builder
- **Multiple Layout Algorithms**: Choose from Dagre, ELK, Radial, Force-directed, and Cluster layouts
- **Drag & Drop Interface**: Reposition family members with real-time visual feedback
- **Visual Connections**: Color-coded relationship lines with customizable attributes
- **Real-time Updates**: Add new family members and connections with immediate visual feedback
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 👥 Organization Management
- **Multi-tenant Architecture**: Support for fertility clinics, sperm banks, donor communities, and family groups
- **Role-based Access Control**: Owner, Admin, Editor, and Viewer permissions
- **Custom Subdomains**: Each organization gets `organization.familyshapes.com`
- **Professional Onboarding**: 3-step guided setup for new organizations

### 🧬 Donor Database Management
- **Comprehensive Donor Profiles**: Physical characteristics, medical history, and contact information
- **Verification System**: Multi-level verification (Unverified, Pending, Verified, Rejected)
- **Privacy Controls**: Public, Members-only, or Admin-only visibility settings
- **Search & Filtering**: Advanced search capabilities with custom fields
- **Import/Export**: Bulk data management for large donor databases

### 🔗 Connection Management
- **Biological Relationships**: Parent-child, sibling, partner, and donor relationships
- **Sibling Groups**: Automatic creation and management of donor sibling groups
- **Privacy Levels**: Control sharing of contact info, photos, and medical history
- **Communication Tools**: Built-in messaging and notification systems

### 🔄 Context Switching
- **Seamless Navigation**: Switch between personal account and organization views
- **Multi-organization Support**: Manage multiple organizations from one interface
- **Role Indicators**: Clear visual representation of user roles across organizations
- **Smart Routing**: Automatic redirection based on account type and setup status

### 📧 Contact & Communication
- **Professional Contact Form**: Secure form submission with email notifications
- **Resend Integration**: Reliable email delivery via Resend service
- **User Confirmation**: Automatic confirmation emails to form submitters
- **Support Team Notifications**: Instant notifications for customer inquiries

### 🚀 Unified Onboarding
- **Interactive Get Started Page**: Role-based user experience for all audiences
- **Family Onboarding**: Immediate access to signup and dashboard
- **Organization Waitlist**: Cryobank and clinic registration system
- **Donor Interest Tracking**: Donor feature interest collection

### 🧑‍⚕️ Donor Portal (NEW)
- **Self-Service Onboarding**: Quick 3-minute signup with donor-specific workflow
- **Privacy Controls**: Anonymous, semi-open, or open donation with granular settings
- **Health Management**: Medical history tracking with 12-month update reminders
- **Secure Communication**: Policy-compliant messaging with recipient families
- **Profile Preview**: Real-time preview of how information appears to different audiences

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Visualization**: XYFlow (React Flow) with multiple layout engines
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with organization account support
- **Email Service**: Resend for reliable email delivery
- **Deployment**: Netlify with custom domain support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account for database and authentication

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd family-shapes-canvas-bloom

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For local DB tooling (Makefile/scripts), also create a root-level `.env` (not committed):

```env
SUPABASE_PROJECT_REF=nhkufibfwskdpzdjwirr
SUPABASE_DB_PASSWORD=your-remote-db-password
```

### Database Migrations

This repo uses **Supabase migrations as the source of truth**. Do not edit production in the Dashboard.

**Common tasks**

```bash
make            # list all DB targets
make db/status  # local stack status
make db/reset   # rebuild local from migrations (+ seed.sql if present)
make db/diff name=0002_short_description  # create a new migration
make db/types   # regenerate TS types
make db/check   # ensure no drift vs PROD
make db/push    # apply migrations to PROD (after PR merge/CI green)
```

> Baseline migration already exists: `supabase/migrations/20250806171912_0001_baseline_prod_schema.sql`. New work starts at `0002_*`.

## 📁 Project Structure

```
src/
├── components/
│   ├── family-trees/     # Family tree visualization components
│   ├── organizations/    # Organization management
│   ├── people/          # Person management
│   ├── connections/     # Connection management
│   └── ui/             # Reusable UI components
├── pages/               # Route components
├── services/            # API and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Database
npm run db:reset         # Reset database
npm run db:seed          # Seed with demo data
```

### Database Migrations

```bash
# Apply migrations
npx supabase db push

# Generate new migration
npx supabase db diff --schema public > supabase/migrations/new_migration.sql
```

## 📚 Documentation

Comprehensive documentation is available in the [`documentation/`](./documentation/) folder:

- **Implementation Summaries**: Detailed breakdowns of major features
- **Feature Documentation**: In-depth guides for organization features, layouts, and more
- **Contact Form Implementation**: Complete guide for the contact form with Resend integration
- **Deployment Guides**: Step-by-step deployment instructions
- **Performance Optimizations**: Performance improvements and fixes
- **Testing Documentation**: Comprehensive test coverage and strategies
- [Contact Form Implementation](./documentation/CONTACT_FORM_IMPLEMENTATION.md) - Details on the Resend email integration
- [Responsive Utilities Guide](./documentation/RESPONSIVE_UTILITIES.md) - Standardized responsive patterns and utilities
- [Get Started Page](./documentation/GET_STARTED_PAGE.md) - Interactive onboarding for all user types
- [Agent / Automation Instructions](./documentation/agents.md) — Required process for migrations and drift checks

## 🌐 Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Custom Domain

1. Add your domain in Netlify dashboard
2. Configure DNS records as instructed
3. SSL certificate is automatically provisioned

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./documentation/) folder
- Review existing issues on GitHub
- Create a new issue for bugs or feature requests

### Agent / Automation Instructions
Agents (Cursor, etc.) must follow our migration workflow and guardrails. See:
- `.cursorrules` – non‑negotiable rules
- `documentation/agents.md` – full guide

---

**Built with ❤️ for families, fertility clinics, and donor communities**


# Agent Instructions: Supabase Migrations & Drift Policy

This repository treats **SQL migrations in `supabase/migrations/` as the single source of truth** for the database schema. Agents (Cursor, etc.) and humans must follow this process. **Do not modify production via the Supabase Dashboard** except when explicitly instructed for emergencies.

## Environment assumptions

- Local `.env` exists at repo root and is **not committed**. Minimum keys:
  ```env
  SUPABASE_PROJECT_REF=nhkufibfwskdpzdjwirr
  SUPABASE_DB_PASSWORD=your-remote-db-password
  # Optional: SUPABASE_CI=1
  ```
- Supabase CLI is installed and the project is linked: `supabase link --project-ref <ref>` (the scripts auto-link if needed).

## Allowed commands (run from repo root)

- **Create a migration** from changes vs PROD:
  ```bash
  make db/diff name=0002_short_description
  ```
- **Verify** the repo can rebuild from migrations (idempotent):
  ```bash
  make db/reset
  make db/check   # must print: ✅ No drift.
  ```
- **Regenerate API types** (for TypeScript):
  ```bash
  make db/types
  ```
- **Apply to production** (only after PR review / CI green):
  ```bash
  make db/push
  ```

## Prohibited

- Editing production schema directly in the Supabase Dashboard.
- Modifying or deleting the baseline migration: `*_0001_baseline_prod_schema.sql`.
- Writing migrations outside `supabase/migrations/`.
- Committing `.env` or any secrets.

## File conventions

- CLI creates timestamped files: `YYYYMMDDHHMMSS_name.sql`.
- Dev/test data belongs in `supabase/seed.sql` (optional, idempotent), not inside schema migrations.
- Pre-baseline files are kept in `supabase/_archived_migrations/`; do **not** move them back into the loader path.

## Pull Request checklist (agents)

- [ ] Migration added under `supabase/migrations/` with a clear name.
- [ ] Local rebuild OK: `make db/reset`.
- [ ] Drift check OK: `make db/check` → prints **No drift**.
- [ ] Types updated if needed: `make db/types`.
- [ ] PR description summarizes schema/RLS/trigger impacts and any rollout notes.

## Troubleshooting

- **Drift check hangs or prompts**: ensure `.env` has `SUPABASE_PROJECT_REF` and `SUPABASE_DB_PASSWORD` with no quotes; re-run `make db/check`.
- **Local Postgres crash-loops after CLI update**: clear local Docker volumes and restart:
  ```bash
  supabase stop
  docker volume rm $(docker volume ls -q --filter label=com.supabase.cli.project=nhkufibfwskdpzdjwirr)
  supabase start
  ```
- **Pre‑push hook blocks push**: one-off bypass with `git push --no-verify`, then investigate with `make db/check`.
