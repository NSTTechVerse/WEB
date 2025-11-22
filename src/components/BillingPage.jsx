import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaPrint, FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import ReceiptTemplate from "./ReceiptTemplate";

const BillingPage = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef(null);
  const [customerName, setCustomerName] = useState("");
  const receiptRef = useRef(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = (await window.electronAPI?.getProducts?.()) ?? [];

        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Total calculation
  useEffect(() => {
    setGrandTotal(
      billItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
  }, [billItems]);

  // Search suggestions
  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.code.includes(query)
    );
    setSuggestions(filtered);
    setHighlightedIndex(-1);
  }, [query, products]);

  // Barcode handler
  useEffect(() => {
    let buffer = "";
    let timeout;

    const handleScannerInput = (e) => {
      // 🛑 ignore input if typing manually in search box
      if (document.activeElement === inputRef.current) return;

      if (e.key === "Enter") {
        if (buffer.trim() !== "") {
          const product = products.find((p) => p.code === buffer.trim());
          if (product) addToBill(product);
        }
        buffer = "";
        clearTimeout(timeout);
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => (buffer = ""), 200);
      }
    };

    window.addEventListener("keydown", handleScannerInput);
    return () => window.removeEventListener("keydown", handleScannerInput);
  }, [products]);

  const addToBill = (product) => {
    setBillItems((prev) => {
      const existing = prev.find((i) => i.code === product.code);
      if (existing) {
        return prev.map((i) =>
          i.code === product.code ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeItem = (code) =>
    setBillItems((prev) => prev.filter((i) => i.code !== code));

  const updateQuantity = (code, delta) =>
    setBillItems((prev) =>
      prev.map((i) =>
        i.code === code
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex])
        addToBill(suggestions[highlightedIndex]);
      else {
        const product = products.find((p) => p.code === query.trim());
        if (product) addToBill(product);
      }
    } else if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }
  };

  const saveAndPrintBill = () => {
    if (billItems.length === 0) return alert("No items in the bill!");
    setShowPreview(true);
  };

  const confirmPrint = () => {
    if (!billItems.length) return alert("No items to print!");
    const html = receiptRef.current?.getHtml?.();
    if (!html) return alert("Print template error");

    const invoice = receiptRef.current?.getInvoiceNo?.(); 

    window.electronAPI?.saveBill({
      items: billItems,
      total: grandTotal,
      name: customerName,
      invoice, 
    });

    const w = window.open("", "_blank", "width=400,height=700");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
    setShowPreview(false);
    setBillItems([]);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">🧾 Billing System</h1>
        <button
          onClick={saveAndPrintBill}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          <FaPrint className="inline mr-2" /> Print Bill
        </button>
      </div>

      {/* Customer Name */}
      <div className="mb-4">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="flex items-center bg-white rounded-full shadow-md p-3 border border-gray-200">
          <FaSearch className="text-gray-500 mr-3" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by code or name"
            className="flex-1 outline-none text-gray-800 text-lg"
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current.focus();
              }}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-white border border-gray-200 rounded-lg shadow mt-2 max-h-48 overflow-y-auto z-10">
            {suggestions.map((item, idx) => (
              <li
                key={item.code}
                onClick={() => addToBill(item)}
                className={`p-2 cursor-pointer ${
                  idx === highlightedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                {item.name} — {item.price} AED
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bill Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 border-b">#</th>
              <th className="py-3 px-4 border-b">Item</th>
              <th className="py-3 px-4 border-b text-right">Price</th>
              <th className="py-3 px-4 border-b text-center">Qty</th>
              <th className="py-3 px-4 border-b text-right">Total</th>
              <th className="py-3 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {billItems.length > 0 ? (
              billItems.map((item, idx) => (
                <tr key={item.code} className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {item.price.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.code, -1)}
                        className="bg-gray-300 hover:bg-gray-400 rounded-full p-1"
                      >
                        <FaMinus size={10} />
                      </button>
                      {item.quantity}
                      <button
                        onClick={() => updateQuantity(item.code, 1)}
                        className="bg-gray-300 hover:bg-gray-400 rounded-full p-1"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    {(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => removeItem(item.code)}
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
                  className="text-center py-4 text-gray-500 border-b"
                >
                  No items added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total */}
      {billItems.length > 0 && (
        <div className="text-right mt-6 text-xl font-semibold text-gray-800">
          Grand Total: {grandTotal.toFixed(2)} AED
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-3xl p-6 relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
              Bill Preview
            </h2>

            <table className="w-full text-left border border-gray-200 rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Name</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item, idx) => (
                  <tr key={item.code} className="border-b hover:bg-blue-50">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-right">{item.price.toFixed(2)}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan="4" className="text-right p-2">
                    Grand Total:
                  </td>
                  <td className="text-right p-2 text-blue-700">
                    {grandTotal.toFixed(2)} AED
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={confirmPrint}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaPrint /> Confirm & Print
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ReceiptTemplate
        ref={receiptRef}
        billItems={billItems}
        grandTotal={grandTotal}
        customerName={customerName}
      />
    </div>
  );
};

export default BillingPage;
