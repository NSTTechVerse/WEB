const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
require("dotenv").config();

const isDev = !app.isPackaged;

// ✅ Determine base path for unpacked files
const basePath = isDev
  ? path.join(__dirname)
  : path.join(process.resourcesPath, "app.asar.unpacked", "electron");

// ✅ Import database and utility modules
const db = require(path.join(basePath, "db.js"));
const products = require(path.join(basePath, "database", "products.js"));
const bills = require(path.join(basePath, "database", "bills.js"));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    // 👇 Development (works fine already)
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    
  } else {
    // 👇 Production: safe path resolution for Electron + Vite
    const indexPath = path.join(__dirname, "../dist/index.html");
    console.log("Loading production index:", indexPath);
    win
      .loadFile(indexPath)
      .then(() => console.log("Loaded production app"))
      .catch((err) => console.error("Failed to load index.html:", err));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


// ✅ IPC handlers for communication
ipcMain.handle("getProducts", () => products.getAllProducts());
ipcMain.handle("addProduct", (_, data) => products.addProduct(data));
ipcMain.handle("deleteProduct", (_, code) => products.deleteProduct(code));

ipcMain.handle("getBills", () => bills.getAllBills());
ipcMain.handle("saveBill", (_, bill) => bills.saveBill(bill));
ipcMain.handle("delete-bill", (_, id) => {
  db.prepare("DELETE FROM bills WHERE id = ?").run(id);
  return true;
});
ipcMain.handle("clear-all-bills", () => {
  db.prepare("DELETE FROM bills").run();
  return true;
});
ipcMain.handle("print-bill", async (_, billData) => {
  try {
    await printInvoice(billData);
  } catch (err) {
    console.error("🖨️ Print error:", err);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
