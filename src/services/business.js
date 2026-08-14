function normalizeMoney(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 0;
  return Number(Math.round(amount * 100) / 100);
}

function calculateInvoiceTotals(items = []) {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unitPrice || 0);
    return sum + qty * price;
  }, 0);

  const discount = items.reduce((sum, item) => {
    const value = Number(item.discount || 0);
    return sum + value;
  }, 0);

  const total = Math.max(0, normalizeMoney(subtotal - discount));

  return {
    subtotal: normalizeMoney(subtotal),
    discount: normalizeMoney(discount),
    total
  };
}

function createPaymentAllocation(paidAmount, outstandingBalance) {
  const payment = normalizeMoney(paidAmount);
  const outstanding = normalizeMoney(outstandingBalance);

  if (payment < 0) {
    throw new Error('Payment amount cannot be negative.');
  }

  const allowedAmount = Math.min(payment, outstanding);

  return {
    amount: allowedAmount,
    remaining: normalizeMoney(outstanding - allowedAmount)
  };
}

function calculateProfit({ salesRevenue = 0, costOfGoods = 0, expenses = 0 }) {
  const revenue = normalizeMoney(salesRevenue);
  const cost = normalizeMoney(costOfGoods);
  const expense = normalizeMoney(expenses);
  const grossProfit = normalizeMoney(revenue - cost);
  const netProfit = normalizeMoney(grossProfit - expense);

  return { grossProfit, netProfit };
}

function applyInventoryMovement(state, movement) {
  const quantity = Number(movement.quantity || 0);
  const currentStock = Number(state.currentStock || 0);
  const type = movement.type || 'stock_adjustment';

  let newStock = currentStock;

  if (type === 'stock_in') {
    newStock = currentStock + quantity;
  } else if (type === 'stock_out') {
    newStock = currentStock - quantity;
  } else if (type === 'stock_adjustment') {
    newStock = currentStock + quantity;
  } else if (type === 'return_in') {
    newStock = currentStock + quantity;
  } else {
    newStock = currentStock - quantity;
  }

  const history = Array.isArray(state.history) ? [...state.history] : [];
  history.unshift({
    quantity,
    type,
    reason: movement.reason || 'manual adjustment',
    date: movement.date || new Date().toISOString()
  });

  return {
    ...state,
    currentStock: normalizeMoney(newStock),
    history
  };
}

function validateSale({ quantity, availableStock, price }) {
  if (!Number.isFinite(Number(quantity))) {
    throw new Error('Quantity must be a valid number.');
  }

  if (Number(quantity) < 0) {
    throw new Error('Quantity cannot be negative.');
  }

  if (Number(quantity) === 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  if (Number(quantity) > Number(availableStock)) {
    throw new Error('Insufficient stock.');
  }

  if (price !== undefined && Number(price) < 0) {
    throw new Error('Selling price cannot be negative.');
  }

  return true;
}

function validatePurchase({ quantity, unitCost }) {
  if (!Number.isFinite(Number(quantity))) {
    throw new Error('Quantity must be a valid number.');
  }

  if (Number(quantity) <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  if (Number(unitCost) < 0) {
    throw new Error('Unit cost cannot be negative.');
  }

  return true;
}

module.exports = {
  normalizeMoney,
  calculateInvoiceTotals,
  createPaymentAllocation,
  calculateProfit,
  applyInventoryMovement,
  validateSale,
  validatePurchase
};
