import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './components/Home.css'; // Ensure Home.css is correctly imported
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import CycleDetails from './components/CycleDetails';
import Cart from './components/Cart';
import Login from './components/Login';
import Wallet from './components/Wallet'; // Import Wallet component
import Footer from './components/Footer'; // Import Footer component
import ProtectedRoute from './components/ProtectedRoute'; // Add import for ProtectedRoute component
import About from './components/About'; // Import About component

function App() {
  const updateCartCount = () => {
    // Function to update cart count
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content"> {/* Wrap main content */}
          <Routes>
            <Route path="/admin" element={<ProtectedRoute element={AdminDashboard} />} /> {/* Use ProtectedRoute for AdminDashboard */}
            <Route path="/cycles/:id" element={<CycleDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/wallet" element={<Wallet />} /> {/* Add Wallet route */}
            <Route path="/about" element={<About />} /> {/* Add About route */}
            <Route path="/" element={<Home updateCartCount={updateCartCount} />} />
          </Routes>
        </div>
        <Footer /> {/* Add Footer component */}
      </div>
    </Router>
  );
}

export default App;
