import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/HistoryDetail.css';

function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/bookings');
      const data = await response.json();
      const bookingDetail = data.find(b => b._id === id && b.user.id === user.id);
      
      if (!bookingDetail) {
        navigate('/history');
        return;
      }
      
      setBooking(bookingDetail);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!booking) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="main-container">
      <header>
        <nav>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/history">History</a></li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </ul>
        </nav>
      </header>

      <div className="detail-container">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/history')}>
            ← Back to History
          </button>
          <h1>Booking Details</h1>
        </div>

        <div className="detail-card">
          <div className="detail-section">
            <h2>Movie Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Movie Title</label>
                <p>{booking.movie.title}</p>
              </div>
              <div className="detail-item">
                <label>Show Date</label>
                <p>{formatDate(booking.movie.date)}</p>
              </div>
              <div className="detail-item">
                <label>Show Time</label>
                <p>{booking.movie.showtime}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Booking Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Booking ID</label>
                <p>{booking.booking_id}</p>
              </div>
              <div className="detail-item">
                <label>Booking Date</label>
                <p>{formatDate(booking.booking_date)}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p className={`status ${booking.booking_status.toLowerCase()}`}>
                  {booking.booking_status}
                </p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Cinema Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Cinema</label>
                <p>{booking.movie.cinema.name}</p>
              </div>
              <div className="detail-item">
                <label>Location</label>
                <p>{booking.movie.cinema.location || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>Seat Information</h2>
            <div className="seats-container">
              {booking.seats.map((seat, index) => (
                <span key={index} className="seat-tag">{seat}</span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h2>Payment Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Total Amount</label>
                <p className="price">RM {booking.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <nav>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/history">History</a></li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}

export default HistoryDetail;