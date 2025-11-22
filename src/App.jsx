import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import BillingPage from "./components/BillingPage";
import AddProductPage from "./components/AddProductPage";
import BillHistory from "./components/BillHistory";

function App() {
  const [activePage, setActivePage] = useState("billing");

  const renderRightPanel = () => {
    switch (activePage) {
      case "billing":
        return <BillingPage />;
      case "add-product":
        return <AddProductPage />;
      case "bill-history":
        return <BillHistory />;
      default:
        return <BillingPage />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "white" }}>
      <Sidebar setActivePage={setActivePage} activePage={activePage} />
      <div style={{ flex: 1, overflowY: "auto" }}>{renderRightPanel()}</div>
    </div>
  );
}

export default App;
