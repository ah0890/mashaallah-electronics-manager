const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { database } = require('./db/database');

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#f4f7fb',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });
}

async function initializeApp() {
  await database.open();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

app.on('second-instance', () => {
  const [existingWindow] = BrowserWindow.getAllWindows();
  if (existingWindow) {
    if (existingWindow.isMinimized()) existingWindow.restore();
    existingWindow.focus();
  }
});

ipcMain.handle('db:getDashboardSummary', async () => database.getDashboardSummary());
ipcMain.handle('db:getReportSummary', async (_, args) => database.getReportSummary(args?.fromDate, args?.toDate));
ipcMain.handle('db:getProductPerformance', async (_, args) => database.getProductPerformance(args?.fromDate, args?.toDate));
ipcMain.handle('db:getCustomerAnalysis', async (_, args) => database.getCustomerAnalysis(args?.fromDate, args?.toDate));
ipcMain.handle('db:getSupplierAnalysis', async (_, args) => database.getSupplierAnalysis(args?.fromDate, args?.toDate));
ipcMain.handle('db:getReportStats', async (_, args) => database.getReportStats(args?.fromDate, args?.toDate));
ipcMain.handle('db:getSettings', async () => database.getSettings());
ipcMain.handle('db:saveSettings', async (_, settings) => database.saveSettings(settings));
ipcMain.handle('db:listProducts', async () => database.listProducts());
ipcMain.handle('db:saveProduct', async (_, product) => database.saveProduct(product));
ipcMain.handle('db:deleteProduct', async (_, id) => database.deleteProduct(id));
ipcMain.handle('db:listCustomers', async () => database.listCustomers());
ipcMain.handle('db:saveCustomer', async (_, customer) => database.saveCustomer(customer));
ipcMain.handle('db:deleteCustomer', async (_, id) => database.deleteCustomer(id));
ipcMain.handle('db:listSuppliers', async () => database.listSuppliers());
ipcMain.handle('db:saveSupplier', async (_, supplier) => database.saveSupplier(supplier));
ipcMain.handle('db:deleteSupplier', async (_, id) => database.deleteSupplier(id));
ipcMain.handle('db:listInventory', async () => database.listInventory());
ipcMain.handle('db:listSales', async () => database.listSales());
ipcMain.handle('db:createSale', async (_, payload) => database.createSale(payload));
ipcMain.handle('db:listPurchases', async () => database.listPurchaseRecords());
ipcMain.handle('db:createPurchase', async (_, payload) => database.createPurchase(payload));
ipcMain.handle('db:listOrders', async () => database.listOrders());
ipcMain.handle('db:saveOrder', async (_, order) => database.saveOrder(order));
ipcMain.handle('db:listExpenses', async () => database.listExpenses());
ipcMain.handle('db:saveExpense', async (_, expense) => database.saveExpense(expense));
ipcMain.handle('db:backupDatabase', async (_, filePath) => database.backupDatabase(filePath));
ipcMain.handle('db:restoreDatabase', async (_, filePath) => database.restoreDatabase(filePath));
ipcMain.handle('app:chooseBackupPath', async () => {
  const result = await dialog.showSaveDialog({
    title: 'Choose backup location',
    defaultPath: `mashaallah-backup-${Date.now()}.db`
  });

  if (result.canceled) {
    return null;
  }

  return result.filePath;
});
ipcMain.handle('app:chooseRestorePath', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose backup file',
    properties: ['openFile'],
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
