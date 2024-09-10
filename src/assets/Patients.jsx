import React, { useState, useEffect } from "react";

const hospitals = [
  { name: "Bhardwaj Hospital", url: "http://localhost:5000" },
  { name: "Balaji Soni Hospital", url: "http://vedicvarma.com:5000" },
  { name: "Agrawal Hospital", url: "http://192.168.205.1:5000" },
];

const HospitalPatientsDisplay = () => {
  const [hospitalData, setHospitalData] = useState([]);
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    Name: "",
    Phone: "",
    Age: "",
    Sex: "",
    needsBed: false,
  });
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    fetchAllHospitalData();
  }, []);

  const fetchAllHospitalData = async () => {
    try {
      const allData = await Promise.all(
        hospitals.map(async (hospital) => {
          const response = await fetch(`${hospital.url}/patients`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return { ...hospital, patients: data };
        })
      );
      setHospitalData(allData);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching hospital data:", e);
      setError(e.message);
      setLoading(false);
    }
  };

  const fetchAvailableBeds = async () => {
    try {
      const response = await fetch(
        `${hospitals[currentHospitalIndex].url}/beds`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const availableBeds = data.filter((bed) => bed[3] === "Available");
      setAvailableBeds(availableBeds);
    } catch (e) {
      console.error("Error fetching available beds:", e);
      setError(e.message);
    }
  };

  const handlePrevious = () => {
    setCurrentHospitalIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : hospitals.length - 1
    );
  };

  const handleNext = () => {
    setCurrentHospitalIndex((prevIndex) =>
      prevIndex < hospitals.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handleOpenAddPatientDialog = () => {
    setIsAddPatientDialogOpen(true);
    fetchAvailableBeds();
  };

  const handleCloseAddPatientDialog = () => {
    setIsAddPatientDialogOpen(false);
    setNewPatient({ Name: "", Phone: "", Age: "", Sex: "", needsBed: false });
    setSelectedBed(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "needsBed" && !checked) {
      setSelectedBed(null);
    }
  };

  const handleAddPatient = async () => {
    try {
      const response = await fetch(
        `${hospitals[currentHospitalIndex].url}/add_patient`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPatient),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const patientData = await response.json();

      if (newPatient.needsBed && selectedBed) {
        await assignBed(patientData[0], selectedBed[0]);
      }

      handleCloseAddPatientDialog();
      fetchAllHospitalData();
    } catch (e) {
      console.error("Error adding patient:", e);
      setError(e.message);
    }
  };

  const assignBed = async (patientId, bedId) => {
    try {
      const response = await fetch(
        `${hospitals[currentHospitalIndex].url}/set_bed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Occupied",
            Pid: patientId,
            bedID: bedId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (e) {
      console.error("Error assigning bed:", e);
      setError(e.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (hospitalData.length === 0) {
    return <div>No hospital data available.</div>;
  }

  const currentHospital = hospitalData[currentHospitalIndex];

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevious}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          ← Previous
        </button>
        <h1 className="text-2xl font-bold">{currentHospital.name} Patients</h1>
        <button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Next →
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={handleOpenAddPatientDialog}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Patient
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2">Patient ID</th>
            <th className="border border-gray-400 px-4 py-2">Name</th>
            <th className="border border-gray-400 px-4 py-2">Phone</th>
            <th className="border border-gray-400 px-4 py-2">Age</th>
            <th className="border border-gray-400 px-4 py-2">Sex</th>
          </tr>
        </thead>
        <tbody>
          {currentHospital.patients.map((patient) => (
            <tr key={patient[0]}>
              <td className="border border-gray-400 px-4 py-2">{patient[0]}</td>
              <td className="border border-gray-400 px-4 py-2">{patient[1]}</td>
              <td className="border border-gray-400 px-4 py-2">{patient[2]}</td>
              <td className="border border-gray-400 px-4 py-2">{patient[3]}</td>
              <td className="border border-gray-400 px-4 py-2">{patient[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddPatientDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Patient</h2>
            <div className="mb-4">
              <label className="block mb-1">Name</label>
              <input
                name="Name"
                type="text"
                value={newPatient.Name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Phone</label>
              <input
                name="Phone"
                type="text"
                value={newPatient.Phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Age</label>
              <input
                name="Age"
                type="number"
                value={newPatient.Age}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Sex</label>
              <input
                name="Sex"
                type="text"
                value={newPatient.Sex}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  name="needsBed"
                  type="checkbox"
                  checked={newPatient.needsBed}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Needs Bed
              </label>
            </div>
            {newPatient.needsBed && (
              <div className="mb-4">
                <label className="block mb-1">Select Bed</label>
                <select
                  value={selectedBed ? selectedBed[0] : ""}
                  onChange={(e) =>
                    setSelectedBed(
                      availableBeds.find(
                        (bed) => bed[0] === parseInt(e.target.value)
                      )
                    )
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select a bed</option>
                  {availableBeds.map((bed) => (
                    <option key={bed[0]} value={bed[0]}>
                      Bed {bed[0]} - {bed[1]} - {bed[2]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleCloseAddPatientDialog}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalPatientsDisplay;
