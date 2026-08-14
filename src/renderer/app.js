const state = {
  dashboard: null,
  reportSummary: null,
  products: [],
  customers: [],
  suppliers: [],
  sales: [],
  purchases: [],
  expenses: [],
  inventory: [],
  orders: [],
  settings: null,
  saleCart: [],
  purchaseCart: []
};

const elements = {
  pageTitle: document.getElementById('page-title'),
  shopName: document.getElementById('shop-name'),
  dashboardStats: document.getElementById('dashboard-stats'),
  recentSalesTable: document.getElementById('recent-sales-table'),
  saleCustomer: document.getElementById('sale-customer'),
  salePaymentMethod: document.getElementById('sale-payment-method'),
  saleProduct: document.getElementById('sale-product'),
  saleQty: document.getElementById('sale-qty'),
  salePrice: document.getElementById('sale-price'),
  saleCart: document.getElementById('sale-cart'),
  saleSubtotal: document.getElementById('sale-subtotal'),
  saleDiscount: document.getElementById('sale-discount'),
  saleTotal: document.getElementById('sale-total'),
  purchaseSupplier: document.getElementById('purchase-supplier'),
  purchasePaymentMethod: document.getElementById('purchase-payment-method'),
  purchaseProduct: document.getElementById('purchase-product'),
  purchaseQty: document.getElementById('purchase-qty'),
  purchaseUnitCost: document.getElementById('purchase-unit-cost'),
  purchaseCart: document.getElementById('purchase-cart'),
  purchaseSubtotal: document.getElementById('purchase-subtotal'),
  purchaseDiscount: document.getElementById('purchase-discount'),
  purchaseTotal: document.getElementById('purchase-total'),
  productsTable: document.getElementById('products-table'),
  productSearch: document.getElementById('product-search'),
  inventoryTable: document.getElementById('inventory-table'),
  customerSearch: document.getElementById('customer-search'),
  customersTable: document.getElementById('customers-table'),
  supplierSearch: document.getElementById('supplier-search'),
  suppliersTable: document.getElementById('suppliers-table'),
  ordersTable: document.getElementById('orders-table'),
  expensesTable: document.getElementById('expenses-table'),
  settingShopName: document.getElementById('setting-shop-name'),
  settingPhone: document.getElementById('setting-phone'),
  settingEmail: document.getElementById('setting-email'),
  settingCurrency: document.getElementById('setting-currency'),
  settingLowStock: document.getElementById('setting-low-stock'),
  settingInvoicePrefix: document.getElementById('setting-invoice-prefix'),
  settingAddress: document.getElementById('setting-address'),
  settingInvoiceFooter: document.getElementById('setting-invoice-footer')
};

function toMoney(value) {
  return Number(value || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 2 });
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB');
}

function setPage(section) {
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === section);
  });

  document.querySelectorAll('.page-section').forEach((sectionEl) => {
    sectionEl.classList.toggle('active', sectionEl.id === section);
  });

  const titleMap = {
    dashboard: 'Dashboard',
    sales: 'Sales',
    purchases: 'Purchases',
    products: 'Products',
    inventory: 'Inventory',
    customers: 'Customers',
    suppliers: 'Suppliers',
    orders: 'Orders',
    expenses: 'Expenses',
    reports: 'Reports',
    settings: 'Settings'
  };

  elements.pageTitle.textContent = titleMap[section] || 'Dashboard';
}

