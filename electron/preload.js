const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Products
  getProducts: () => ipcRenderer.invoke("getProducts"),
  addProduct: (data) => ipcRenderer.invoke("addProduct", data),
  deleteProduct: (code) => ipcRenderer.invoke("deleteProduct", code),

  // Bills
  getBills: () => ipcRenderer.invoke("getBills"),
  saveBill: (bill) => ipcRenderer.invoke("saveBill", bill),
  deleteBill: (id) => ipcRenderer.invoke("delete-bill", id),
  clearAllBills: () => ipcRenderer.invoke("clear-all-bills"),

  // Printing
  printBill: (billData) => ipcRenderer.invoke("print-bill", billData),
});
