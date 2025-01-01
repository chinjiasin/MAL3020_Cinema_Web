import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [movies, setMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;

    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [movies, currentSlide]);


  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/movies');
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const nextSlide = () => {
    if (isSliding) return;
    
    setIsSliding(true);
    setCurrentSlide(current => (current + 1) % movies.length);
    
    setTimeout(() => {
      setIsSliding(false);
    }, 500); // Match this with CSS transition duration
  };

  const prevSlide = () => {
    if (isSliding) return;
    
    setIsSliding(true);
    setCurrentSlide(current => 
      current === 0 ? movies.length - 1 : current - 1
    );
    
    setTimeout(() => {
      setIsSliding(false);
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMovieClick = (movieId) =>{
    console.log('Clicking movie with ID', movieId);
    navigate(`/booking/${movieId}`);
  }

  return (
    <div className="main-container">
      <header>
        <nav>
          <ul>
            <li><a href="/home" className="active">Home</a></li>
            <li><a href="/history">History</a></li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </ul>
        </nav>
      </header>

      <div className="slider-section">
        <div className="slider-container">
          {movies.map((movie, index) => (
            <div 
              key={movie._id} 
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentSlide) * 100}%)`,
                zIndex: index === currentSlide ? 1 : 0
              }}
            >
              <img src={movie.horizontal_img_url} alt={movie.title} border="0"/>
            </div>
          ))}
          <button className="slider-button prev" onClick={prevSlide}>&lt;</button>
          <button className="slider-button next" onClick={nextSlide}>&gt;</button>
          
          <div className="slider-dots">
            {movies.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => {
                  if (!isSliding) {
                    setIsSliding(true);
                    setCurrentSlide(index);
                    setTimeout(() => setIsSliding(false), 500);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="movies-grid">
        {movies.map(movie => (
          <div key={movie._id} className="movie-card" onClick={() => handleMovieClick(movie._id)}>
            <div className="movie-image">
            <img src={movie.vertical_img_url} alt={movie.title} border="0"/>
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.genre}</p>
              <p>{movie.duration} mins</p>
              <p>{movie.language}</p>
            </div>
          </div>
        ))}
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

export default Home;