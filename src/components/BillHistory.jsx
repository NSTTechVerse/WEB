// src/components/BillHistory.jsx
import React, { useEffect, useState } from "react";

const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await window.electronAPI.getBills();
      setBills(data);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this bill?")) return;
    try {
      await window.electronAPI.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bill:", err);
      alert("❌ Failed to delete bill.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("⚠️ Delete ALL bills? This action cannot be undone.")) return;
    try {
      await window.electronAPI.clearAllBills();
      setBills([]);
    } catch (err) {
      console.error("Failed to clear all bills:", err);
      alert("❌ Failed to clear all bills.");
    }
  };

  // 🔍 Filter bills by name or date
  const filteredBills = bills.filter((bill) => {
    const date = new Date(bill.date).toLocaleDateString();
    return (
      bill.name.toLowerCase().includes(search.toLowerCase()) ||
      date.includes(search)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 sm:mb-0">
          📜 Bill History
        </h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="px-3 bg-gray-300 rounded hover:bg-gray-400"
            >
              ✕
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Invoice</th>
              <th className="p-3 border-b">Customer</th>
              <th className="p-3 border-b text-right">Total (AED)</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill, idx) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{idx + 1}</td>
                  <td className="p-3 border-b">
                    {new Date(bill.date).toLocaleString()}
                  </td>
                  <td className="p-3 border-b">{bill.invoice}</td>
                  <td className="p-3 border-b">{bill.name}</td>
                  <td className="p-3 border-b text-right">
                    {bill.total.toFixed(2)}
                  </td>
                  <td className="p-3 border-b text-center">
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-4 text-gray-500 border-b"
                >
                  No bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillHistory;
