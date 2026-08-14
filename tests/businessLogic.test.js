const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateInvoiceTotals,
  createPaymentAllocation,
  calculateProfit,
  applyInventoryMovement,
  validateSale,
  validatePurchase,
  normalizeMoney
} = require('../src/services/business');

test('calculateInvoiceTotals returns expected totals with discount', () => {
  const result = calculateInvoiceTotals([
    { quantity: 2, unitPrice: 2500, discount: 200 },
    { quantity: 1, unitPrice: 3000, discount: 0 }
  ]);

  assert.equal(result.subtotal, 8000);
  assert.equal(result.discount, 200);
  assert.equal(result.total, 7800);
});

test('createPaymentAllocation caps payments to the outstanding balance and keeps remaining value', () => {
  const allocation = createPaymentAllocation(10000, 6500);
  assert.deepEqual(allocation, { amount: 6500, remaining: 0 });

  const partial = createPaymentAllocation(4000, 15000);
  assert.deepEqual(partial, { amount: 4000, remaining: 11000 });

  assert.throws(() => createPaymentAllocation(-100, 15000), /negative/i);
});

test('calculateProfit includes sales, purchases and expenses', () => {
  const profit = calculateProfit({
    salesRevenue: 50000,
    costOfGoods: 28000,
    expenses: 3500
  });

  assert.equal(profit.grossProfit, 22000);
  assert.equal(profit.netProfit, 18500);
});

test('applyInventoryMovement updates quantity and records reason', () => {
  const state = { currentStock: 5 };
  const result = applyInventoryMovement(state, { quantity: 3, type: 'stock_in', reason: 'purchase' });

  assert.equal(result.currentStock, 8);
  assert.equal(result.history[0].reason, 'purchase');
});

test('validateSale rejects insufficient stock and negative quantity', () => {
  assert.throws(() => validateSale({ quantity: -1, availableStock: 5 }), /quantity cannot be negative/i);
  assert.throws(() => validateSale({ quantity: 10, availableStock: 5 }), /insufficient stock/i);
  assert.doesNotThrow(() => validateSale({ quantity: 2, availableStock: 5, price: 1200 }));
});

test('validatePurchase rejects invalid amounts', () => {
  assert.throws(() => validatePurchase({ quantity: 0, unitCost: 100 }), /quantity must be greater than zero/i);
  assert.throws(() => validatePurchase({ quantity: 2, unitCost: -10 }), /unit cost cannot be negative/i);
  assert.doesNotThrow(() => validatePurchase({ quantity: 2, unitCost: 100 }));
});

test('normalizeMoney rounds to PKR currency precision', () => {
  assert.equal(normalizeMoney(1234.567), 1234.57);
  assert.equal(normalizeMoney('2500'), 2500);
});