function renderDashboard() {
  const summary = state.dashboard || {};
  const cards = [
    { label: "Today's Sales", value: toMoney(summary.todaySales) },
    { label: "Today's Purchases", value: toMoney(summary.todayPurchases) },
    { label: "Today's Profit", value: toMoney(summary.todayProfit) },
    { label: 'Total Products', value: summary.totalProducts || 0 },
    { label: 'Low Stock Products', value: summary.lowStockProducts || 0 },
    { label: 'Out of Stock Products', value: summary.outOfStockProducts || 0 },
    { label: 'Total Customers', value: summary.totalCustomers || 0 },
    { label: 'Customer Receivables', value: toMoney(summary.customerReceivables) },
    { label: 'Supplier Payables', value: toMoney(summary.supplierPayables) },
    { label: 'Pending Orders', value: summary.pendingOrders || 0 },
    { label: "Today's Expenses", value: toMoney(summary.todayExpenses) }
  ];

  elements.dashboardStats.innerHTML = cards.map((card) => `
    <div class="stat-card">
      <span>${card.label}</span>
      <strong>${card.value}</strong>
    </div>
  `).join('');

  const recentSales = (summary.recentSales || []).slice(0, 5);
  elements.recentSalesTable.innerHTML = recentSales.map((sale) => `
    <tr>
      <td>${sale.invoice_number || '-'}</td>
      <td>${formatDate(sale.sale_date)}</td>
      <td>${toMoney(sale.total)}</td>
      <td>${sale.status || 'completed'}</td>
    </tr>
  `).join('');

  const reportSummary = state.reportSummary || {
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalProfit: 0
  };

  document.getElementById('report-total-sales').textContent = toMoney(reportSummary.totalSales || 0);
  document.getElementById('report-total-purchases').textContent = toMoney(reportSummary.totalPurchases || 0);
  document.getElementById('report-total-expenses').textContent = toMoney(reportSummary.totalExpenses || 0);
  document.getElementById('report-total-profit').textContent = toMoney(reportSummary.totalProfit || 0);
}

