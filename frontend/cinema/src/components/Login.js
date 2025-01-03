import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        Email: email,
        Password: password
      });

      if (response.status === 200) {
        console.log(response);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Cinema Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#fff' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleSignUp}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffcc00',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '1rem',
              padding: 0,
            }}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;