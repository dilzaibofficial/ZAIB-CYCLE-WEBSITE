import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': token
        }
      });
      setCartItems(response.data.cycles);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const handleQuantityChange = async (cycleId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/cart', { cycleId, quantity }, {
        headers: {
          'Authorization': token
        }
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const handleRemove = async (cycleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/cart', { cycleId, quantity: 0 }, {
        headers: {
          'Authorization': token
        }
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const handleProceed = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleCardDetailsSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/slips', {
        cardDetails,
        cartItems
      }, {
        headers: {
          'Authorization': token
        }
      });
      alert('Successful shopping! Your slip has been downloaded.');
      const link = document.createElement('a');
      link.href = `http://localhost:5000${response.data.slipUrl}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const total = cartItems.reduce((total, item) => total + (item.cycle ? item.cycle.price * item.quantity : 0), 0);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Cart</h1>
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <ul className="list-group mb-4">
            {cartItems.map((item) => (
              item.cycle && (
                <li key={item.cycle._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{item.cycle.title} - ${item.cycle.price}</span>
                  <div>
                    <button className="btn btn-secondary btn-sm mr-2" onClick={() => handleQuantityChange(item.cycle._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="btn btn-secondary btn-sm ml-2" onClick={() => handleQuantityChange(item.cycle._id, item.quantity + 1)}>+</button>
                    <button className="btn btn-danger btn-sm ml-2" onClick={() => handleRemove(item.cycle._id)}>Remove</button>
                  </div>
                </li>
              )
            ))}
          </ul>
          <div className="text-right">
            <h4>Total: ${total}</h4>
            <Button variant="primary" onClick={handleProceed}>Proceed</Button>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Card Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCardDetailsSubmit}>
            <Form.Group controlId="formCardName">
              <Form.Label>Card Name</Form.Label>
              <Form.Control
                type="text"
                name="cardName"
                value={cardDetails.cardName}
                onChange={handleCardDetailsChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCardNumber">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardDetailsChange}
                required
                pattern="\d{13}"
                title="Card number must be 13 digits"
              />
            </Form.Group>
            <Form.Group controlId="formExpDate">
              <Form.Label>Expiration Date (MM/YY)</Form.Label>
              <Form.Control
                type="text"
                name="expDate"
                value={cardDetails.expDate}
                onChange={handleCardDetailsChange}
                required
                pattern="\d{2}/\d{2}"
                title="Expiration date must be in MM/YY format"
              />
            </Form.Group>
            <Form.Group controlId="formCvv">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="text"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleCardDetailsChange}
                required
                pattern="\d{3}"
                title="CVV must be 3 digits"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Cart;
