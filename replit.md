# SafariQuote Pro - Multi-Tenant Quotation Management SaaS

## Overview

SafariQuote Pro is a multi-tenant SaaS platform for quotation management that enables administrators to create company accounts, where each company can manage their own quotations, clients, and business settings. Built with React, TypeScript, Tailwind CSS, and Supabase for authentication and data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for Replit deployment (port 5000, HMR over port 443)
- React Router DOM v7 for client-side routing and navigation

**UI Layer**
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Custom component library including Layout, Sidebar, and Header components
- Responsive design approach for desktop, tablet, and mobile devices

**State Management & Data Fetching**
- Custom React hooks pattern for data operations (useQuotations, useClients, useCompanies)
- Local state management with useState and useEffect
- React Hook Form with Zod resolvers for form validation and handling

**Key Features**
- Dashboard with quotation filtering and search
- Multi-step quotation creation with line items, tax, and discount calculations
- Client (customer) management system
- Company settings configuration
- PDF export functionality using jsPDF and jsPDF-autotable
- Real-time calculation engine for subtotals, taxes, discounts, and totals

### Backend Architecture

**Database ORM**
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL adapter with WebSocket support
- Schema-first approach with shared schema definitions

**Data Models**
The system uses five core tables:
- `companies` - Business information and default settings (tax rates, currency, terms)
- `clients` - Customer records with contact and address information
- `quotations` - Quote records with status tracking (draft, sent, accepted, rejected, expired)
- `quotation_items` - Line items for each quotation
- `templates` - PDF template configurations

**Business Logic**
- Calculation utilities for line totals, subtotals, taxes, discounts, and final totals
- Support for both percentage-based and fixed-amount discounts
- Quote number generation with customizable prefixes
- Date formatting and currency formatting utilities

### External Dependencies

**Primary Database**
- Supabase as the backend-as-a-service platform
- PostgreSQL database with real-time capabilities
- Client SDK: `@supabase/supabase-js` v2.57.4
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Alternative Database Option**
- Neon serverless PostgreSQL support via `@neondatabase/serverless`
- WebSocket connection support for real-time features
- Environment variable: `DATABASE_URL`

**PDF Generation**
- jsPDF v3.0.3 for PDF document creation
- jsPDF-autotable v5.0.2 for table generation in PDFs
- Custom PDF generator utility with company branding support

**Development & Type Safety**
- TypeScript 5.5 with strict mode enabled
- ESLint with React-specific plugins for code quality
- Zod v4 for runtime type validation
- drizzle-zod for database schema validation

**Utility Libraries**
- date-fns v4.1.0 for date manipulation
- React Query (TanStack Query) v5.90.5 for server state management (installed but not actively used in current codebase)

**Routing**
- React Router DOM v7.9.5 for primary routing
- Wouter v3.7.1 as an alternative lightweight router (installed but not actively used)