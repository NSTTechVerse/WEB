// Sidebar.jsx
import React from "react";

const Sidebar = ({ setActivePage, activePage }) => {
  return (
    <div
      style={{
        width: "200px",
        backgroundColor: "#f8f8f8",
        borderRight: "1px solid #ccc",
        padding: "20px",
        boxSizing: "border-box",
        height: "100vh",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Menu</h2>

      <button
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          cursor: "pointer",
          backgroundColor: activePage === "billing" ? "#ddd" : "#fff",
          border: "1px solid #ccc",
        }}
        onClick={() => setActivePage("billing")}
      >
        Billing
      </button>

      <button
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          cursor: "pointer",
          backgroundColor: activePage === "add-product" ? "#ddd" : "#fff",
          border: "1px solid #ccc",
        }}
        onClick={() => setActivePage("add-product")}
      >
        Add Product
      </button>

      {/* ✅ New button */}
      <button
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          cursor: "pointer",
          backgroundColor: activePage === "bill-history" ? "#ddd" : "#fff",
          border: "1px solid #ccc",
        }}
        onClick={() => setActivePage("bill-history")}
      >
        Bill History
      </button>
    </div>
  );
};

export default Sidebar;