function renderSaleCustomerOptions() {
  elements.saleCustomer.innerHTML = '<option value="">Walk-in customer</option>' + state.customers.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderSaleProducts() {
  elements.saleProduct.innerHTML = state.products.map((product) => `<option value="${product.id}">${product.name} (${product.current_stock} in stock)</option>`).join('');
  const firstProduct = state.products[0];
  if (firstProduct) {
    elements.salePrice.value = firstProduct.selling_price || 0;
  }
  elements.saleProduct.onchange = () => {
    const product = state.products.find((item) => item.id === Number(elements.saleProduct.value));
    if (product) {
      elements.salePrice.value = product.selling_price || 0;
    }
  };
}

function renderPurchaseSupplierOptions() {
  elements.purchaseSupplier.innerHTML = state.suppliers.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
}

function renderPurchaseProducts() {
  elements.purchaseProduct.innerHTML = state.products.map((product) => `<option value="${product.id}">${product.name}</option>`).join('');
  const firstProduct = state.products[0];
  if (firstProduct) {
    elements.purchaseUnitCost.value = firstProduct.purchase_price || 0;
  }
  elements.purchaseProduct.onchange = () => {
    const product = state.products.find((item) => item.id === Number(elements.purchaseProduct.value));
    if (product) {
      elements.purchaseUnitCost.value = product.purchase_price || 0;
    }
  };
}

function updateSaleCartTotals() {
  const subtotal = state.saleCart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = Number(elements.saleDiscount.value || 0);
  const total = subtotal - discount;
  elements.saleSubtotal.textContent = toMoney(subtotal);
  elements.saleTotal.textContent = toMoney(Math.max(0, total));
}

function renderSaleCart() {
  elements.saleCart.innerHTML = state.saleCart.map((item) => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>${toMoney(item.unitPrice)}</td>
      <td>${toMoney(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');
  updateSaleCartTotals();
}

function updatePurchaseCartTotals() {
  const subtotal = state.purchaseCart.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const discount = Number(elements.purchaseDiscount.value || 0);
  const total = subtotal - discount;
  elements.purchaseSubtotal.textContent = toMoney(subtotal);
  elements.purchaseTotal.textContent = toMoney(Math.max(0, total));
}

function renderPurchaseCart() {
  elements.purchaseCart.innerHTML = state.purchaseCart.map((item) => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>${toMoney(item.unitCost)}</td>
      <td>${toMoney(item.quantity * item.unitCost)}</td>
    </tr>
  `).join('');
  updatePurchaseCartTotals();
}

function renderProducts() {
  const term = (elements.productSearch?.value || '').trim().toLowerCase();
  const filtered = state.products.filter((product) => {
    if (!term) return true;
    return [product.name, product.sku, product.barcode, product.brand, product.model].some((value) => String(value || '').toLowerCase().includes(term));
  });

  elements.productsTable.innerHTML = filtered.map((product) => `
    <tr>
      <td>${product.sku || '-'}</td>
      <td>${product.name}</td>
      <td>${product.brand || '-'}</td>
      <td>${product.current_stock}</td>
      <td>${toMoney(product.selling_price)}</td>
      <td><button data-id="${product.id}" class="edit-product">Edit</button></td>
    </tr>
  `).join('');
}

function renderInventory() {
  elements.inventoryTable.innerHTML = state.inventory.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.current_stock}</td>
      <td>${item.minimum_stock}</td>
      <td>${item.category_name || '-'}</td>
      <td>${item.current_stock <= 0 ? 'Out of stock' : item.current_stock <= item.minimum_stock ? 'Low' : 'Healthy'}</td>
    </tr>
  `).join('');
}

function renderCustomers() {
  const term = (elements.customerSearch?.value || '').trim().toLowerCase();
  const filtered = state.customers.filter((customer) => {
    if (!term) return true;
    return [customer.name, customer.phone, customer.email].some((value) => String(value || '').toLowerCase().includes(term));
  });

  elements.customersTable.innerHTML = filtered.map((customer) => `
    <tr>
      <td>${customer.customer_id || customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.phone || '-'}</td>
      <td>${toMoney(customer.current_balance || 0)}</td>
      <td><button data-id="${customer.id}" class="edit-customer">Edit</button></td>
    </tr>
  `).join('');
}

function renderSuppliers() {
  const term = (elements.supplierSearch?.value || '').trim().toLowerCase();
  const filtered = state.suppliers.filter((supplier) => {
    if (!term) return true;
    return [supplier.name, supplier.phone, supplier.email, supplier.contact_person].some((value) => String(value || '').toLowerCase().includes(term));
  });

  elements.suppliersTable.innerHTML = filtered.map((supplier) => `
    <tr>
      <td>${supplier.supplier_id || supplier.id}</td>
      <td>${supplier.name}</td>
      <td>${supplier.phone || '-'}</td>
      <td>${toMoney(supplier.current_balance || 0)}</td>
      <td><button data-id="${supplier.id}" class="edit-supplier">Edit</button></td>
    </tr>
  `).join('');
}

function renderOrders() {
  elements.ordersTable.innerHTML = (state.orders || []).map((order) => `
    <tr>
      <td>${order.order_number || order.id}</td>
      <td>${order.customer_name || '-'}</td>
      <td>${toMoney(order.total)}</td>
      <td>${order.status}</td>
      <td>${formatDate(order.delivery_date)}</td>
    </tr>
  `).join('');
}

function renderExpenses() {
  elements.expensesTable.innerHTML = (state.expenses || []).map((expense) => `
    <tr>
      <td>${formatDate(expense.expense_date)}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>${toMoney(expense.amount)}</td>
    </tr>
  `).join('');
}

async function loadReportData() {
  const fromDate = document.getElementById('report-from-date')?.value || null;
  const toDate = document.getElementById('report-to-date')?.value || null;

  const [summary, stats, products, customers, suppliers] = await Promise.all([
    window.api.getReportSummary(fromDate, toDate),
    window.api.getReportStats(fromDate, toDate),
    window.api.getProductPerformance(fromDate, toDate),
    window.api.getCustomerAnalysis(fromDate, toDate),
    window.api.getSupplierAnalysis(fromDate, toDate)
  ]);

  document.getElementById('report-total-sales').textContent = toMoney(summary.totalSales || 0);
  document.getElementById('report-total-purchases').textContent = toMoney(summary.totalPurchases || 0);
  document.getElementById('report-total-expenses').textContent = toMoney(summary.totalExpenses || 0);
  document.getElementById('report-total-profit').textContent = toMoney(summary.totalProfit || 0);

  document.getElementById('stat-total-trans').textContent = stats?.totalTransactions || 0;
  document.getElementById('stat-avg-sale').textContent = toMoney(stats?.avgSaleValue || 0);
  document.getElementById('stat-avg-purchase').textContent = toMoney(stats?.avgPurchaseValue || 0);

  const receivables = (customers || []).reduce((sum, c) => sum + Number(c.current_balance || 0), 0);
  const payables = (suppliers || []).reduce((sum, s) => sum + Number(s.current_balance || 0), 0);

  document.getElementById('stat-receivables').textContent = toMoney(receivables);
  document.getElementById('stat-payables').textContent = toMoney(payables);

  document.getElementById('report-products-table').innerHTML = (products || []).map((p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.qty_sold || 0}</td>
      <td>${toMoney(p.revenue || 0)}</td>
      <td>${toMoney(p.avg_price || 0)}</td>
    </tr>
  `).join('');

  document.getElementById('report-customers-table').innerHTML = (customers || []).map((c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.purchases || 0}</td>
      <td>${toMoney(c.total_spent || 0)}</td>
      <td>${toMoney(c.current_balance || 0)}</td>
    </tr>
  `).join('');

  document.getElementById('report-suppliers-table').innerHTML = (suppliers || []).map((s) => `
    <tr>
      <td>${s.name}</td>
      <td>${s.orders || 0}</td>
      <td>${toMoney(s.total_purchased || 0)}</td>
      <td>${toMoney(s.current_balance || 0)}</td>
    </tr>
  `).join('');
}

async function loadData() {
  const [dashboard, reportSummary, products, customers, suppliers, inventory, sales, purchases, expenses, orders, settings] = await Promise.all([
    window.api.getDashboardSummary(),
    window.api.getReportSummary(),
    window.api.listProducts(),
    window.api.listCustomers(),
    window.api.listSuppliers(),
    window.api.listInventory(),
    window.api.listSales(),
    window.api.listPurchases(),
    window.api.listExpenses(),
    window.api.listOrders(),
    window.api.getSettings()
  ]);

  state.dashboard = dashboard;
  state.reportSummary = reportSummary || {};
  state.products = products || [];
  state.customers = customers || [];
  state.suppliers = suppliers || [];
  state.inventory = inventory || [];
  state.sales = sales || [];
  state.purchases = purchases || [];
  state.expenses = expenses || [];
  state.orders = orders || [];
  state.settings = settings || {};

  elements.shopName.textContent = settings?.shop_name || 'MashaAllah Electronics';
  renderDashboard();
  renderSaleCustomerOptions();
  renderSaleProducts();
  renderPurchaseSupplierOptions();
  renderPurchaseProducts();
  renderProducts();
  renderInventory();
  renderCustomers();
  renderSuppliers();
  renderOrders();
  renderExpenses();

  elements.settingShopName.value = settings?.shop_name || 'MashaAllah Electronics';
  elements.settingPhone.value = settings?.phone || '';
  elements.settingEmail.value = settings?.email || '';
  elements.settingCurrency.value = settings?.currency || 'PKR';
  elements.settingLowStock.value = settings?.low_stock_threshold || 5;
  elements.settingInvoicePrefix.value = settings?.invoice_prefix || 'INV';
  elements.settingAddress.value = settings?.address || '';
  elements.settingInvoiceFooter.value = settings?.invoice_footer || 'Thank you for shopping with MashaAllah Electronics.';

  await loadReportData();
}

async function saveSettings() {
  const payload = {
    shop_name: elements.settingShopName.value,
    phone: elements.settingPhone.value,
    email: elements.settingEmail.value,
    currency: elements.settingCurrency.value,
    low_stock_threshold: Number(elements.settingLowStock.value || 0),
    invoice_prefix: elements.settingInvoicePrefix.value,
    address: elements.settingAddress.value,
    invoice_footer: elements.settingInvoiceFooter.value
  };

  await window.api.saveSettings(payload);
  await loadData();
  alert('Settings saved.');
}

function promptValue(label, fallback = '') {
  const response = window.prompt(label, fallback);
  return response === null ? null : response;
}

function promptNumber(label, fallback = 0) {
  const response = window.prompt(label, String(fallback));
  if (response === null) return null;
  const value = Number(response);
  return Number.isFinite(value) ? value : null;
}

// Modal management functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'grid';
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    // Reset form if it exists
    const form = modal.querySelector('form');
    if (form) form.reset();
  }
}

// Click outside modal to close
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeModal(e.target.id);
  }
});


