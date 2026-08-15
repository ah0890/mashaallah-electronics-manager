# MS Electronics Manager - Project Context

## Project Overview

**MS Electronics Manager** is an offline-first desktop application for managing a small electronics retail shop. It's built with **Electron** and **SQLite**, designed for Windows, and provides complete POS (Point of Sale), inventory, and reporting functionality without requiring cloud connectivity.

**Status**: 85%+ complete - Core features working, UI interactive, ready for testing and refinement

---

## Technology Stack

### Core Technologies
- **Electron 31.0.0** - Desktop application framework for Windows
- **SQLite3 5.1.7** - Local relational database (offline-first)
- **Node.js 22.22.2** - Runtime environment
- **Vanilla JavaScript** - Frontend UI logic (no frameworks)
- **HTML5 + CSS3** - User interface

### Development Tools
- **npm** - Package manager
- **Node.js built-in test runner** (`node --test`) - 20/20 tests passing, no external test framework
- **electron-builder 24.13.0** - Windows executable builder

### Project Structure
```
mashaallah-electronics-manager/
├── src/
│   ├── main.js              # Electron main process (30 IPC handlers)
│   ├── preload.js           # Secure bridge (renderer ↔ main, 29 whitelisted methods)
│   ├── db/
│   │   └── database.js      # SQLite initialization & CRUD operations
│   ├── services/
│   │   └── business.js      # Accounting logic & validations (7 exported functions)
│   └── renderer/
│       ├── app.js           # Frontend logic (21 event listeners)
│       ├── index.html       # UI layout (11 page sections, 5 modals)
│       └── styles.css       # Complete styling
├── tests/
│   ├── businessLogic.test.js  # 7 accounting tests
│   └── workflows.test.js      # 12 end-to-end workflow subtests
├── docs/
│   └── developer-guide.md   # Short internal dev guide
├── data/
│   └── mashaallah.db        # SQLite database file (auto-created)
├── dist/                    # electron-builder output (after `npm run build:win`)
├── package.json             # Dependencies & scripts
└── README.md                # User documentation
```

---

## Architecture

### Application Flow

```
User (Windows Desktop)
    ↓
Electron Window (main.js)
    ↓
Renderer Process (app.js ↔ index.html)
    ↓
IPC Bridge (preload.js)
    ↓
Main Process (main.js)
    ↓
SQLite Database (data/mashaallah.db)
```

### Key Components

#### 1. **src/main.js** - Electron Main Process
- Creates and manages the app window
- Handles 30 IPC methods for CRUD and reporting
- Manages file dialogs for backup/restore
- Secure communication with renderer process

#### 2. **src/preload.js** - Security Bridge
- Exposes `window.api` object to renderer
- Whitelist of 29 safe methods (no direct file access)
- Prevents malicious code from accessing system

#### 3. **src/renderer/app.js** - Frontend Logic
- Initializes on app load with DOM readiness detection
- Manages 11 page sections (Dashboard, Sales, Purchases, etc.)
- Handles 21 event listeners with null-checking for reliability
- 5 modal forms for adding/editing items (Product, Customer, Supplier, Expense, Order)
- Real-time form calculations (cart totals, discounts)
- Delegates form submission to modals

#### 4. **src/db/database.js** - Database Layer
- Initializes 16 tables on first run (2 of them, `payments` and `returns`/`audit_logs`, are schema-only — see Data Model)
- All CRUD operations (Create, Read, Update, Delete)
- 4 reporting functions with date filtering
- Backup/restore functionality
- Data validation before save

#### 5. **src/services/business.js** - Business Rules
- Currency rounding (PKR precision)
- Invoice total calculations with discounts
- Payment allocation logic
- Profit calculations
- Inventory tracking with audit logs
- Sales/Purchase validation

---

## Features

### Dashboard
- Today's sales, purchases, profit (real-time)
- Product counts and stock levels
- Customer receivables & supplier payables
- Recent sales table
- Key performance indicators (KPIs)

### Sales Module
- Product selection with stock validation
- Customer selection (optional for walk-in)
- Cart with quantity & price editing
- Discount application
- Invoice generation with auto-number
- Multiple payment methods
- Real-time subtotal/total calculation

