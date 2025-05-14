import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageLocations({ token }) {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('https://tamarmyaybackend-last.onrender.com/api/locations');
        setLocations(res.data);
      } catch (err) {
        console.error('Error fetching locations:', err.response?.data || err.message);
        setError('Failed to load locations');
      }
    };
    fetchLocations();
  }, []);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://tamarmyaybackend-last.onrender.com/api/locations', { buildingName: newLocation }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocations([...locations, res.data]);
      setNewLocation('');
    } catch (err) {
      console.error('Error adding location:', err.response?.data || err.message);
      setError('Failed to add location');
    }
  };

  return (
    <div>
      <h2>Manage Locations</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleAddLocation}>
        <input
          type="text"
          placeholder="Building Name"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          required
        />
        <button type="submit">Add Location</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Building Name</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(loc => (
            <tr key={loc.id}>
              <td>{loc.buildingName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageLocations;