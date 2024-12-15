import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CycleList() {
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cycles');
        setCycles(response.data);
      } catch (error) {
        console.error('Error fetching cycles:', error);
      }
    };
    fetchCycles();
  }, []);

  return (
    <div>
      <h1>Cycle List</h1>
      <ul>
        {cycles.map((cycle) => (
          <li key={cycle._id}>
            <Link to={`/cycles/${cycle._id}`}>
              <img src={`http://localhost:5000${cycle.image}`} alt={cycle.title} />
              {cycle.title} - ${cycle.price}
            </Link>
          </li>
        ))}
      </ul>
      <nav>
        <Link to="/admin">Admin Dashboard</Link>
        <Link to="/cart">Cart</Link>
      </nav>
    </div>
  );
}

export default CycleList;
