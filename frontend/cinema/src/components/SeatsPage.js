import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SeatsPage.css';

function SeatsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { screening, movie } = location.state;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleSeatClick = (seat) => {
    if (screening.booked_seats.includes(seat) || screening.blocked_seats?.includes(seat)) {
      return;
    }

    const newSelectedSeats = selectedSeats.includes(seat)
      ? selectedSeats.filter(s => s !== seat)
      : [...selectedSeats, seat];
    
    setSelectedSeats(newSelectedSeats);
    calculateTotalPrice(newSelectedSeats);
  };

  const calculateTotalPrice = (seats) => {
    const price = seats.reduce((total, seat) => {
      // Check if seat is premium or standard
      const isPremium = seat.startsWith('D') || seat.startsWith('E') || 
                       seat.startsWith('F') || seat.startsWith('G') || 
                       seat.startsWith('H');
      return total + (isPremium ? screening.price.premium : screening.price.standard);
    }, 0);
    setTotalPrice(price);
  };

  const handleConfirmBooking = () => {
    if (selectedSeats.length === 0) return;

    navigate('/confirmation', {
      state: {
        movie,
        screening,
        selectedSeats,
        totalPrice
      }
    });
  };

  return (
    <div className="seats-page">
      <div className="screen-container">
        <div className="screen">Screen</div>
      </div>

      <div className="seats-container">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(row => (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>
            {Array.from({ length: 12 }, (_, i) => {
              const seatNumber = `${row}${i + 1}`;
              const isBooked = screening.booked_seats.includes(seatNumber);
              const isBlocked = screening.blocked_seats?.includes(seatNumber);
              const isSelected = selectedSeats.includes(seatNumber);
              
              return (
                <div
                  key={seatNumber}
                  className={`seat ${isBooked || isBlocked ? 'booked' : ''} 
                            ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSeatClick(seatNumber)}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="booking-summary">
        <div className="price-info">
          <p>Selected Seats: {selectedSeats.join(', ')}</p>
          <p>Total Price: RM {totalPrice.toFixed(2)}</p>
        </div>
        <button 
          className={`confirm-button ${selectedSeats.length === 0 ? 'disabled' : ''}`}
          onClick={handleConfirmBooking}
          disabled={selectedSeats.length === 0}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}

export default SeatsPage;