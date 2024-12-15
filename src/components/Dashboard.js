import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
  const [cycles, setCycles] = useState([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('details', details);
    formData.append('price', price);
    formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/cycles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      });
      setCycles([...cycles, response.data]);
      setTitle('');
      setDetails('');
      setPrice('');
      setImage(null);
    } catch (error) {
      console.error('Error adding cycle:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Dashboard</h1>
      <div className="row">
        <div className="col-md-6">
          <h2>Add New Cycle</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="details">Details</label>
              <textarea
                className="form-control"
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                className="form-control"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Image</label>
              <input
                type="file"
                className="form-control-file"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">Add Cycle</button>
          </form>
        </div>
        <div className="col-md-6">
          <h2>Cycle List</h2>
          <ul className="list-group">
            {cycles.map(cycle => (
              <li key={cycle._id} className="list-group-item">
                <h5>{cycle.title}</h5>
                <p>{cycle.details}</p>
                <p>Price: ${cycle.price}</p>
                {cycle.addedBy && (
                  <p><small>Added by: {cycle.addedBy.username}</small></p>
                )}
                <img src={`http://localhost:5000${cycle.image}`} alt={cycle.title} className="img-fluid" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