### Purchases Module
- Supplier selection
- Product selection from inventory
- Cost tracking
- Invoice generation
- Payment method selection
- Inventory auto-update

### Product Management
- Add/Edit/Delete products
- Stock level tracking
- Multiple pricing (purchase, selling, wholesale)
- SKU, barcode, brand, model, warranty
- Minimum stock threshold alerts

### Customer Management
- Add/Edit/Delete customers
- Phone, email, address tracking
- Opening balance & credit limit
- Current balance tracking
- Customer-based reporting

### Supplier Management
- Add/Edit/Delete suppliers
- Contact person & payment tracking
- Opening balance & payables tracking
- Supplier performance reporting

### Inventory Management
- Stock level tracking
- Minimum stock thresholds
- Inventory movement history
- Low stock alerts
- Out-of-stock reporting

### Orders Module
- Create custom orders
- Delivery date tracking
- Order status (pending, delivered, cancelled)
- Order history

### Expenses Module
- Expense recording by category
- Payment method tracking
- Expense date recording
- Expense reporting

### Reports (4 tabs)
- **Summary**: Total sales, purchases, expenses, profit with date filtering
- **Product Performance**: Qty sold, revenue, average price per product
- **Customer Analysis**: Purchase count, total spent, current balance
- **Supplier Analysis**: Order count, total purchased, payables

### Settings
- Shop name, phone, email
- Currency & low-stock threshold
- Invoice prefix & footer
- Backup/Restore database to file

---

## Data Model (16 Tables)

### Core Transactions
- `sales` - Sales invoices
- `sale_items` - Individual sale line items
- `purchases` - Purchase orders
- `purchase_items` - Individual purchase line items
- `orders` - Custom orders
- `order_items` - Custom order line items

### Master Data
- `products` - Product catalog
- `categories` - Product categories (DB layer only — `listCategories`/`addCategory` exist in `database.js` but are not yet exposed via IPC/preload)
- `customers` - Customer records
- `suppliers` - Supplier records

### Supporting
- `expenses` - Expense records
- `inventory_movements` - Stock history with audit trail (drives computed stock levels)
- `settings` - Shop configuration
- `payments` - **Schema-only**: table is created but has no CRUD methods, IPC handlers, or UI wiring yet
- `returns` - **Schema-only**: same as above, no code paths reference it
- `audit_logs` - **Schema-only**: same as above, no code paths reference it

### Business Rules
- No delete operations (soft delete not implemented, use status field)
- Automatic timestamp on all records
- Stock automatically updated on sale/purchase
- Balances automatically calculated

---

## Current Status

### ✅ Completed Features
- Project architecture & scaffolding
- Database schema & initialization
- Business logic layer (7 core functions)
- Sales workflow (product → cart → invoice → payment)
- Purchase workflow (supplier → stock update)
- Product CRUD with 15+ fields
- Customer management with balances
- Supplier management with payables
- Inventory tracking with movement history
- Orders module (custom orders)
- Expenses tracking
- Reports with date filtering (4 analysis tabs)
- Settings module (shop config, invoice templates)
- Backup/Restore functionality
- Event system with defensive error handling
- Modal forms for all add/edit operations
- Test suite (20/20 passing)

### ⚠️ Known Issues
1. **Windows Build**: Requires Visual Studio Build Tools with C++ workload (optional, not needed for local testing)
2. **Electron Security Warning**: "Insecure Content-Security-Policy" - expected for packaged apps, safe for local use

