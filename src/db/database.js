const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const { validateSale, validatePurchase } = require('../services/business');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbFile = path.join(dataDir, 'mashaallah.db');

class Database {
  constructor() {
    this.dbPath = dbFile;
    this.db = null;
  }

  ensureDirectory() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  open() {
    this.ensureDirectory();
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.init().then(resolve).catch(reject);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        this.db = null;
        resolve();
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database is not open.'));
        return;
      }

      this.db.run(sql, params, function onRun(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database is not open.'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database is not open.'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async init() {
    await this.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        shop_name TEXT NOT NULL DEFAULT 'MS Electronics Manager',
        address TEXT,
        phone TEXT,
        email TEXT,
        invoice_footer TEXT,
        currency TEXT DEFAULT 'PKR',
        tax_rate REAL DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        invoice_prefix TEXT DEFAULT 'INV',
        payment_methods TEXT DEFAULT 'Cash,Credit,Bank Transfer',
        theme TEXT DEFAULT 'light'
      );
    `);

    await this.run(`
      INSERT OR IGNORE INTO settings (id, shop_name, address, phone, email, invoice_footer, currency, tax_rate, low_stock_threshold, invoice_prefix, payment_methods, theme)
      VALUES (1, 'MS Electronics Manager', 'Main Market, Lahore', '+92 300 0000000', 'sales@mashaallahstore.com', 'Thank you for shopping with MS Electronics Manager.', 'PKR', 0, 5, 'INV', 'Cash,Credit,Bank Transfer', 'light');
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE,
        barcode TEXT,
        name TEXT NOT NULL,
        category_id INTEGER,
        brand TEXT,
        model TEXT,
        description TEXT,
        unit TEXT DEFAULT 'pcs',
        purchase_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        wholesale_price REAL DEFAULT 0,
        current_stock INTEGER DEFAULT 0,
        minimum_stock INTEGER DEFAULT 0,
        supplier_id INTEGER,
        warranty_period TEXT,
        serial_tracking INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT UNIQUE,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        email TEXT,
        notes TEXT,
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        credit_limit REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id TEXT UNIQUE,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        address TEXT,
        email TEXT,
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE,
        sale_date TEXT DEFAULT CURRENT_TIMESTAMP,
        customer_id INTEGER,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        remaining_amount REAL DEFAULT 0,
        payment_method TEXT,
        notes TEXT,
        status TEXT DEFAULT 'completed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        unit_price REAL,
        discount REAL DEFAULT 0,
        total REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER,
        invoice_number TEXT UNIQUE,
        purchase_date TEXT DEFAULT CURRENT_TIMESTAMP,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        remaining_amount REAL DEFAULT 0,
        payment_method TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        unit_cost REAL,
        total REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_type TEXT NOT NULL,
        reference_id INTEGER NOT NULL,
        customer_id INTEGER,
        supplier_id INTEGER,
        amount REAL NOT NULL,
        payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
        payment_method TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_date TEXT DEFAULT CURRENT_TIMESTAMP,
        category TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        payment_method TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        movement_type TEXT,
        quantity INTEGER,
        reason TEXT,
        reference_type TEXT,
        reference_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE,
        customer_id INTEGER,
        order_date TEXT DEFAULT CURRENT_TIMESTAMP,
        delivery_date TEXT,
        deposit REAL DEFAULT 0,
        remaining_amount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        unit_price REAL,
        total REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_type TEXT NOT NULL,
        reference_id INTEGER NOT NULL,
        product_id INTEGER,
        quantity INTEGER,
        reason TEXT,
        amount REAL DEFAULT 0,
        return_date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    await this.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        entity TEXT,
        entity_id INTEGER,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone);
      CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_purchases_invoice ON purchases(invoice_number);
    `);
  }

  async getSettings() {
    return this.get('SELECT * FROM settings WHERE id = 1');
  }

  async saveSettings(settings) {
    const { shop_name, address, phone, email, invoice_footer, currency, tax_rate, low_stock_threshold, invoice_prefix, payment_methods, theme } = settings;
    return this.run(
      `UPDATE settings SET shop_name = ?, address = ?, phone = ?, email = ?, invoice_footer = ?, currency = ?, tax_rate = ?, low_stock_threshold = ?, invoice_prefix = ?, payment_methods = ?, theme = ? WHERE id = 1`,
      [shop_name, address, phone, email, invoice_footer, currency, Number(tax_rate || 0), Number(low_stock_threshold || 0), invoice_prefix, payment_methods, theme]
    );
  }

  async listCategories() {
    return this.all('SELECT * FROM categories ORDER BY name');
  }

  async saveCategory(name, description = '') {
    return this.run('INSERT INTO categories(name, description) VALUES (?, ?)', [name, description]);
  }

  async listProducts() {
    return this.all(`
      SELECT p.*, c.name AS category_name, s.name AS supplier_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN suppliers s ON s.id = p.supplier_id
      ORDER BY p.updated_at DESC
    `);
  }

  async getProductById(id) {
    return this.get('SELECT * FROM products WHERE id = ?', [id]);
  }

  async saveProduct(product) {
    const now = new Date().toISOString();
    const existing = product.id ? await this.getProductById(product.id) : null;

    if (existing) {
      return this.run(
        `UPDATE products SET sku=?, barcode=?, name=?, category_id=?, brand=?, model=?, description=?, unit=?, purchase_price=?, selling_price=?, wholesale_price=?, current_stock=?, minimum_stock=?, supplier_id=?, warranty_period=?, serial_tracking=?, status=?, updated_at=? WHERE id=?`,
        [
          product.sku || '',
          product.barcode || '',
          product.name,
          product.category_id || null,
          product.brand || '',
          product.model || '',
          product.description || '',
          product.unit || 'pcs',
          Number(product.purchase_price || 0),
          Number(product.selling_price || 0),
          Number(product.wholesale_price || 0),
          Number(product.current_stock || 0),
          Number(product.minimum_stock || 0),
          product.supplier_id || null,
          product.warranty_period || '',
          product.serial_tracking ? 1 : 0,
          product.status || 'active',
          now,
          product.id
        ]
      );
    }

    return this.run(
      `INSERT INTO products (sku, barcode, name, category_id, brand, model, description, unit, purchase_price, selling_price, wholesale_price, current_stock, minimum_stock, supplier_id, warranty_period, serial_tracking, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.sku || '',
        product.barcode || '',
        product.name,
        product.category_id || null,
        product.brand || '',
        product.model || '',
        product.description || '',
        product.unit || 'pcs',
        Number(product.purchase_price || 0),
        Number(product.selling_price || 0),
        Number(product.wholesale_price || 0),
        Number(product.current_stock || 0),
        Number(product.minimum_stock || 0),
        product.supplier_id || null,
        product.warranty_period || '',
        product.serial_tracking ? 1 : 0,
        product.status || 'active',
        now,
        now
      ]
    );
  }

  async deleteProduct(id) {
    return this.run('DELETE FROM products WHERE id = ?', [id]);
  }

  async listCustomers() {
    return this.all('SELECT * FROM customers ORDER BY created_at DESC');
  }

  async saveCustomer(customer) {
    const now = new Date().toISOString();
    if (customer.id) {
      return this.run(
        `UPDATE customers SET customer_id=?, name=?, phone=?, address=?, email=?, notes=?, opening_balance=?, current_balance=?, credit_limit=? WHERE id=?`,
        [customer.customer_id || '', customer.name, customer.phone || '', customer.address || '', customer.email || '', customer.notes || '', Number(customer.opening_balance || 0), Number(customer.current_balance || 0), Number(customer.credit_limit || 0), customer.id]
      );
    }

    return this.run(
      `INSERT INTO customers (customer_id, name, phone, address, email, notes, opening_balance, current_balance, credit_limit, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer.customer_id || '', customer.name, customer.phone || '', customer.address || '', customer.email || '', customer.notes || '', Number(customer.opening_balance || 0), Number(customer.current_balance || 0), Number(customer.credit_limit || 0), now]
    );
  }

  async deleteCustomer(id) {
    return this.run('DELETE FROM customers WHERE id = ?', [id]);
  }

  async listSuppliers() {
    return this.all('SELECT * FROM suppliers ORDER BY created_at DESC');
  }

  async saveSupplier(supplier) {
    const now = new Date().toISOString();
    if (supplier.id) {
      return this.run(
        `UPDATE suppliers SET supplier_id=?, name=?, contact_person=?, phone=?, address=?, email=?, opening_balance=?, current_balance=?, notes=? WHERE id=?`,
        [supplier.supplier_id || '', supplier.name, supplier.contact_person || '', supplier.phone || '', supplier.address || '', supplier.email || '', Number(supplier.opening_balance || 0), Number(supplier.current_balance || 0), supplier.notes || '', supplier.id]
      );
    }

    return this.run(
      `INSERT INTO suppliers (supplier_id, name, contact_person, phone, address, email, opening_balance, current_balance, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier.supplier_id || '', supplier.name, supplier.contact_person || '', supplier.phone || '', supplier.address || '', supplier.email || '', Number(supplier.opening_balance || 0), Number(supplier.current_balance || 0), supplier.notes || '', now]
    );
  }

  async deleteSupplier(id) {
    return this.run('DELETE FROM suppliers WHERE id = ?', [id]);
  }

  async saveExpense(expense) {
    return this.run(
      `INSERT INTO expenses (expense_date, category, description, amount, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [expense.expense_date || new Date().toISOString(), expense.category, expense.description || '', Number(expense.amount || 0), expense.payment_method || 'Cash', expense.notes || '']
    );
  }

  async listExpenses() {
    return this.all('SELECT * FROM expenses ORDER BY expense_date DESC');
  }

  async listInventory() {
    return this.all(`
      SELECT p.*, c.name AS category_name,
             (SELECT COALESCE(SUM(m.quantity), 0) FROM inventory_movements m WHERE m.product_id = p.id AND m.movement_type IN ('stock_in','return_in','stock_adjustment')) -
             (SELECT COALESCE(SUM(m.quantity), 0) FROM inventory_movements m WHERE m.product_id = p.id AND m.movement_type IN ('stock_out','return_out')) AS computed_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.name
    `);
  }

  async listSales() {
    return this.all(`
      SELECT s.*, c.name AS customer_name
      FROM sales s
      LEFT JOIN customers c ON c.id = s.customer_id
      ORDER BY s.sale_date DESC
    `);
  }

  async listPurchaseRecords() {
    return this.all(`
      SELECT p.*, s.name AS supplier_name
      FROM purchases p
      LEFT JOIN suppliers s ON s.id = p.supplier_id
      ORDER BY p.purchase_date DESC
    `);
  }

  async listOrders() {
    return this.all(`
      SELECT o.*, c.name AS customer_name
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.order_date DESC
    `);
  }

  async saveOrder(order) {
    const orderDate = order.order_date || new Date().toISOString();
    const total = Number(order.total || 0);
    const deposit = Number(order.deposit || 0);
    const remaining = total - deposit;

    const result = await this.run(
      `INSERT INTO orders (order_number, customer_id, order_date, delivery_date, deposit, remaining_amount, total, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.order_number || 'ORD-' + Date.now(), order.customer_id || null, orderDate, order.delivery_date || null, deposit, remaining, total, order.status || 'pending', order.notes || '']
    );

    return result;
  }

  async getDashboardSummary() {
    const settings = await this.getSettings();
    const today = new Date().toISOString().slice(0, 10);

    const salesToday = await this.get(`SELECT COALESCE(SUM(total),0) AS total FROM sales WHERE date(sale_date) = date(?)`, [today]);
    const purchasesToday = await this.get(`SELECT COALESCE(SUM(total),0) AS total FROM purchases WHERE date(purchase_date) = date(?)`, [today]);
    const expensesToday = await this.get(`SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE date(expense_date) = date(?)`, [today]);
    const totalProducts = await this.get('SELECT COUNT(*) AS total FROM products');
    const lowStock = await this.get('SELECT COUNT(*) AS total FROM products WHERE current_stock <= minimum_stock');
    const outOfStock = await this.get('SELECT COUNT(*) AS total FROM products WHERE current_stock <= 0');
    const totalCustomers = await this.get('SELECT COUNT(*) AS total FROM customers');
    const receivables = await this.get('SELECT COALESCE(SUM(current_balance),0) AS total FROM customers');
    const payables = await this.get('SELECT COALESCE(SUM(current_balance),0) AS total FROM suppliers');
    const pendingOrders = await this.get('SELECT COUNT(*) AS total FROM orders WHERE status != "completed" AND status != "cancelled"');

    const salesRevenue = Number(salesToday?.total || 0);
    const costOfGoods = Number(purchasesToday?.total || 0);
    const grossProfit = salesRevenue - costOfGoods;

    return {
      shopName: settings?.shop_name || 'MS Electronics Manager',
      todaySales: salesRevenue,
      todayPurchases: Number(purchasesToday?.total || 0),
      todayProfit: grossProfit - Number(expensesToday?.total || 0),
      totalProducts: Number(totalProducts?.total || 0),
      lowStockProducts: Number(lowStock?.total || 0),
      outOfStockProducts: Number(outOfStock?.total || 0),
      totalCustomers: Number(totalCustomers?.total || 0),
      customerReceivables: Number(receivables?.total || 0),
      supplierPayables: Number(payables?.total || 0),
      pendingOrders: Number(pendingOrders?.total || 0),
      todayExpenses: Number(expensesToday?.total || 0),
      recentSales: await this.all('SELECT * FROM sales ORDER BY sale_date DESC LIMIT 5')
    };
  }

  async getReportSummary(fromDate = null, toDate = null) {
    let salesWhere = '';
    let purchaseWhere = '';
    let expenseWhere = '';
    const params = [];

    if (fromDate) {
      salesWhere = ' WHERE sale_date >= ?';
      purchaseWhere = ' WHERE purchase_date >= ?';
      expenseWhere = ' WHERE expense_date >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      salesWhere += (salesWhere ? ' AND' : ' WHERE') + ' sale_date <= ?';
      purchaseWhere += (purchaseWhere ? ' AND' : ' WHERE') + ' purchase_date <= ?';
      expenseWhere += (expenseWhere ? ' AND' : ' WHERE') + ' expense_date <= ?';
      params.push(toDate);
    }

    const totalSales = await this.get(`SELECT COALESCE(SUM(total), 0) AS total FROM sales${salesWhere}`, params);
    const totalPurchases = await this.get(`SELECT COALESCE(SUM(total), 0) AS total FROM purchases${purchaseWhere}`, params);
    const totalExpenses = await this.get(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses${expenseWhere}`, params);
    const totalProfit = Number(totalSales?.total || 0) - Number(totalPurchases?.total || 0) - Number(totalExpenses?.total || 0);

    return {
      totalSales: Number(totalSales?.total || 0),
      totalPurchases: Number(totalPurchases?.total || 0),
      totalExpenses: Number(totalExpenses?.total || 0),
      totalProfit
    };
  }

  async getProductPerformance(fromDate = null, toDate = null) {
    let whereClause = '';
    const params = [];

    if (fromDate) {
      whereClause = ' WHERE sale_date >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      whereClause += (whereClause ? ' AND' : ' WHERE') + ' sale_date <= ?';
      params.push(toDate);
    }

    const query = `
      SELECT p.id, p.name, SUM(si.quantity) AS qty_sold, SUM(si.quantity * si.unit_price) AS revenue,
             AVG(si.unit_price) AS avg_price
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id${whereClause}
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
    `;

    return this.all(query, params);
  }

  async getCustomerAnalysis(fromDate = null, toDate = null) {
    let whereClause = '';
    const params = [];

    if (fromDate) {
      whereClause = ' WHERE s.sale_date >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      whereClause += (whereClause ? ' AND' : ' WHERE') + ' s.sale_date <= ?';
      params.push(toDate);
    }

    const query = `
      SELECT c.id, c.name, COUNT(s.id) AS purchases, COALESCE(SUM(s.total), 0) AS total_spent, c.current_balance
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id${whereClause}
      GROUP BY c.id, c.name, c.current_balance
      ORDER BY total_spent DESC
    `;

    return this.all(query, params);
  }

  async getSupplierAnalysis(fromDate = null, toDate = null) {
    let whereClause = '';
    const params = [];

    if (fromDate) {
      whereClause = ' WHERE p.purchase_date >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      whereClause += (whereClause ? ' AND' : ' WHERE') + ' p.purchase_date <= ?';
      params.push(toDate);
    }

    const query = `
      SELECT s.id, s.name, COUNT(p.id) AS orders, COALESCE(SUM(p.total), 0) AS total_purchased, s.current_balance
      FROM suppliers s
      LEFT JOIN purchases p ON s.id = p.supplier_id${whereClause}
      GROUP BY s.id, s.name, s.current_balance
      ORDER BY total_purchased DESC
    `;

    return this.all(query, params);
  }

  async getReportStats(fromDate = null, toDate = null) {
    const summary = await this.getReportSummary(fromDate, toDate);
    const totalTrans = await this.get(
      `SELECT COUNT(*) AS count FROM (SELECT id FROM sales ${fromDate ? 'WHERE sale_date >= ?' : ''} ${toDate ? (fromDate ? 'AND' : 'WHERE') + ' sale_date <= ?' : ''}) UNION SELECT COUNT(*) FROM (SELECT id FROM purchases ${fromDate ? 'WHERE purchase_date >= ?' : ''} ${toDate ? (fromDate ? 'AND' : 'WHERE') + ' purchase_date <= ?' : ''})`,
      fromDate && toDate ? [fromDate, toDate, fromDate, toDate] : (fromDate ? [fromDate, fromDate] : (toDate ? [toDate, toDate] : []))
    );

    const avgSale = summary.totalSales > 0 ? summary.totalSales / (await this.get('SELECT COUNT(*) AS count FROM sales')).count : 0;
    const avgPurchase = summary.totalPurchases > 0 ? summary.totalPurchases / (await this.get('SELECT COUNT(*) AS count FROM purchases')).count : 0;

    return {
      ...summary,
      totalTransactions: totalTrans?.count || 0,
      avgSaleValue: avgSale,
      avgPurchaseValue: avgPurchase
    };
  }

  async createSale({ customerId, items, paymentMethod, discount = 0, notes = '' }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Sale must contain at least one item.');
    }

    for (const item of items) {
      const product = await this.getProductById(item.product_id);
      if (!product) {
        throw new Error('Product not found.');
      }
      validateSale({
        quantity: item.quantity,
        availableStock: product.current_stock,
        price: item.unit_price
      });
    }

    const customer = customerId ? await this.get('SELECT * FROM customers WHERE id = ?', [customerId]) : null;
    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0);
    const total = Math.max(0, subtotal - Number(discount || 0));
    const invoiceNumber = `INV-${Date.now()}`;

    const saleResult = await this.run(
      `INSERT INTO sales (invoice_number, sale_date, customer_id, subtotal, discount, total, paid_amount, remaining_amount, payment_method, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [invoiceNumber, new Date().toISOString(), customerId || null, subtotal, Number(discount || 0), total, total, 0, paymentMethod || 'Cash', notes || '']
    );

    const saleId = saleResult.id;

    for (const item of items) {
      const product = await this.getProductById(item.product_id);
      if (!product) continue;

      const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
      await this.run(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [saleId, item.product_id, Number(item.quantity || 0), Number(item.unit_price || 0), Number(item.discount || 0), lineTotal]
      );

      const newStock = Number(product.current_stock || 0) - Number(item.quantity || 0);
      await this.run(`UPDATE products SET current_stock = ?, updated_at = ? WHERE id = ?`, [newStock, new Date().toISOString(), item.product_id]);
      await this.run(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, reason, reference_type, reference_id)
         VALUES (?, 'stock_out', ?, 'sale', 'sale', ?)`,
        [item.product_id, Number(item.quantity || 0), saleId]
      );
    }

    if (customer) {
      const newBalance = Number(customer.current_balance || 0) + total;
      await this.run('UPDATE customers SET current_balance = ? WHERE id = ?', [newBalance, customerId]);
    }

    return { saleId, invoiceNumber, total };
  }

  async createPurchase({ supplierId, items, paymentMethod, discount = 0, notes = '' }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Purchase must contain at least one item.');
    }

    for (const item of items) {
      validatePurchase({ quantity: item.quantity, unitCost: item.unit_cost });
    }

    const supplier = supplierId ? await this.get('SELECT * FROM suppliers WHERE id = ?', [supplierId]) : null;
    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0);
    const total = Math.max(0, subtotal - Number(discount || 0));
    const invoiceNumber = `PUR-${Date.now()}`;

    const purchaseResult = await this.run(
      `INSERT INTO purchases (supplier_id, invoice_number, purchase_date, subtotal, discount, total, paid_amount, remaining_amount, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplierId || null, invoiceNumber, new Date().toISOString(), subtotal, Number(discount || 0), total, total, 0, paymentMethod || 'Cash', notes || '']
    );

    const purchaseId = purchaseResult.id;

    for (const item of items) {
      const product = await this.getProductById(item.product_id);
      const lineTotal = Number(item.quantity || 0) * Number(item.unit_cost || 0);
      await this.run(
        `INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total)
         VALUES (?, ?, ?, ?, ?)`,
        [purchaseId, item.product_id, Number(item.quantity || 0), Number(item.unit_cost || 0), lineTotal]
      );

      if (!product) {
        continue;
      }

      const newStock = Number(product.current_stock || 0) + Number(item.quantity || 0);
      await this.run(`UPDATE products SET current_stock = ?, updated_at = ? WHERE id = ?`, [newStock, new Date().toISOString(), item.product_id]);
      await this.run(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, reason, reference_type, reference_id)
         VALUES (?, 'stock_in', ?, 'purchase', 'purchase', ?)`,
        [item.product_id, Number(item.quantity || 0), purchaseId]
      );
    }

    if (supplier) {
      const newBalance = Number(supplier.current_balance || 0) + total;
      await this.run('UPDATE suppliers SET current_balance = ? WHERE id = ?', [newBalance, supplierId]);
    }

    return { purchaseId, invoiceNumber, total };
  }

  async backupDatabase(filePath) {
    this.ensureDirectory();
    fs.copyFileSync(this.dbPath, filePath);
    return true;
  }

  async restoreDatabase(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error('Backup file not found.');
    }

    await this.close();
    fs.copyFileSync(filePath, this.dbPath);
    await this.open();
    return true;
  }
}

const database = new Database();

module.exports = { database };
