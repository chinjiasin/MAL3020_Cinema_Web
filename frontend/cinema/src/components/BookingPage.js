import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BookingPage.css';

function BookingPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [locations, setLocations] = useState([]); // Added locations state
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);

  useEffect(() => {
    console.log('MovieId', movieId);
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/movies`);
      const data = await response.json();
      const movieData = data.find(m => m._id === movieId);
      setMovie(movieData);
      
      if (movieData) {
        // Get unique locations from the movie data
        const uniqueLocations = [...new Set(movieData.showtimes.map(st => st.cinema.name))];
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const fetchScreenings = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/screenings');
      const data = await response.json();
      const movieScreenings = data.filter(s => s.movie_id === movieId);
      setScreenings(movieScreenings);
    } catch (error) {
      console.error('Error fetching screenings:', error);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedScreening(null);
    
    if (movie) {
        const dates = [...new Set(
          movie.showtimes
            .filter(st => st.cinema.name === location)
            .map(st => st.date)
        )];
        setAvailableDates(dates);
      }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedScreening(null);
    
    if (movie) {
        const showtime = movie.showtimes.find(
          st => st.cinema.name === selectedLocation && st.date === date
        );
        setAvailableTimes(showtime ? showtime.times : []);
      }
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    const screening = screenings.find(s => 
      s.cinema_name === selectedLocation && 
      s.date === selectedDate && 
      s.time === time
    );
    setSelectedScreening(screening);
  };

  const handleProceedToSeats = () => {
    if (selectedScreening) {
      navigate(`/seats/${movieId}`, {
        state: {
          screening: selectedScreening,
          movie: movie
        }
      });
    }
  };

  if (!movie) return <div className='loading'>Loading...</div>;

  return (
    <div className="booking-page">
      <div className="booking-poster">
        <img src={movie.vertical_img_url} alt={movie.title} />
      </div>
      
      <div className="movie-details">
        <h1>{movie.title}</h1>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Genre:</span>
            <span>{movie.genre.join(', ')}</span>
          </div>
          <div className="detail-item">
            <span className="label">Duration:</span>
            <span>{movie.duration} mins</span>
          </div>
          <div className="detail-item">
            <span className="label">Language:</span>
            <span>{movie.language.join(', ')}</span>
          </div>
          <div className="detail-item">
            <span className="label">Subtitles:</span>
            <span>{movie.subtitles.join(', ')}</span>
          </div>
          <div className="detail-item">
            <span className="label">Format:</span>
            <span>{movie.formats.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="booking-section">
        <div className="booking-options">
          <div className="option-group">
            <h3>Select Location</h3>
            <div className="options-container">
              {locations.map(location => (
                <button
                  key={location}
                  className={`option-button ${selectedLocation === location ? 'selected' : ''}`}
                  onClick={() => handleLocationChange(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {selectedLocation && (
            <div className="option-group">
              <h3>Select Date</h3>
              <div className="options-container">
                {availableDates.map(date => (
                  <button
                    key={date}
                    className={`option-button ${selectedDate === date ? 'selected' : ''}`}
                    onClick={() => handleDateChange(date)}
                  >
                    {new Date(date).toLocaleDateString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && (
            <div className="option-group">
              <h3>Select Time</h3>
              <div className="options-container">
                {availableTimes.map(time => (
                  <button
                    key={time}
                    className={`option-button ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => handleTimeChange(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className={`proceed-button ${!selectedScreening ? 'disabled' : ''}`}
            onClick={handleProceedToSeats}
            disabled={!selectedScreening}
          >
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;