# Financial Transactions & Billing Feature

## Overview

A comprehensive financial management system for tracking payments, generating receipts, and monitoring revenue for cemetery services.

## Features Implemented

### 1. Payment Management Context (`contexts/FinanceContext.tsx`)

- State management for all payment transactions
- localStorage persistence for data
- Helper functions for financial calculations
- Sample data included for demonstration

### 2. Payment Form (`components/PaymentForm.tsx`)

- Create new payment entries
- Fields: Customer name, amount, date, due date, plot/grave info, service type, status, description
- Validation for required fields
- Integration with plots and graves data

### 3. Receipt Generation (`components/PaymentReceipt.tsx`)

- Professional receipt display
- Print functionality
- Download as HTML file
- Formatted with customer info, payment details, and branding

### 4. Edit Payment Form (`components/EditPaymentForm.tsx`)

- Update existing payment records
- Pre-filled with current payment data
- Full field editing capability

### 5. Finance Dashboard (`app/finance/page.tsx`)

- Financial overview with key metrics:
  - Total Revenue
  - Paid Amount
  - Pending Amount
  - Overdue Amount
- Payment alerts:
  - Overdue payment warnings
  - Pending payment notices
- Payment history table with:
  - Search functionality
  - Filter by status (paid/pending/overdue)
  - Filter by service type
  - Edit and delete actions
  - View receipt option
- Role-based access control

### 6. Dashboard Integration (`app/page.tsx`)

- Added Total Revenue card
- Added Pending Payments card
- Total Transactions in Quick Stats

### 7. Navigation Updates

- Added Finance link to sidebar with DollarSign icon

## Payment Status Types

- **Paid**: Payment completed
- **Pending**: Payment awaiting completion
- **Overdue**: Payment past due date

## Service Types

- Grave Booking
- Burial Service
- Maintenance
- Other

## Data Persistence

All payment data is stored in localStorage under the key `graveyard_payments`.

## Access Control

- **Visitors**: Can view payments and generate receipts
- **Staff**: Can create, edit, and delete payments
- **Admin**: Full access to all features

## Sample Data

The system includes 3 sample payment records demonstrating different statuses and service types.

## Usage

### Creating a Payment

1. Navigate to Finance page
2. Click "New Payment" button
3. Fill in customer details, amount, and service information
4. Submit to create payment
5. Automatically shows receipt after creation

### Viewing Receipt

1. Click receipt icon on any payment row
2. View formatted receipt
3. Print or download as needed

### Editing Payment

1. Click edit icon on payment row
2. Update desired fields
3. Save changes

### Filtering Payments

- Use search bar for customer name or receipt number
- Select status filter (All/Paid/Pending/Overdue)
- Select service type filter

## Technical Details

- Built with React Context API for state management
- localStorage for client-side persistence
- Responsive design for all screen sizes
- Type-safe with TypeScript
- Integrated with existing graveyard management features
