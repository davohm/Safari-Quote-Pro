# SafariQuote Pro - Quotation Generator Setup Guide

## Overview

SafariQuote Pro is a comprehensive quotation management system that allows you to create, manage, and export professional quotations as PDF documents. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Dashboard**: View all quotations with filtering and search capabilities
- **Create Quotations**: Build detailed quotes with multiple line items, tax calculations, and discounts
- **Client Management**: Store and manage customer information
- **Company Settings**: Configure your business details and default settings
- **PDF Export**: Generate professional PDF documents with your branding
- **Status Tracking**: Track quotations through their lifecycle (draft, sent, accepted, rejected, expired)
- **Real-time Calculations**: Automatic subtotal, tax, discount, and total calculations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Getting Started

### 1. Database Setup

The database schema has already been created with the following tables:
- `companies` - Your business information
- `clients` - Customer records
- `quotations` - Quote records
- `quotation_items` - Line items for each quote
- `templates` - PDF template configurations

### 2. Initial Configuration

Before creating your first quotation, set up your company information:

1. Navigate to **Company** in the sidebar
2. Fill in your business details:
   - Company name (required)
   - Contact information (email, phone)
   - Address details
   - Tax ID
   - Default tax rate
   - Default currency
   - Quote number prefix (e.g., "QT-")
   - Default terms and conditions
3. Click **Save Settings**

### 3. Add Customers

1. Navigate to **Customers** in the sidebar
2. Click **Add Customer**
3. Enter customer details:
   - Name (required)
   - Contact information
   - Address
   - Notes
4. Click **Create Customer**

### 4. Create Your First Quotation

1. Navigate to **Quotations** in the sidebar
2. Click **New Quotation**
3. Fill in the form:
   - Select your company and client
   - Set issue date and validity period
   - Add line items (description, quantity, unit price)
   - Configure tax rate and discounts
   - Add terms and conditions
   - Add internal notes (optional)
4. Click **Save Quotation**

### 5. Generate PDF

From any quotation:
1. Click **Preview PDF** to download the PDF document
2. Or view the quotation and click **Download PDF**

## Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Page headers
│   ├── Layout.tsx      # Main layout wrapper
│   └── Sidebar.tsx     # Navigation sidebar
├── hooks/              # Custom React hooks
│   ├── useClients.ts   # Client data management
│   ├── useCompanies.ts # Company data management
│   └── useQuotations.ts # Quotation CRUD operations
├── pages/              # Application pages
│   ├── Company.tsx     # Company settings
│   ├── Customers.tsx   # Client management
│   ├── Dashboard.tsx   # Quotations list
│   ├── Home.tsx        # Dashboard overview
│   ├── QuotationForm.tsx # Create/edit quotations
│   └── QuotationView.tsx # View quotation details
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── calculations.ts # Math and formatting
│   └── pdfGenerator.ts # PDF generation logic
└── lib/
    └── supabase.ts     # Supabase client configuration
```

## Key Features Explained

### Automatic Calculations

The system automatically calculates:
- **Line Item Totals**: quantity × unit price
- **Subtotal**: sum of all line items
- **Tax Amount**: subtotal × tax rate
- **Discount Amount**: based on percentage or fixed value
- **Grand Total**: subtotal + tax - discount

### Quote Numbering

Quotes are automatically numbered using your configured prefix (default: "QT-") followed by a sequential number (e.g., QT-0001, QT-0002).

### Status Management

Track quotations through these statuses:
- **Draft**: Work in progress, not sent to client
- **Sent**: Delivered to client, awaiting response
- **Accepted**: Client approved the quotation
- **Rejected**: Client declined the quotation
- **Expired**: Past the valid until date

### PDF Templates

Currently includes three professional templates:
1. **Modern Minimal** - Clean contemporary design
2. **Professional Classic** - Traditional business layout
3. **Elegant Invoice** - Sophisticated design

## Database Notes

### Row Level Security (RLS)

All tables have RLS enabled with public access policies. In a production environment, you should:
1. Implement authentication
2. Update RLS policies to restrict access based on user authentication
3. Add user_id columns to track ownership

### Extending the Schema

To add custom fields:
1. Create a new migration using the Supabase dashboard or CLI
2. Update TypeScript types in `src/types/index.ts`
3. Update relevant forms and displays

## Troubleshooting

### Quotations Not Loading
- Check browser console for errors
- Verify Supabase connection in `.env` file
- Ensure database tables were created successfully

### PDF Not Generating
- Verify company and client information is complete
- Check browser console for errors
- Ensure at least one line item exists

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run typecheck`

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Supabase** - Database and backend
- **jsPDF** - PDF generation
- **Lucide React** - Icons
- **Vite** - Build tool

## Next Steps

Consider adding:
- User authentication and multi-tenancy
- Email integration to send quotes directly
- Payment integration (Stripe, PayPal)
- Multiple company support
- Advanced reporting and analytics
- Quote templates with custom designs
- Recurring quotations
- Quote versioning and history
- Document attachments
- E-signature integration

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review the database logs in Supabase dashboard
3. Verify all required fields are filled in forms
4. Ensure your Supabase project is active and accessible

## License

This project is provided as-is for your use and modification.
