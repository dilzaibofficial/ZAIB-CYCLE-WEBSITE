import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Wallet() {
  const [slips, setSlips] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const slipsPerPage = 4; // 2 rows of 2 cards each

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/slips', {
          headers: {
            'Authorization': token
          }
        });
        setSlips(response.data);
      } catch (error) {
        console.error('Error fetching slips:', error);
      }
    };

    fetchSlips();
  }, []);

  // Pagination logic
  const indexOfLastSlip = currentPage * slipsPerPage;
  const indexOfFirstSlip = indexOfLastSlip - slipsPerPage;
  const currentSlips = slips.slice(indexOfFirstSlip, indexOfLastSlip);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Wallet</h1>
      <div className="row">
        {currentSlips.map((slip) => (
          <div key={slip._id} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Slip ID: {slip._id}</h5>
                <p className="card-text">Date: {new Date(slip.date).toLocaleDateString()}</p>
                <h6 className="card-subtitle mb-2 text-muted">Items:</h6>
                <ul className="list-group list-group-flush">
                  {slip.items.map((item, index) => (
                    <li key={index} className="list-group-item">{item.title} - ${item.price} x {item.quantity}</li>
                  ))}
                </ul>
                <h6 className="card-text mt-2">Total: ${slip.total}</h6>
                <a href={`http://localhost:5000/uploads/${slip.file}`} target="_blank" rel="noopener noreferrer" className="card-link">View Slip</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: Math.ceil(slips.length / slipsPerPage) }, (_, index) => (
            <li key={index + 1} className="page-item">
              <a onClick={() => paginate(index + 1)} className="page-link" href="#!">
                {index + 1}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Wallet;