async function addProduct() {
  // Reset form and open modal
  document.getElementById('product-id').value = '';
  document.getElementById('product-form').reset();
  document.getElementById('product-modal-title').textContent = 'Add Product';
  openModal('product-modal');
}

async function editProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  // Populate form with product data
  document.getElementById('product-id').value = product.id || '';
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-sku').value = product.sku || '';
  document.getElementById('product-barcode').value = product.barcode || '';
  document.getElementById('product-brand').value = product.brand || '';
  document.getElementById('product-model').value = product.model || '';
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-unit').value = product.unit || 'pcs';
  document.getElementById('product-purchase-price').value = product.purchase_price || 0;
  document.getElementById('product-selling-price').value = product.selling_price || 0;
  document.getElementById('product-wholesale-price').value = product.wholesale_price || 0;
  document.getElementById('product-current-stock').value = product.current_stock || 0;
  document.getElementById('product-minimum-stock').value = product.minimum_stock || 0;
  document.getElementById('product-warranty-period').value = product.warranty_period || '';
  
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  openModal('product-modal');
}


async function addCustomer() {
  document.getElementById('customer-id').value = '';
  document.getElementById('customer-form').reset();
  document.getElementById('customer-modal-title').textContent = 'Add Customer';
  openModal('customer-modal');
}

