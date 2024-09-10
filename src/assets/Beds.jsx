import React, { useState, useEffect } from "react";

const hospitals = [
  { name: "Bhardwaj Hospital", url: "http://localhost:5000" },
  { name: "Balaji Soni Hospital", url: "http://vedicvarma.com:5000" },
  { name: "Agrawal Hospital", url: "http://192.168.205.1:5000" },
];
const BedIcon = ({ isAssigned }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-12 h-12 ${isAssigned ? "text-gray-400" : "text-blue-500"}`}
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </svg>
);

const BedCard = ({ bed, onStatusChange }) => {
  const [BedID, Type, Location, Status, Pid] = bed;
  const isAssigned = Status === "Occupied" || Status === "Reserved";

  return (
    <div
      className={`flex items-center p-4 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isAssigned ? "bg-gray-100" : "bg-white"
      }`}
      onClick={() => onStatusChange(BedID)}
    >
      <div className="flex-shrink-0 mr-4">
        <BedIcon isAssigned={isAssigned} />
      </div>
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-800">Bed {BedID}</h3>
        <p className="text-sm text-gray-600">Type: {Type}</p>
        <p className="text-sm text-gray-600">Location: {Location}</p>
        <p className="text-sm font-medium text-gray-700">Status: {Status}</p>
        {Pid && <p className="text-sm text-gray-600">Patient ID: {Pid}</p>}
      </div>
    </div>
  );
};

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">{children}</div>
    </div>
  );
};

const Button = ({ onClick, children, color = "blue", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-300 ${
      color === "blue"
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-gray-500 hover:bg-gray-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const BedAssignment = () => {
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [bedData, setBedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [patientId, setPatientId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentHospital = hospitals[currentHospitalIndex];

  useEffect(() => {
    const fetchBedData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${currentHospital.url}/beds`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Invalid query parameters");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Received data is not an array");
        }

        setBedData(data);
      } catch (e) {
        console.error("Fetching bed data failed:", e);
        setError(`Failed to fetch bed data: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBedData();
  }, [currentHospitalIndex]);

  const handlePrevHospital = () => {
    setCurrentHospitalIndex((prevIndex) =>
      prevIndex === 0 ? hospitals.length - 1 : prevIndex - 1
    );
  };

  const handleNextHospital = () => {
    setCurrentHospitalIndex((prevIndex) => (prevIndex + 1) % hospitals.length);
  };

  const handleStatusChange = (bedId) => {
    const bed = bedData.find((bed) => bed[0] === bedId);
    setSelectedBed(bed);
    setNewStatus(bed[3]);
    setPatientId(bed[4] || "");
    setIsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const requestBody = {
        bedID: selectedBed[0],
        status: newStatus,
        Pid: newStatus === "Available" ? null : patientId || null,
      };

      console.log("Request body:", JSON.stringify(requestBody));

      const response = await fetch(`${currentHospital.url}/set_bed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Server response:", result);
      const updatedBedData = bedData.map((bed) => {
        if (bed[0] === selectedBed[0]) {
          return [
            bed[0],
            bed[1],
            bed[2],
            newStatus,
            newStatus === "Available" ? null : patientId || null,
          ];
        }
        return bed;
      });
      setBedData(updatedBedData);
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Updating bed status failed:", e);
      setError(`Failed to update bed status: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handlePrevHospital}>← Previous Hospital</Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {currentHospital.name}
        </h1>
        <Button onClick={handleNextHospital}>Next Hospital →</Button>
      </div>

      {isLoading && (
        <div className="text-center text-gray-600">Loading bed data...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bedData.map((bed) => (
            <BedCard
              key={bed[0]}
              bed={bed}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Edit Bed Status</h2>
        <p className="text-gray-600 mb-4">
          Change the status of Bed {selectedBed?.[0]}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            value={newStatus}
            onChange={setNewStatus}
            options={["Available", "Occupied", "Reserved"]}
          />
        </div>
        {newStatus !== "Available" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID
            </label>
            <Input
              value={patientId}
              onChange={setPatientId}
              placeholder="Enter Patient ID"
            />
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsDialogOpen(false)}
            color="gray"
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </Dialog>
    </div>
  );
};

export default BedAssignment;
