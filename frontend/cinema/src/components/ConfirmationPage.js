import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ConfirmationPage.css';

function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    movie,
    selectedSeats,
    totalPrice,
    selectedLocation,
    selectedDate,
    selectedTime
  } = location.state;

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <h2>Booking Confirmed!</h2>
        <div className="booking-details">
          <div className="movie-poster">
            <img src={movie.vertical_img_url} alt={movie.title} />
          </div>
          
          <div className="booking-info">
            <h3>{movie.title}</h3>
            
            <div className="info-group">
              <p><strong>Cinema:</strong> {selectedLocation}</p>
              <p><strong>Date:</strong> {selectedDate}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Seats:</strong> {selectedSeats.join(', ')}</p>
              <p><strong>Total Price:</strong> RM {totalPrice.toFixed(2)}</p>
            </div>

            <div className="movie-details">
              <p><strong>Duration:</strong> {movie.duration} mins</p>
              <p><strong>Language:</strong> {movie.language.join(', ')}</p>
              <p><strong>Subtitles:</strong> {movie.subtitles.join(', ')}</p>
            </div>
          </div>
        </div>

        <button className="home-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ConfirmationPage;