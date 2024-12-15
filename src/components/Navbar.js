import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Update the path to the correct location
import { FaShoppingCart, FaSignInAlt, FaUser, FaPowerOff } from 'react-icons/fa'; // Import the necessary icons
import logoImage from './zaibLogo.png'; // Import the logo image

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsLoggedIn(true);
      setUsername(username);
      console.log('User is logged in:', username);
      fetchCartCount(token);
    } else {
      console.log('User is not logged in');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCartCount();
    }, 5000); // Update cart count every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchCartCount = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      setCartCount(data.cycles.reduce((count, item) => count + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const updateCartCount = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchCartCount(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    console.log('User logged out');
    navigate('/'); // Redirect to home page on logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">Home</Link>
        {isLoggedIn && <Link to="/admin" className="navbar-link">Dashboard</Link>} {/* Add Dashboard link next to Home */}
        <Link to="/about" className="navbar-link">About</Link>
        {isLoggedIn && <Link to="/wallet" className="navbar-link">Wallet</Link>} {/* Add Wallet link */}
      </div>
      <div className="navbar-center">
        <img src={logoImage} alt="Logo" className="navbar-logo" /> {/* Add logo image */}
      </div>
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="navbar-user">
            <FaUser className="navbar-user-icon" />
            <span className="navbar-username">{username}</span>
            <FaPowerOff className="navbar-logout-icon" onClick={handleLogout} /> {/* Replace button with icon */}
          </div>
        ) : (
          <FaSignInAlt className="navbar-login-icon" onClick={() => navigate('/login')} /> // Replace button with icon
        )}
        <Link to="/cart" className="navbar-cart">
          <FaShoppingCart />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
