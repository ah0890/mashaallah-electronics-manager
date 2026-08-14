/**
 * End-to-end workflow tests for MashaAllah Electronics Manager
 * Tests core business processes: products, customers, sales, purchases, reports
 */

const test = require('node:test');
const assert = require('node:assert');
const { database } = require('../src/db/database');

test('End-to-End Workflow Suite', async (t) => {
  // Setup: Open database for all tests
  await database.open();

  await t.test('Product Management Workflow', async () => {
    // Create a test product with unique SKU
    const uniqueSku = `LP-${Date.now()}`;
    const saveResult = await database.saveProduct({
      name: 'Test Laptop',
      sku: uniqueSku,
      brand: 'TestBrand',
      model: 'X100',
      purchase_price: 50000,
      selling_price: 65000,
      current_stock: 10,
      minimum_stock: 2,
      status: 'active'
    });

    assert.ok(saveResult, 'Product should be saved');

    // List all products to verify
    const products = await database.listProducts();
    assert.ok(products.length > 0, 'Should have at least one product');
    const testProduct = products.find(p => p.sku === uniqueSku);
    assert.ok(testProduct, 'Test product should be in the list');
    assert.strictEqual(testProduct.name, 'Test Laptop', 'Product name should match');

    // Read back the product
    const fetched = await database.getProductById(testProduct.id);
    assert.ok(fetched, 'Product should be retrievable');
    assert.strictEqual(fetched.current_stock, 10, 'Stock should be correct');
  });

  await t.test('Customer Management Workflow', async () => {
    // Create a test customer with unique ID
    const uniqueCustId = `CUST-${Date.now()}`;
    const saveResult = await database.saveCustomer({
      name: 'Test Customer',
      customer_id: uniqueCustId,
      phone: '03001234567',
      email: 'test@example.com',
      address: 'Test Address',
      opening_balance: 0,
      current_balance: 0,
      credit_limit: 50000
    });

    assert.ok(saveResult, 'Customer should be saved');

    // List customers to verify
    const customers = await database.listCustomers();
    assert.ok(Array.isArray(customers), 'Should return array of customers');
    const testCustomer = customers.find(c => c.customer_id === uniqueCustId);
    assert.ok(testCustomer, 'Test customer should be in the list');
    assert.strictEqual(testCustomer.name, 'Test Customer', 'Customer name should match');
  });

  await t.test('Supplier Management Workflow', async () => {
    // Create a test supplier with unique ID
    const uniqueSupId = `SUP-${Date.now()}`;
    const saveResult = await database.saveSupplier({
      name: 'Test Supplier',
      supplier_id: uniqueSupId,
      contact_person: 'Ali',
      phone: '03001234567',
      email: 'supplier@example.com',
      address: 'Supplier Address',
      opening_balance: 0,
      current_balance: 0
    });

    assert.ok(saveResult, 'Supplier should be saved');

    // List suppliers to verify
    const suppliers = await database.listSuppliers();
    assert.ok(Array.isArray(suppliers), 'Should return array of suppliers');
    const testSupplier = suppliers.find(s => s.supplier_id === uniqueSupId);
    assert.ok(testSupplier, 'Test supplier should be in the list');
    assert.strictEqual(testSupplier.name, 'Test Supplier', 'Supplier name should match');
  });

  await t.test('Sales Workflow', async () => {
    // Get the latest product and customer for the sale
    const products = await database.listProducts();
    const product = products[products.length - 1];
    assert.ok(product, 'Product should exist for sale');

    // Get the latest customer
    const customers = await database.listCustomers();
    const customer = customers[customers.length - 1];
    assert.ok(customer, 'Customer should exist for sale');

    // Create a sale
    const salePayload = {
      customerId: customer?.id,
      paymentMethod: 'Cash',
      discount: 0,
      notes: 'Test sale',
      items: [
        {
          product_id: product.id,
          quantity: 2,
          unit_price: product.selling_price
        }
      ]
    };

    const sale = await database.createSale(salePayload);
    assert.ok(sale, 'Sale should be created');

    // List sales to verify
    const sales = await database.listSales();
    assert.ok(Array.isArray(sales), 'Should return array of sales');
    assert.ok(sales.length > 0, 'Should have at least one sale');
    assert.ok(sales[0].invoice_number, 'Sales should have invoice numbers');
  });

  await t.test('Purchase Workflow', async () => {
    // Get a product for the purchase
    const products = await database.listProducts();
    const product = products[0];
    assert.ok(product, 'Product should exist for purchase');

    // Get a supplier
    const suppliers = await database.listSuppliers();
    const supplier = suppliers[0];
    assert.ok(supplier, 'Supplier should exist for purchase');

    // Create a purchase
    const purchasePayload = {
      supplierId: supplier?.id,
      paymentMethod: 'Credit',
      discount: 0,
      notes: 'Test purchase',
      items: [
        {
          product_id: product.id,
          quantity: 5,
          unit_cost: product.purchase_price
        }
      ]
    };

    const purchase = await database.createPurchase(purchasePayload);
    assert.ok(purchase, 'Purchase should be created');

    // List purchases
    const purchases = await database.listPurchaseRecords();
    assert.ok(Array.isArray(purchases), 'Should return array of purchases');
  });

  await t.test('Expense Management Workflow', async () => {
    // Create an expense
    const expense = await database.saveExpense({
      category: 'Utilities',
      description: 'Electricity bill',
      amount: 5000,
      payment_method: 'Bank Transfer'
    });

    assert.ok(expense, 'Expense should be created');

    // List expenses
    const expenses = await database.listExpenses();
    assert.ok(Array.isArray(expenses), 'Should return array of expenses');
  });

  await t.test('Order Management Workflow', async () => {
    // Create an order
    const customers = await database.listCustomers();
    const customer = customers[0];

    const order = await database.saveOrder({
      order_number: `ORD-${Date.now()}`,
      customer_id: customer?.id,
      total: 100000,
      deposit: 50000,
      delivery_date: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      notes: 'Test order'
    });

    assert.ok(order, 'Order should be created');

    // List orders
    const orders = await database.listOrders();
    assert.ok(Array.isArray(orders), 'Should return array of orders');
  });

  await t.test('Dashboard Summary Workflow', async () => {
    // Get dashboard summary
    const summary = await database.getDashboardSummary();

    assert.ok(summary, 'Dashboard summary should exist');
    assert.ok(typeof summary.todaySales === 'number', 'Should have todaySales');
    assert.ok(typeof summary.totalProducts === 'number', 'Should have totalProducts');
  });

  await t.test('Report Generation Workflow', async () => {
    // Get full report summary
    const reportSummary = await database.getReportSummary();
    assert.ok(reportSummary, 'Report summary should exist');
    assert.ok(typeof reportSummary.totalSales === 'number', 'Should have totalSales');
    assert.ok(typeof reportSummary.totalPurchases === 'number', 'Should have totalPurchases');
    assert.ok(typeof reportSummary.totalExpenses === 'number', 'Should have totalExpenses');
    assert.ok(typeof reportSummary.totalProfit === 'number', 'Should have totalProfit');

    // Get product performance
    const productPerf = await database.getProductPerformance();
    assert.ok(Array.isArray(productPerf), 'Should return array of product performance');

    // Get customer analysis
    const customerAnalysis = await database.getCustomerAnalysis();
    assert.ok(Array.isArray(customerAnalysis), 'Should return array of customer analysis');

    // Get supplier analysis
    const supplierAnalysis = await database.getSupplierAnalysis();
    assert.ok(Array.isArray(supplierAnalysis), 'Should return array of supplier analysis');

    // Get report stats
    const stats = await database.getReportStats();
    assert.ok(stats, 'Should return report stats');
    assert.ok(typeof stats.avgSaleValue === 'number', 'Should have avgSaleValue');
  });

  await t.test('Date Range Filtering Workflow', async () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Get report with date range
    const filtered = await database.getReportSummary(today, tomorrow);
    assert.ok(filtered, 'Should return filtered report');
    assert.ok(typeof filtered.totalSales === 'number', 'Should have totalSales with filter');
  });

  await t.test('Inventory Movement Tracking', async () => {
    const products = await database.listProducts();
    const product = products[0];

    if (product) {
      const inventory = await database.listInventory();
      assert.ok(Array.isArray(inventory), 'Should return inventory list');
    }
  });

  await t.test('Settings Management', async () => {
    // Save settings
    const settings = await database.saveSettings({
      shop_name: 'Test Shop',
      phone: '0300-1234567',
      email: 'shop@example.com',
      currency: 'PKR',
      low_stock_threshold: 5,
      invoice_prefix: 'INV',
      address: 'Test Address',
      invoice_footer: 'Thank you for shopping'
    });

    assert.ok(settings, 'Settings should be saved');

    // Retrieve settings
    const retrieved = await database.getSettings();
    assert.strictEqual(retrieved.shop_name, 'Test Shop', 'Shop name should be saved');
  });

  // Cleanup
  await database.close();
});
