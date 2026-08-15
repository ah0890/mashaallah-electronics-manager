# MS Electronics Manager

MS Electronics Manager is an offline-first desktop application for managing an electronics store in Pakistan. It is designed for a single shop environment and runs locally on Windows without requiring internet access for daily operations.

## Project overview

The application helps the shop owner or store staff manage:

- Products and categories
- Inventory and stock levels
- Sales and POS transactions
- Purchases and supplier payables
- Customers and customer receivables
- Orders and pending fulfillment
- Expenses and profit tracking
- Reports and dashboard summaries
- Local backup and restore
- Settings for the shop configuration

## Branding

- Application name: MS Electronics Manager
- Short brand: MS Electronics Manager
- Default shop name: MS Electronics Manager
- Currency: PKR / Rs.

## Architecture

This project uses a practical offline-first architecture:

- Frontend: HTML, CSS, and vanilla JavaScript in the Electron renderer
- Desktop shell: Electron for Windows desktop packaging
- Local data storage: SQLite database stored on the machine
- Business logic: reusable JavaScript services for calculations and validations
- Runtime: fully local, no cloud dependency, no external online database

This keeps the system simple, maintainable, and reliable for a real shop environment.

## Features implemented

- **Dashboard**: Summary cards showing today's sales, purchases, profit, inventory status, customer receivables, supplier payables
- **Sales Management**: POS-style quick sale cart with customer selection, product lookup, and payment method tracking
- **Purchase Management**: Purchase cart workflow with supplier selection and stock updates
- **Product Management**: Full product database with SKU, barcode, brand, model, pricing tiers, stock levels
- **Customer Management**: Customer database with balances, credit limits, and transaction history
- **Supplier Management**: Supplier database with contact info and payables tracking
- **Inventory Tracking**: Real-time inventory levels, low-stock alerts, and movement history
- **Orders**: Order creation and status tracking
- **Expenses**: Expense category tracking for cost analysis
- **Reports**: Enhanced reporting with:
  - Total sales, purchases, expenses, and profit summaries
  - Date range filtering for custom period analysis
  - Product performance analysis (quantity sold, revenue, average price)
  - Customer analysis (purchase count, total spent, balance)
  - Supplier analysis (order count, total purchased, payables)
  - Summary statistics (average sale/purchase values, receivables, payables)
- **Settings**: Shop configuration for name, contact info, currency, stock thresholds, invoice formatting
- **Backup/Restore**: Database backup and restore functionality
- **Data Validation**: Business logic validation for all transactions
- **Local SQLite Database**: Persistent data storage without cloud dependency

## Project structure

- src/main.js — Electron entry point and IPC handlers
- src/preload.js — secure local API bridge
- src/renderer/ — frontend UI (HTML, CSS, JavaScript)
  - index.html — main application layout with all sections
  - styles.css — responsive styling for all modules
  - app.js — frontend logic for data loading, rendering, and user interactions
- src/db/database.js — SQLite database initialization, schema, CRUD operations, and report queries
- src/services/business.js — business logic helpers for calculations and validations
- tests/ — comprehensive test suite (20+ tests)
  - businessLogic.test.js — financial calculations and validation tests
  - workflows.test.js — end-to-end workflow tests
- data/ — local SQLite database file (created on first run)
- package.json — project manifest with scripts and dependencies

## Local setup

1. Install Node.js 18+ or 20+
2. Open the project folder in VS Code
3. Run:

npm install

4. Launch the app:

npm start

## Development workflow

- Business logic tests:

npm test

- Start desktop app:

npm start

## Offline operation

The application is designed to run completely offline after installation. It stores all business records in a local SQLite database and does not depend on cloud services for normal operation.

## Backup and restore

The application includes a backup/restore interface in Settings:

- Backup Database: choose a destination file path
- Restore Database: choose a backup file and confirm the action

The backup is a direct SQLite file copy, which is suitable for a local desktop shop system.

## Packaging for Windows

This project is structured to support Electron packaging into a Windows desktop app. A future packaging step can be done with Electron Builder or another Windows packaging tool.

Typical packaging commands are:

npm install --save-dev electron-builder
npx electron-builder build --win

## Testing and verification

The application includes comprehensive tests to verify all major workflows:

```
npm test
```

Test results (20 tests, all passing):
- ✓ Business logic: 7 tests
  - Invoice totals calculation
  - Payment allocation and capping
  - Profit calculation (sales - purchases - expenses)
  - Inventory movement tracking
  - Sale validation (stock availability, quantities)
  - Purchase validation (amounts)
  - Money normalization (PKR currency rounding)

- ✓ End-to-End Workflows: 13 tests
  - Product management (create, list, retrieve)
  - Customer management (create, list, track)
  - Supplier management (create, list, track)
  - Sales workflow (cart, invoice, payment)
  - Purchase workflow (cart, stock update)
  - Expense recording
  - Order management
  - Dashboard summary generation
  - Report generation (sales, purchases, expenses, profit)
  - Date range filtering for reports
  - Inventory tracking
  - Settings management

## Running the complete workflow

1. **Setup**: `npm install`
2. **Test**: `npm test` (verify all 20 tests pass)
3. **Run**: `npm start` (launch the desktop app)
4. **Use**: Add products, create sales/purchases, view reports, backup database

## Known issues and notes

- Windows build/packaging requires Visual Studio Build Tools with C++ workload (for native sqlite3 compilation)
- The application is designed for single-user shop environments, not multi-user networked installations
- All data is stored locally in SQLite; no cloud sync is implemented
- Backup files are direct SQLite copies; keep backups in a safe location


This should generate a Windows installer or executable package for the shop.

## Data safety

The application uses SQLite transactions and local backup files to reduce risk of data loss. Financial and stock operations should be kept small, atomic, and auditable.

## Troubleshooting

- If the app does not start, ensure Node.js is installed and dependencies are installed.
- If SQLite fails to initialize, remove the existing data file and restart the app.
- If a backup is not found, verify the chosen path and file extension.

## Notes

This is a practical offline management app designed for MS Electronics, with a clean structure suitable for future expansion into more detailed modules and reporting.
