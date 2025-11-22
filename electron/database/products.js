const db = require("../db");

// ✅ Get all products
function getAllProducts() {
  return db.prepare("SELECT * FROM products").all();
}

// ✅ Add a new product
function addProduct(product) {
  const stmt = db.prepare("INSERT INTO products (code, name, price) VALUES (?, ?, ?)");
  stmt.run(product.code, product.name, product.price);
  return { success: true };
}

// ✅ Delete a product
function deleteProduct(code) {
  const stmt = db.prepare("DELETE FROM products WHERE code = ?");
  stmt.run(code);
  return { success: true };
}

module.exports = { getAllProducts, addProduct, deleteProduct };