async function editCustomer(customerId) {
  const customer = state.customers.find((item) => item.id === customerId);
  if (!customer) return;

  document.getElementById('customer-id').value = customer.id || '';
  document.getElementById('customer-name').value = customer.name || '';
  document.getElementById('customer-customer-id').value = customer.customer_id || '';
  document.getElementById('customer-phone').value = customer.phone || '';
  document.getElementById('customer-email').value = customer.email || '';
  document.getElementById('customer-address').value = customer.address || '';
  document.getElementById('customer-notes').value = customer.notes || '';
  document.getElementById('customer-opening-balance').value = customer.opening_balance || 0;
  document.getElementById('customer-current-balance').value = customer.current_balance || 0;
  document.getElementById('customer-credit-limit').value = customer.credit_limit || 0;

  document.getElementById('customer-modal-title').textContent = 'Edit Customer';
  openModal('customer-modal');
}


async function addSupplier() {
  document.getElementById('supplier-id').value = '';
  document.getElementById('supplier-form').reset();
  document.getElementById('supplier-modal-title').textContent = 'Add Supplier';
  openModal('supplier-modal');
}

async function editSupplier(supplierId) {
  const supplier = state.suppliers.find((item) => item.id === supplierId);
  if (!supplier) return;

  document.getElementById('supplier-id').value = supplier.id || '';
  document.getElementById('supplier-name').value = supplier.name || '';
  document.getElementById('supplier-supplier-id').value = supplier.supplier_id || '';
  document.getElementById('supplier-contact-person').value = supplier.contact_person || '';
  document.getElementById('supplier-phone').value = supplier.phone || '';
  document.getElementById('supplier-email').value = supplier.email || '';
  document.getElementById('supplier-address').value = supplier.address || '';
  document.getElementById('supplier-notes').value = supplier.notes || '';
  document.getElementById('supplier-current-balance').value = supplier.current_balance || 0;

  document.getElementById('supplier-modal-title').textContent = 'Edit Supplier';
  openModal('supplier-modal');
}

async function addExpense() {
  document.getElementById('expense-form').reset();
  document.getElementById('expense-date').valueAsDate = new Date();
  openModal('expense-modal');
}

async function createOrder() {
  document.getElementById('order-form').reset();
  document.getElementById('order-delivery-date').valueAsDate = new Date(Date.now() + 86400000);
  openModal('order-modal');
}

async function addSaleItem() {
  const productId = Number(elements.saleProduct.value);
  const product = state.products.find((item) => item.id === productId);
  const qty = Number(elements.saleQty.value || 0);
  const unitPrice = Number(elements.salePrice.value || 0);

  if (!product) return alert('Select a product.');
  if (qty <= 0) return alert('Quantity must be greater than zero.');
  if (qty > Number(product.current_stock || 0)) return alert('Insufficient stock for sale.');

  state.saleCart.push({
    productId,
    productName: product.name,
    quantity: qty,
    unitPrice
  });

  renderSaleCart();
  elements.saleQty.value = 1;
}

async function completeSale() {
  if (state.saleCart.length === 0) return alert('Add at least one product to the cart.');
  const payload = {
    customerId: Number(elements.saleCustomer.value || 0) || null,
    paymentMethod: elements.salePaymentMethod.value,
    notes: '',
    items: state.saleCart.map((item) => ({ product_id: item.productId, quantity: item.quantity, unit_price: item.unitPrice })),
    discount: Number(elements.saleDiscount.value || 0)
  };

  await window.api.createSale(payload);
  state.saleCart = [];
  renderSaleCart();
  elements.saleDiscount.value = 0;
  await loadData();
  alert('Sale completed successfully.');
}

async function addPurchaseItem() {
  const productId = Number(elements.purchaseProduct.value);
  const product = state.products.find((item) => item.id === productId);
  const qty = Number(elements.purchaseQty.value || 0);
  const unitCost = Number(elements.purchaseUnitCost.value || 0);

  if (!product) return alert('Select a product.');
  if (qty <= 0) return alert('Quantity must be greater than zero.');

  state.purchaseCart.push({
    productId,
    productName: product.name,
    quantity: qty,
    unitCost
  });

  renderPurchaseCart();
  elements.purchaseQty.value = 1;
}

