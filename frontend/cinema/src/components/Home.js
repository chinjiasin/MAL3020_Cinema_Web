import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h1>Welcome, {user.Name}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;