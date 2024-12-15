import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSwitch = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signin', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing in:', error.response ? error.response.data : error.message);
      setError('Error signing in. Please check your credentials.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/signup', { username, email, password });
      handleSwitch();
    } catch (error) {
      console.error('Error signing up:', error.response ? error.response.data : error.message);
      setError('Error signing up. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        {error && <p className="error-message">{error}</p>}
        {isSignUp ? (
          <form onSubmit={handleSignUp}>
            <h2>Sign Up</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign Up</button>
            <p onClick={handleSwitch}>Already have an account? Sign In</p>
          </form>
        ) : (
          <form onSubmit={handleSignIn}>
            <h2>Sign In</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign In</button>
            <p onClick={handleSwitch}>Don't have an account? Sign Up</p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
