import React, { useState, useEffect } from "react";

const hospitals = [
  { name: "Bhardwaj Hospital", url: "http://localhost:5000" },
  { name: "Balaji Soni Hospital", url: "http://vedicvarma.com:5000" },
  { name: "Agrawal Hospital", url: "http://192.168.205.1:5000" },
];


const THRESHOLD = 5; // Set the threshold value here

const HospitalInventoryManager = () => {
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [selectedMed, setSelectedMed] = useState(null);
  const [medId, setMedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showThresholdAlert, setShowThresholdAlert] = useState(false);
  const [thresholdMed, setThresholdMed] = useState(null);

  const currentHospital = hospitals[currentHospitalIndex];

  useEffect(() => {
    fetchInventory();
  }, [currentHospitalIndex]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${currentHospital.url}/medicines`);
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to load inventory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevHospital = () => {
    setCurrentHospitalIndex((prevIndex) =>
      prevIndex === 0 ? hospitals.length - 1 : prevIndex - 1
    );
  };

  const handleNextHospital = () => {
    setCurrentHospitalIndex((prevIndex) => (prevIndex + 1) % hospitals.length);
  };

  const handleOpenDialog = (type, med = null) => {
    setTransactionType(type);
    setIsDialogOpen(true);
    if (med) {
      setSelectedMed(med);
      setMedId(med[0].toString());
      if (type === "buy" && med[3] <= THRESHOLD) {
        setQuantity(THRESHOLD - med[3] + 1);
      } else {
        setQuantity(1);
      }
    } else {
      setSelectedMed(null);
      setMedId("");
      setQuantity(1);
    }
  };

  const handleMedIdChange = (e) => {
    const id = e.target.value;
    setMedId(id);
    const med = inventory.find((m) => m[0].toString() === id);
    setSelectedMed(med || null);
    if (med && transactionType === "buy" && med[3] <= THRESHOLD) {
      setQuantity(THRESHOLD - med[3] + 1);
    } else {
      setQuantity(1);
    }
  };

  const handleTransaction = async () => {
    if (!selectedMed) return;

    const currentQuantity = selectedMed[3];
    const newQuantity =
      transactionType === "buy"
        ? currentQuantity + quantity
        : Math.max(0, currentQuantity - quantity);

    try {
      const response = await fetch(`${currentHospital.url}/set_medicine`, {
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

      // Check if the new quantity is at or below the threshold after a sale
      if (transactionType === "sell" && newQuantity <= THRESHOLD) {
        setThresholdMed({ ...selectedMed, 3: newQuantity });
        setShowThresholdAlert(true);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleBuyThresholdMed = () => {
    setShowThresholdAlert(false);
    handleOpenDialog("buy", thresholdMed);
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
        <button
          onClick={handlePrevHospital}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          ← Previous
        </button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          {currentHospital.name} Inventory
        </h1>
        <button
          onClick={handleNextHospital}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Next →
        </button>
      </div>

      {loading && <p>Loading inventory...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div>
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Buy Medicine
              </button>
              <button
                onClick={() => handleOpenDialog("sell")}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sell Medicine
              </button>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              Medication Inventory
            </h1>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Med ID</th>
                <th className="border border-gray-300 p-2">Med Name</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((med) => (
                <tr key={med[0]}>
                  <td className="border border-gray-300 p-2">{med[0]}</td>
                  <td className="border border-gray-300 p-2">{med[1]}</td>
                  <td className="border border-gray-300 p-2">{med[3]}</td>
                  <td className="border border-gray-300 p-2">Rs {med[2]}</td>
                  <td className="border border-gray-300 p-2">{med[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {isDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">
                  {transactionType === "buy" ? "Buy" : "Sell"} Medicine
                </h2>
                <div className="mb-4">
                  <label htmlFor="medId" className="block mb-1">
                    Med ID
                  </label>
                  <input
                    id="medId"
                    type="text"
                    value={medId}
                    onChange={handleMedIdChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                {selectedMed && (
                  <>
                    <div className="mb-4">
                      <label className="block mb-1">Name</label>
                      <div className="p-2 bg-gray-100 rounded">
                        {selectedMed[1]}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Price</label>
                      <div className="p-2 bg-gray-100 rounded">
                        Rs {selectedMed[2]}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="quantity" className="block mb-1">
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={
                          transactionType === "sell"
                            ? selectedMed[3]
                            : undefined
                        }
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-gray-300 text-black py-2 px-4 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransaction}
                    disabled={!selectedMed}
                    className={`py-2 px-4 rounded ${
                      selectedMed
                        ? "bg-green-500 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Confirm {transactionType === "buy" ? "Purchase" : "Sale"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showThresholdAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-500">
              Low Inventory Alert
            </h2>
            <p className="mb-4">
              The quantity of {thresholdMed[1]} is now at or below the threshold
              of {THRESHOLD}. Current quantity: {thresholdMed[3]}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowThresholdAlert(false)}
                className="bg-gray-300 text-black py-2 px-4 rounded mr-2"
              >
                Close
              </button>
              <button
                onClick={handleBuyThresholdMed}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Buy More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalInventoryManager;
