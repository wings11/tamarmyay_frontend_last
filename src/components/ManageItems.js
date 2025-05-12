import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddFoodItem({ token }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('https://tamarmyaybackend-last.onrender.com/api/items/categories');
        setCategories(res.data);
        setCategory(res.data[0] || ''); // Set default category
      } catch (err) {
        console.error('Error fetching categories:', err.response?.data || err.message);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(
        'https://tamarmyaybackend-last.onrender.com/api/items',
        { name, category, price: parseFloat(price), description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Food item added successfully!');
      setName('');
      setCategory(categories[0] || '');
      setPrice('');
      setDescription('');
    } catch (err) {
      console.error('Error adding food item:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add food item');
    }
  };

  return (
    <div>
      <h2>Add Food Item</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Add Food Item</button>
      </form>
    </div>
  );
}

export default AddFoodItem;