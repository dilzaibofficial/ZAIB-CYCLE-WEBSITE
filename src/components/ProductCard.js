import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ cycle }) {
  return (
    <div className="product-card">
      <img src={`http://localhost:5000${cycle.image}`} alt={cycle.title} />
      <h3>{cycle.title}</h3>
      <p>${cycle.price}</p>
      <Link to={`/cycles/${cycle._id}`}>View Details</Link>
    </div>
  );
}

export default ProductCard;
