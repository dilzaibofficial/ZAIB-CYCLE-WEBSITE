import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is installed
import bannerImage from './banner.jpg'; // Import the banner image
import bannerImage2 from './banner2.jpg'; // Import the banner image
import bannerImage3 from './banner3.jpg'; // Import the banner image
import './Home.css'; // Import the CSS file for styling

function Home({ updateCartCount }) {
  const [cycles, setCycles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cyclesPerPage = 9; // 3 rows of 3 cards each

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

  const handleBuy = async (cycleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/cart', { cycleId }, {
        headers: {
          'Authorization': token
        }
      });
      updateCartCount();
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  // Pagination logic
  const indexOfLastCycle = currentPage * cyclesPerPage;
  const indexOfFirstCycle = indexOfLastCycle - cyclesPerPage;
  const currentCycles = cycles.slice(indexOfFirstCycle, indexOfLastCycle);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid p-0">
      <div className="container-fluid p-0">
        <Slider {...settings}>
          <div>
            <img src={bannerImage} className="img-fluid" alt="Banner 1" />
          </div>
          <div>
            <img src={bannerImage2} className="img-fluid" alt="Banner 2" />
          </div>
          <div>
            <img src={bannerImage3} className="img-fluid" alt="Banner 3" />
          </div>
        </Slider>
      </div>
      <div className="container mt-4">
        <div className="row">
          {currentCycles.map(cycle => (
            <div key={cycle._id} className="col-md-4 mb-4">
              <div className="card cycle-card">
                <img src={`http://localhost:5000${cycle.image}`} alt={cycle.title} className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title">{cycle.title}</h5>
                  <p className="card-text">{cycle.details}</p>
                  <p className="card-text"><strong>Price: ${cycle.price}</strong></p>
                  {cycle.addedBy && (
                    <p className="card-text"><small className="text-muted">Added by: {cycle.addedBy.username}</small></p>
                  )}
                  <button className="btn btn-primary" onClick={() => handleBuy(cycle._id)}>Buy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <nav>
          <ul className="pagination justify-content-center">
            {Array.from({ length: Math.ceil(cycles.length / cyclesPerPage) }, (_, index) => (
              <li key={index + 1} className="page-item">
                <a onClick={() => paginate(index + 1)} className="page-link" href="#!">
                  {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Home;
