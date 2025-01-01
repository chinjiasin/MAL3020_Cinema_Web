import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import BookingPage from './components/BookingPage';
import SeatsPage from './components/SeatsPage';
import ConfirmationPage from './components/ConfirmationPage';
import History from './components/History';
import HistoryDetail from './components/HistoryDetail';
import SignUp from './components/SignUp';
// import SeatsPage from './components/SeatPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/home" 
          element={
            localStorage.getItem('user') ? <Home /> : <Navigate to="/login" />
          } 
        />
         <Route path="/booking/:movieId" element={<BookingPage />} />
         <Route path="/seats/:movieId" element={<SeatsPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/history" element={<History/>}/>
        <Route path="/history/:id" element={<HistoryDetail/>}/>
        <Route path='signup' element={<SignUp/>}/>
         {/* <Route path="/seats/:movieId" element={<SeatsPage />} /> */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;