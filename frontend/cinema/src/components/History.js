import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/History.css';

function History() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/bookings');
      const data = await response.json();
      // Filter bookings for current user
      const userBookings = data.filter(booking => booking.user.id === user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBookingClick = (bookingId) => {
    navigate(`/history/${bookingId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="main-container">
      <header>
        <nav>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/history" className="active">History</a></li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </ul>
        </nav>
      </header>

      <div className="history-container">
        <h1>Booking History</h1>
        <div className="bookings-list">
          {bookings.map(booking => (
            <div 
              key={booking._id} 
              className="booking-card"
              onClick={() => handleBookingClick(booking._id)}
            >
              <div className="booking-header">
                <h2>{booking.movie.title}</h2>
                <span className={`status ${booking.booking_status.toLowerCase()}`}>
                  {booking.booking_status}
                </span>
              </div>
              <div className="booking-info">
                <p><strong>Booking ID:</strong> {booking.booking_id}</p>
                <p><strong>Date:</strong> {formatDate(booking.movie.date)}</p>
                <p><strong>Time:</strong> {booking.movie.showtime}</p>
                <p><strong>Cinema:</strong> {booking.movie.cinema.name}</p>
                <p><strong>Total Price:</strong> RM {booking.total_price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/history">History</a></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}

export default History;