async function completePurchase() {
  if (state.purchaseCart.length === 0) return alert('Add at least one product to the purchase cart.');
  const payload = {
    supplierId: Number(elements.purchaseSupplier.value || 0) || null,
    paymentMethod: elements.purchasePaymentMethod.value,
    notes: '',
    items: state.purchaseCart.map((item) => ({ product_id: item.productId, quantity: item.quantity, unit_cost: item.unitCost })),
    discount: Number(elements.purchaseDiscount.value || 0)
  };

  await window.api.createPurchase(payload);
  state.purchaseCart = [];
  renderPurchaseCart();
  elements.purchaseDiscount.value = 0;
  await loadData();
  alert('Purchase recorded successfully.');
}

async function backupDatabase() {
  const filePath = await window.api.chooseBackupPath();
  if (!filePath) return;
  await window.api.backupDatabase(filePath);
  alert('Database backup completed.');
}

async function restoreDatabase() {
  const filePath = await window.api.chooseRestorePath();
  if (!filePath) return;
  const confirmed = confirm('This will restore the database from the selected backup. Continue?');
  if (!confirmed) return;
  await window.api.restoreDatabase(filePath);
  await loadData();
  alert('Database restored successfully.');
}

function attachEvents() {
  try {
    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach((button) => {
      button.addEventListener('click', () => setPage(button.dataset.section));
    });

    // Safely attach event listeners with null checks
    const attachClick = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', handler);
    };

    const attachInput = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', handler);
    };

    const attachChange = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', handler);
    };

    attachClick('refresh-data', loadData);
    attachClick('add-sale-item', addSaleItem);
    attachClick('complete-sale', completeSale);
    attachClick('add-purchase-item', addPurchaseItem);
    attachClick('complete-purchase', completePurchase);
    attachClick('save-settings-btn', saveSettings);
    attachClick('backup-btn', backupDatabase);
    attachClick('restore-btn', restoreDatabase);
    attachClick('add-product-btn', addProduct);
    attachClick('add-customer-btn', addCustomer);
    attachClick('add-supplier-btn', addSupplier);
    attachClick('add-expense-btn', addExpense);
    attachClick('add-order-btn', createOrder);
    attachClick('report-filter-btn', loadReportData);

    // Element-based listeners
    if (elements.productSearch) elements.productSearch.addEventListener('input', renderProducts);
    if (elements.customerSearch) elements.customerSearch.addEventListener('input', renderCustomers);
    if (elements.supplierSearch) elements.supplierSearch.addEventListener('input', renderSuppliers);
    if (elements.saleDiscount) elements.saleDiscount.addEventListener('input', updateSaleCartTotals);
    if (elements.purchaseDiscount) elements.purchaseDiscount.addEventListener('input', updatePurchaseCartTotals);

    if (elements.saleProduct) {
      elements.saleProduct.addEventListener('change', () => {
        const product = state.products.find((item) => item.id === Number(elements.saleProduct.value));
        if (product) {
          elements.salePrice.value = product.selling_price || 0;
        }
      });
    }

    if (elements.purchaseProduct) {
      elements.purchaseProduct.addEventListener('change', () => {
        const product = state.products.find((item) => item.id === Number(elements.purchaseProduct.value));
        if (product) {
          elements.purchaseUnitCost.value = product.purchase_price || 0;
        }
      });
    }

    // Report tabs
    document.querySelectorAll('.report-tab').forEach((tab) => {
      tab.addEventListener('click', async () => {
        document.querySelectorAll('.report-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.report-tab-content').forEach((c) => c.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.getElementById(`report-tab-${tabName}`)?.classList.add('active');
        await loadReportData();
      });
    });

    // Delegated click handler for edit buttons
    document.addEventListener('click', async (event) => {
      const productButton = event.target.closest('.edit-product');
      if (productButton) {
        await editProduct(Number(productButton.dataset.id));
      }

      const customerButton = event.target.closest('.edit-customer');
      if (customerButton) {
        await editCustomer(Number(customerButton.dataset.id));
      }

      const supplierButton = event.target.closest('.edit-supplier');
      if (supplierButton) {
        await editSupplier(Number(supplierButton.dataset.id));
      }
    });

    // Form submission handlers
    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = document.getElementById('product-id').value;
      const product = {
        name: document.getElementById('product-name').value || 'Unnamed',
        sku: document.getElementById('product-sku').value || `SKU-${Date.now()}`,
        barcode: document.getElementById('product-barcode').value || '',
        brand: document.getElementById('product-brand').value || '',
        model: document.getElementById('product-model').value || '',
        description: document.getElementById('product-description').value || '',
        unit: document.getElementById('product-unit').value || 'pcs',
        purchase_price: Number(document.getElementById('product-purchase-price').value) || 0,
        selling_price: Number(document.getElementById('product-selling-price').value) || 0,
        wholesale_price: Number(document.getElementById('product-wholesale-price').value) || 0,
        current_stock: Number(document.getElementById('product-current-stock').value) || 0,
        minimum_stock: Number(document.getElementById('product-minimum-stock').value) || 0,
        warranty_period: document.getElementById('product-warranty-period').value || '',
        status: 'active',
        serial_tracking: 0
      };
      if (productId) product.id = Number(productId);
      await window.api.saveProduct(product);
      closeModal('product-modal');
      await loadData();
      alert('Product saved.');
    });

    document.getElementById('customer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const customerId = document.getElementById('customer-id').value;
      const customer = {
        name: document.getElementById('customer-name').value || 'Unnamed',
        customer_id: document.getElementById('customer-customer-id').value || `CUST-${Date.now()}`,
        phone: document.getElementById('customer-phone').value || '',
        email: document.getElementById('customer-email').value || '',
        address: document.getElementById('customer-address').value || '',
        notes: document.getElementById('customer-notes').value || '',
        opening_balance: Number(document.getElementById('customer-opening-balance').value) || 0,
        current_balance: Number(document.getElementById('customer-current-balance').value) || 0,
        credit_limit: Number(document.getElementById('customer-credit-limit').value) || 0
      };
      if (customerId) customer.id = Number(customerId);
      await window.api.saveCustomer(customer);
      closeModal('customer-modal');
      await loadData();
      alert('Customer saved.');
    });

    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const supplierId = document.getElementById('supplier-id').value;
      const supplier = {
        name: document.getElementById('supplier-name').value || 'Unnamed',
        supplier_id: document.getElementById('supplier-supplier-id').value || `SUP-${Date.now()}`,
        contact_person: document.getElementById('supplier-contact-person').value || '',
        phone: document.getElementById('supplier-phone').value || '',
        email: document.getElementById('supplier-email').value || '',
        address: document.getElementById('supplier-address').value || '',
        notes: document.getElementById('supplier-notes').value || '',
        opening_balance: 0,
        current_balance: Number(document.getElementById('supplier-current-balance').value) || 0
      };
      if (supplierId) supplier.id = Number(supplierId);
      await window.api.saveSupplier(supplier);
      closeModal('supplier-modal');
      await loadData();
      alert('Supplier saved.');
    });

    document.getElementById('expense-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById('expense-amount').value);
      if (amount <= 0) return alert('Expense amount must be greater than zero.');
      await window.api.saveExpense({
        category: document.getElementById('expense-category').value || 'Miscellaneous',
        description: document.getElementById('expense-description').value || '',
        amount,
        payment_method: document.getElementById('expense-payment-method').value || 'Cash',
        expense_date: document.getElementById('expense-date').value || new Date().toISOString()
      });
      closeModal('expense-modal');
      await loadData();
      alert('Expense recorded.');
    });

    document.getElementById('order-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const customerName = document.getElementById('order-customer-name').value;
      if (!customerName) return alert('Customer name is required.');
      const order = {
        order_number: `ORD-${Date.now()}`,
        customer_name: customerName,
        product_description: document.getElementById('order-product-description').value || '',
        delivery_date: document.getElementById('order-delivery-date').value || new Date().toISOString(),
        status: document.getElementById('order-status').value || 'pending',
        notes: ''
      };
      await window.api.saveOrder(order);
      closeModal('order-modal');
      await loadData();
      alert('Order created.');
    });

    console.log('✓ All event listeners attached successfully');
  } catch (error) {
    console.error('✗ Error attaching events:', error);
  }
}

async function init() {
  // Wait for DOM to be fully ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }
  
  console.log('✓ DOM ready, attaching events...');
  attachEvents();
  
  console.log('✓ Loading data...');
  await loadData();
  
  console.log('✓ Setting page to dashboard...');
  setPage('dashboard');
  
  console.log('✓ App initialized successfully');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