### 🔄 Recent Changes (Session 2)
1. Fixed syntax errors in app.js (mixed `??` and `||` operators)
2. Replaced `window.prompt()` with modal forms (Electron doesn't support prompts)
3. Added 5 modal forms for add/edit operations
4. Added form submission handlers with proper data validation
5. Improved event listener attachment with null checks
6. Added DOM readiness detection in init()

---

## How to Run

### Development Mode
```powershell
npm start
```

### Run Tests
```powershell
npm test
```

All 20 tests should pass:
- 7 business logic tests (accounting, calculations, validation)
- 12 end-to-end workflow subtests (CRUD, workflows, reporting) under 1 parent suite

### Build Windows Executable (requires build tools)
```powershell
npm run build:win
```

---

## Critical Implementation Details

### Modal System
- 5 modals: Product, Customer, Supplier, Expense, Order
- Modal forms auto-submit on form submit event
- Click outside modal to close (escape key not yet implemented)
- Form reset on close for clean state next time

### Event Handling
- All button clicks use delegated event listeners
- Edit buttons use `.closest()` for safe DOM traversal
- Form listeners attached via `.addEventListener('submit', ...)`
- Error handling with try-catch in attachEvents()
- All element access checked for null before use

### Database Transactions
- No explicit transactions (SQLite auto-commits)
- Validation happens in business.js before database calls
- Related updates (like inventory movement on sale) happen in sequence
- No rollback logic (production consideration)

### Data Validation
- Product: name required, stock ≥ 0
- Sale: product must have stock, quantity > 0
- Purchase: quantity & cost > 0
- Customer: name required, credit limit ≥ 0
- Expense: amount > 0

---

## Security Considerations

### ✅ Implemented
- IPC preload with whitelist of safe methods
- No `nodeIntegration` in renderer
- No `enableRemoteModule`
- File dialogs through Electron (not direct access)
- No inline scripts in HTML

### ⚠️ Not Implemented (Single-User Local App)
- User authentication
- Encryption at rest
- Audit logging (for regulatory compliance)
- Multi-user access control

---

## Testing

### Test Suite Location
- `tests/businessLogic.test.js` - Core accounting logic (7 tests)
- `tests/workflows.test.js` - End-to-end scenarios (12 subtests)

### Test Coverage
✓ Invoice calculations with discounts
✓ Payment allocation logic
✓ Profit calculations (sales - purchases - expenses)
✓ Currency rounding (PKR 2 decimals)
✓ Inventory movement tracking
✓ Sale/Purchase validation
✓ CRUD operations for all entities
✓ Dashboard generation
✓ Report generation with date filtering
✓ Settings management
✓ Backup/Restore operations

---

## Development Tips

### Adding a New Modal Form
1. Add HTML modal in `src/renderer/index.html` before `</main>`
2. Add CSS in `src/renderer/styles.css` (reuse `.modal-content` class)
3. Add form submit handler in `attachEvents()` in `app.js`
4. Add open function (e.g., `addCustomer()`) to call `openModal()`
5. Test with button click in sidebar

### Adding a New Table
1. Create schema in `database.js` `init()` method
2. Add CRUD methods (create, read, update, delete)
3. Expose via IPC handler in `main.js`
4. Add to preload.js `window.api` object
5. Call from renderer via `window.api.methodName()`

### Adding a New Report Tab
1. Create new HTML tab in reports section
2. Add `.report-tab` button with `data-tab` attribute
3. Add `.report-tab-content` div with `id="report-tab-{name}"`
4. Add reporting function in `database.js`
5. Call from `loadReportData()` in `app.js`

---

## Common Errors & Solutions

### "Uncaught (in promise) Error: prompt() is and will not be supported"
**Cause**: Electron 31.0.0 disabled `window.prompt()` for security
**Solution**: Use modal forms instead (implemented ✓)

### "Could not locate the bindings file" (SQLite3)
**Cause**: Native bindings not compiled for Electron version
**Solution**: `npm rebuild sqlite3` (or use better-sqlite3 alternative)

### Buttons not clickable
**Cause**: Event listeners fail silently if DOM element doesn't exist
**Solution**: Added null checks in helper functions (implemented ✓)

### Dashboard stats empty
**Cause**: Data not loading from database
**Solution**: Check console for IPC errors, verify database initialization

---

## Next Steps (Priority Order)

### 1. **User Acceptance Testing** (URGENT)
- [ ] Test Sales workflow end-to-end
- [ ] Test Purchase workflow end-to-end
- [ ] Verify all modals open/close correctly
- [ ] Test calculations (totals, discounts, profit)
- [ ] Verify data persists after app restart

### 2. **UI Polish** (HIGH)
- [ ] Add escape key to close modals
- [ ] Add loading indicators during long operations
- [ ] Add success/error toast notifications
- [ ] Improve table sorting/filtering
- [ ] Add search functionality to reports

### 3. **Features** (MEDIUM)
- [ ] Print functionality for invoices
- [ ] Email invoice to customer
- [ ] Batch import products from CSV
- [ ] Multi-user with roles (optional)
- [ ] Cloud backup (optional)

### 4. **Deployment** (OPTIONAL)
- [ ] Build Windows installer
- [ ] Create updater mechanism
- [ ] Setup auto-update via GitHub releases
- [ ] Create user documentation with screenshots

---

## Database Backup Strategy

**Backup Location**: User selects via file dialog
**Backup Format**: SQLite database file (`.db`)
**Restore**: Via file dialog, validates before overwriting

**Note**: No versioning or delta backups implemented. Each backup is a full copy.

---

## Performance Notes

- No pagination implemented (assumes < 10k records)
- All data loaded into memory on startup
- No lazy loading or virtual scrolling
- Database queries are synchronous (blocking)
- Consider async database operations if scale increases

---

## Environment Variables

Currently none configured. If needed in future:
- `DEBUG=true` - Enable verbose logging
- `APP_DATA_PATH` - Override database location
- `LOG_LEVEL` - Set logging verbosity

---

## File Locations

- **Database**: `data/mashaallah.db` (created automatically)
- **Backups**: User selects location
- **Config**: Stored in SQLite `settings` table
- **Logs**: Electron console (DevTools)
- **Developer docs**: `docs/developer-guide.md`

---

## Contact & Support

**Project**: MS Electronics Manager
**Type**: Offline-first Desktop App
**Platform**: Windows 10+ (via Electron)
**Last Updated**: August 15, 2026
**Status**: Beta (Ready for User Testing)

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│      Electron Main Process              │
│  ├─ Window Management                   │
│  ├─ 30 IPC Handlers                     │
│  └─ File System Access                  │
└────────────────┬──────────────────────────┘
                 │ IPC Bridge (preload.js)
                 │ (window.api whitelist)
┌────────────────┴──────────────────────────┐
│     Renderer Process (UI)                 │
│  ├─ app.js (event handlers)              │
│  ├─ index.html (11 sections)             │
│  ├─ 5 Modal Forms                        │
│  └─ Real-time Calculations               │
└────────────────┬──────────────────────────┘
                 │ Business Rules
                 │ (business.js)
┌────────────────┴──────────────────────────┐
│     Database Layer (database.js)          │
│  ├─ 16 Tables                            │
│  ├─ CRUD Operations                      │
│  ├─ 4 Reporting Functions                │
│  └─ Backup/Restore                       │
└────────────────┬──────────────────────────┘
                 │
┌────────────────┴──────────────────────────┐
│      SQLite Database (data/mashaallah.db) │
│  └─ Offline-first local storage          │
└─────────────────────────────────────────┘
```

---

## Quick Reference: IPC Methods

**Product**: `listProducts`, `saveProduct`, `deleteProduct` (no `getProduct` — list result is used for lookups)
**Customer**: `listCustomers`, `saveCustomer`, `deleteCustomer` (no `getCustomer`)
**Supplier**: `listSuppliers`, `saveSupplier`, `deleteSupplier` (no `getSupplier`)
**Sales**: `listSales`, `createSale`
**Purchases**: `listPurchases`, `createPurchase`
**Orders**: `listOrders`, `saveOrder`
**Expenses**: `listExpenses`, `saveExpense`
**Reports**: `getReportSummary`, `getProductPerformance`, `getCustomerAnalysis`, `getSupplierAnalysis`, `getReportStats`
**Dashboard**: `getDashboardSummary`
**Settings**: `getSettings`, `saveSettings`
**Backup**: `backupDatabase`, `restoreDatabase`, `chooseBackupPath`, `chooseRestorePath`
**Inventory**: `listInventory` (computed stock levels; there is no separate `getInventoryMovements` method exposed)

---

*Generated: August 15, 2026 - For development and maintenance reference*
