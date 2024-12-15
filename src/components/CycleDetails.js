import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function CycleDetails() {
  const { id } = useParams();
  const [cycle, setCycle] = useState(null);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cycles/${id}`);
        setCycle(response.data);
      } catch (error) {
        console.error('Error fetching cycle details:', error);
      }
    };
    fetchCycle();
  }, [id]);

  const addToCart = () => {
    // Logic to add cycle to cart
    console.log(`Added Cycle ${id} to cart`);
  };

  if (!cycle) return <div>Loading...</div>;

  return (
    <div>
      <h1>{cycle.title}</h1>
      <img src={`http://localhost:5000${cycle.image}`} alt={cycle.title} />
      <p>{cycle.details}</p>
      <p>${cycle.price}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
}

export default CycleDetails;
