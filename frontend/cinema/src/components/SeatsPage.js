import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SeatsPage.css';

function SeatsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { screening, movie } = location.state;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const isPremium = seat.startsWith('D') || seat.startsWith('E') || 
                       seat.startsWith('F') || seat.startsWith('G') || 
                       seat.startsWith('H');
      return total + (isPremium ? screening.price.premium : screening.price.standard);
    }, 0);
    setTotalPrice(price);
  };

  const createBooking = async (userData) => {
    try {
      const bookingData = {
        user: {
          id: userData.id,
          Name: userData.Name,
          MobileNo: userData.MobileNo,
          Email: userData.Email
        },
        movie: {
          _id: movie._id,
          title: movie.title,
          date: screening.date,
          showtime: screening.time,
          cinema: {
            name: screening.cinema_name,
            location: screening.location
          }
        },
        seats: selectedSeats,
        total_price: totalPrice,
      };

      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Booking creation failed: ${error.message}`);
    }
  };

  const updateScreening = async () => {
    try {
      const updatedScreening = {
        ...screening,
        booked_seats: [...screening.booked_seats, ...selectedSeats]
      };

      const response = await fetch(`http://localhost:3000/api/screenings/${screening._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedScreening),
      });

      if (!response.ok) {
        throw new Error('Failed to update screening');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Screening update failed: ${error.message}`);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Get user from localStorage
      const userBasic = JSON.parse(localStorage.getItem('user'));
      if (!userBasic) {
        throw new Error('User not found in session');
      }

      // Fetch complete user details
      const userResponse = await fetch(`http://localhost:3000/api/users/${userBasic.id}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }
      const userData = await userResponse.json();

      // Create booking
      await createBooking(userData);

      // Update screening seats
      await updateScreening();

      // Navigate to confirmation page
      navigate('/confirmation', {
        state: {
          movie,
          screening,
          selectedSeats,
          totalPrice,
          selectedLocation: screening.cinema_name,
          selectedDate: screening.date,
          selectedTime: screening.time
        }
      });
    } catch (error) {
      setError(error.message);
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
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
        {error && <div className="error-message">{error}</div>}
        <div className="price-info">
          <p>Selected Seats: {selectedSeats.join(', ')}</p>
          <p>Total Price: RM {totalPrice.toFixed(2)}</p>
        </div>
        <button 
          className={`confirm-button ${selectedSeats.length === 0 || isLoading ? 'disabled' : ''}`}
          onClick={handleConfirmBooking}
          disabled={selectedSeats.length === 0 || isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

export default SeatsPage;