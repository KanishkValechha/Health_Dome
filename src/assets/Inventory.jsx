import React, { useState, useEffect } from "react";

const MedicationInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [selectedMed, setSelectedMed] = useState(null);
  const [medId, setMedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch("http://vedicvarma.com:5000/medicines");
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleOpenDialog = (type) => {
    setTransactionType(type);
    setIsDialogOpen(true);
    setSelectedMed(null);
    setMedId("");
    setQuantity(1);
  };

  const handleMedIdChange = (e) => {
    const id = e.target.value;
    setMedId(id);
    const med = inventory.find((m) => m[0].toString() === id);
    setSelectedMed(med || null);
  };

  const handleTransaction = async () => {
    if (!selectedMed) return;

    const currentQuantity = selectedMed[3];
    const newQuantity =
      transactionType === "buy"
        ? currentQuantity + quantity
        : Math.max(0, currentQuantity - quantity);

    try {
      const response = await fetch("http://vedicvarma.com:5000/set_medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Qty: newQuantity,
          MediID: selectedMed[0],
        }),
      });

      if (!response.ok) throw new Error("Failed to update inventory");
      await fetchInventory();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <button
            onClick={() => handleOpenDialog("buy")}
            style={{
              backgroundColor: "#3B82F6",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              marginRight: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Buy Medicine
          </button>
          <button
            onClick={() => handleOpenDialog("sell")}
            style={{
              backgroundColor: "#EF4444",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Sell Medicine
          </button>
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Medication Inventory
        </h1>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#E5E7EB" }}>
            <th style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
              Med ID
            </th>
            <th style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
              Med Name
            </th>
            <th style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
              Quantity
            </th>
            <th style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
              Price
            </th>
            <th style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
              Expiry Date
            </th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((med) => (
            <tr key={med[0]}>
              <td style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
                {med[0]}
              </td>
              <td style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
                {med[1]}
              </td>
              <td style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
                {med[3]}
              </td>
              <td style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
                ${med[2]}
              </td>
              <td style={{ border: "1px solid #D1D5DB", padding: "0.5rem" }}>
                {med[4]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              maxWidth: "28rem",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              {transactionType === "buy" ? "Buy" : "Sell"} Medicine
            </h2>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="medId"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Med ID
              </label>
              <input
                id="medId"
                type="text"
                value={medId}
                onChange={handleMedIdChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #D1D5DB",
                  borderRadius: "0.25rem",
                }}
              />
            </div>
            {selectedMed && (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.25rem" }}>
                    Name
                  </label>
                  <div
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {selectedMed[1]}
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.25rem" }}>
                    Price
                  </label>
                  <div
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "0.25rem",
                    }}
                  >
                    ${selectedMed[2]}
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="quantity"
                    style={{ display: "block", marginBottom: "0.25rem" }}
                  >
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={
                      transactionType === "sell" ? selectedMed[3] : undefined
                    }
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.25rem",
                    }}
                  />
                </div>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsDialogOpen(false)}
                style={{
                  backgroundColor: "#D1D5DB",
                  color: "black",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.25rem",
                  marginRight: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTransaction}
                disabled={!selectedMed}
                style={{
                  backgroundColor: selectedMed ? "#10B981" : "#D1D5DB",
                  color: selectedMed ? "white" : "#6B7280",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.25rem",
                  border: "none",
                  cursor: selectedMed ? "pointer" : "not-allowed",
                }}
              >
                Confirm {transactionType === "buy" ? "Purchase" : "Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationInventory;