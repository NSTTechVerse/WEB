const db = require("../db");

function saveBill(bill = {}) {
  const date = new Date().toISOString();
  const invoice = bill.invoice;
  const name = bill.name || "Unknown Customer";
  const total = bill.total || 0;

  const stmt = db.prepare(`
    INSERT INTO bills (date, invoice, name, total)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(date, invoice, name, total);
}

function getAllBills() {
  const stmt = db.prepare("SELECT * FROM bills ORDER BY id DESC");
  return stmt.all();
}

module.exports = {
  saveBill,
  getAllBills,
};
