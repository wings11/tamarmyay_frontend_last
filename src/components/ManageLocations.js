import React, { useState, useEffect } from "react";
import axios from "axios";

function ManageLocations({ token, mode, onComplete }) {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [editLocationId, setEditLocationId] = useState(null);
  const [editBuildingName, setEditBuildingName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          "https://tamarmyaybackend-last.onrender.com/api/locations",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLocations(res.data);
      } catch (err) {
        console.error(
          "Error fetching locations:",
          err.response?.data || err.message
        );
        setError("Failed to load locations");
      }
    };
    fetchLocations();
  }, [token]);

  const resetForm = () => {
    setNewLocation("");
    setEditLocationId(null);
    setEditBuildingName("");
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    resetForm();
    onComplete(); // Close modal
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        "https://tamarmyaybackend-last.onrender.com/api/locations",
        { buildingName: newLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations([...locations, res.data]);
      setSuccess("Location added successfully!");
      resetForm();
      onComplete(); // Close modal
    } catch (err) {
      console.error(
        "Error adding location:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to add location");
    }
  };

  const handleEditLocation = (location) => {
    setEditLocationId(location.id);
    setEditBuildingName(location.buildingName);
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(
        `https://tamarmyaybackend-last.onrender.com/api/locations/${editLocationId}`,
        { buildingName: editBuildingName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === editLocationId
            ? { ...loc, buildingName: res.data.buildingName }
            : loc
        )
      );
      setSuccess("Location updated successfully!");
      resetForm();
      onComplete(); // Close modal
    } catch (err) {
      console.error(
        "Error updating location:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to update location");
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(
        `https://tamarmyaybackend-last.onrender.com/api/locations/${locationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      setSuccess("Location deleted successfully!");
      resetForm();
      onComplete(); // Close modal
    } catch (err) {
      console.error(
        "Error deleting location:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Failed to delete location");
    }
  };

  return (
    <div className="p-4">
      {/* <h2 className="text-2xl font-bold mb-4">
        {mode === "add" && "Add Location"}
        {mode === "edit" && "Edit Location"}
        {mode === "delete" && "Delete Location"}
      </h2> */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Add Location Form */}
      {mode === "add" && (
        <form onSubmit={handleAddLocation} className="space-y-4 ">
          <div className="flex flex-row justify-between">
            <label className="block font-medium flex items-center h-[51px]">
              Building Name:
            </label>
            <input
              type="text"
              placeholder="Building Name"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              required
              className="w-full p-2 border rounded w-[418px] h-[51px]"
            />
          </div>
          <div className="flex flex-col items-center gap-4   ">
            <button
              type="submit"
              className="px-4 py-2 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
            >
              Add Location
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit Location Form */}
      {mode === "edit" && (
        <>
          {editLocationId ? (
            <form onSubmit={handleUpdateLocation} className="space-y-4 ">
              <div className="flex flex-row justify-between">
                <label className="block font-medium flex items-center h-[51px]">
                  Building Name:
                </label>
                <input
                  type="text"
                  value={editBuildingName}
                  onChange={(e) => setEditBuildingName(e.target.value)}
                  required
                  className="w-full p-2 border rounded w-[418px] h-[51px]"
                />
              </div>
              <div className="flex flex-col items-center gap-4    ">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
                >
                  Update Location
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="mb-4">
              Select a location to edit from the table below.
            </p>
          )}
        </>
      )}

      {/* Locations Table */}
      {(mode === "edit" || mode === "delete") && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FFFCF1]">
              <th className="p-2 border">Building Name</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border">
                <td className="p-2">{loc.buildingName}</td>
                <td className="p-2 flex gap-2 ">
                  {mode === "edit" && (
                    <button
                      onClick={() => handleEditLocation(loc)}
                      className="px-2 py-1 bg-[#DCC99B]/50 text-black rounded hover:bg-[#DCC99B]/80"
                    >
                      Edit
                    </button>
                  )}
                  {mode === "delete" && (
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageLocations;
