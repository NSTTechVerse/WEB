import React, { useState, useEffect } from "react";

const AddProductPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      if (!window.electronAPI) return;
      try {
        const data = await window.electronAPI.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.includes(search)
  );

  const handleAdd = async () => {
    if (!code || !name || !price)
      return alert("Please fill all fields before adding!");

    const newProduct = { code, name, price: parseFloat(price) };

    try {
      await window.electronAPI.addProduct(newProduct);
      setProducts((prev) => [...prev, newProduct]);
      setCode("");
      setName("");
      setPrice("");
      setShowForm(false);
    } catch (err) {
      console.error("❌ Failed to add product:", err);
      alert("Failed to add product. See console for details.");
    }
  };

  const handleDelete = async (code) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await window.electronAPI.deleteProduct(code);
        setProducts((prev) => prev.filter((p) => p.code !== code));
      } catch (err) {
        console.error("Failed to delete product:", err);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">📦 Product Manager</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          + Add Product
        </button>
      </div>

      {/* Search Bar */}
      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Clear Button */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 text-xl font-bold"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 border-b">Code</th>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Price (AED)</th>
              <th className="py-3 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p.code} className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b">{p.code}</td>
                  <td className="py-2 px-4 border-b">{p.name}</td>
                  <td className="py-2 px-4 border-b">{p.price}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => handleDelete(p.code)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-4 text-gray-500 border-b"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Add Product
            </h2>

            <input
              type="text"
              placeholder="Product Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full mb-3 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductPage;
