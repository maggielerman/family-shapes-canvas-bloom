# Family Shapes - Family Tree & Donor Connection Platform

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

---

**Built with ❤️ for families, fertility clinics, and donor communities**
