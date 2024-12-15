import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminDashboard() {
  const [cycles, setCycles] = useState([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState('');
  const [editCycleId, setEditCycleId] = useState(null);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/cycles', {
          headers: {
            'Authorization': token
          }
        });
        setCycles(response.data);
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserId(decodedToken.userId);
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
      if (editCycleId) {
        await axios.put(`http://localhost:5000/api/cycles/${editCycleId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token
          }
        });
        setCycles(cycles.map(cycle => cycle._id === editCycleId ? { ...cycle, title, details, price, image: URL.createObjectURL(image) } : cycle));
        setEditCycleId(null);
      } else {
        const response = await axios.post('http://localhost:5000/api/cycles', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token
          }
        });
        setCycles([...cycles, response.data]);
      }
      setTitle('');
      setDetails('');
      setPrice('');
      setImage(null);
    } catch (error) {
      console.error('Error adding/updating cycle:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cycles/${id}`, {
        headers: {
          'Authorization': token
        }
      });
      setCycles(cycles.filter(cycle => cycle._id !== id));
    } catch (error) {
      console.error('Error deleting cycle:', error);
    }
  };

  const handleEdit = (cycle) => {
    setTitle(cycle.title);
    setDetails(cycle.details);
    setPrice(cycle.price);
    setEditCycleId(cycle._id);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Admin Dashboard</h1>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2>{editCycleId ? 'Update Cycle' : 'Add New Cycle'}</h2>
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
                required={!editCycleId}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">{editCycleId ? 'Update Cycle' : 'Add Cycle'}</button>
          </form>
        </div>
      </div>
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <h2>Cycle List</h2>
          <ul className="list-group">
            {cycles.filter(cycle => cycle.addedBy && cycle.addedBy._id === userId).map(cycle => (
              <li key={cycle._id} className="list-group-item">
                <h5>{cycle.title}</h5>
                <p>{cycle.details}</p>
                <p>Price: ${cycle.price}</p>
                {cycle.addedBy && (
                  <p><small>Added by: {cycle.addedBy.username}</small></p>
                )}
                <img src={`http://localhost:5000${cycle.image}`} alt={cycle.title} className="img-fluid" />
                <button className="btn btn-danger mt-2" onClick={() => handleDelete(cycle._id)}>Delete</button>
                <button className="btn btn-secondary mt-2 ml-2" onClick={() => handleEdit(cycle)}>Update</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
