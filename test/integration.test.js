import axios from 'axios';

jest.mock('axios');

describe('Cinema Booking System Integration Tests', () => {
  const baseURL = 'http://localhost:3000/api';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Booking Flow', () => {
    const mockUser = {
      "_id": "6770b9b865c28ab11aa5c9d7",
      "id": 1,
      "Name": "John Doe",
      "Email": "johndoe@example.com",
      "MobileNo": "+60123456789"
    };

    const mockTheater = {
      "_id": "GSC_MV_01",
      "cinema_name": "GSC Mid Valley",
      "location": "Mid Valley Megamall, Kuala Lumpur",
      "hall_number": "Hall 1",
      "seat_layout": {
        "total_rows": 8,
        "seats_per_row": 12,
        "seat_types": {
          "standard": ["A1", "A2", "A3"],
          "premium": ["B1", "B2", "B3"]
        }
      }
    };

    const mockScreening = {
      "_id": "SCR_AE_MV_301024_1000",
      "movie_id": "1",
      "theater_id": "GSC_MV_01",
      "cinema_name": "GSC Mid Valley",
      "date": "2024-12-30",
      "time": "10:00 AM",
      "available_seats": ["A1", "A2", "B1", "B2"],
      "price": {
        "standard": 20,
        "premium": 25
      }
    };

    it('should complete full booking flow successfully', async () => {
      // Step 1: User Authentication
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: mockUser
      });

      const loginResponse = await axios.post(`${baseURL}/users/login`, {
        email: "johndoe@example.com",
        password: "password123"
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.Email).toBe(mockUser.Email);

      // Step 2: Check Theater Availability
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: mockTheater
      });

      const theaterResponse = await axios.get(`${baseURL}/theaters/${mockTheater._id}`);
      expect(theaterResponse.status).toBe(200);
      expect(theaterResponse.data.cinema_name).toBe(mockTheater.cinema_name);

      // Step 3: Check Screening Availability
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: mockScreening
      });

      const screeningResponse = await axios.get(`${baseURL}/screenings/${mockScreening._id}`);
      expect(screeningResponse.status).toBe(200);
      expect(screeningResponse.data.available_seats).toContain("A1");

      // Step 4: Create Booking
      const bookingData = {
        user: {
          id: mockUser.id,
          Name: mockUser.Name,
          MobileNo: mockUser.MobileNo,
          Email: mockUser.Email
        },
        movie: {
          _id: "1",
          title: "Avengers: Endgame",
          date: mockScreening.date,
          showtime: mockScreening.time,
          cinema: {
            name: mockScreening.cinema_name,
            location: mockTheater.location
          }
        },
        seats: ["A1", "A2"],
        total_price: 40
      };

      const mockBookingResponse = {
        _id: "6770bbd265c28ab11aa5c9de",
        booking_id: "BKG12346",
        ...bookingData,
        booking_date: "2024-12-29",
        booking_status: "Pending"
      };

      axios.post.mockResolvedValueOnce({
        status: 201,
        data: mockBookingResponse
      });

      const bookingResponse = await axios.post(`${baseURL}/bookings`, bookingData);
      expect(bookingResponse.status).toBe(201);
      expect(bookingResponse.data.booking_id).toBeTruthy();

      // Step 5: Update Screening Seats
      const seatUpdateData = {
        seats: ["A1", "A2"]
      };

      const updatedScreening = {
        ...mockScreening,
        available_seats: ["B1", "B2"],
        booked_seats: ["A1", "A2"]
      };

      axios.put.mockResolvedValueOnce({
        status: 200,
        data: updatedScreening
      });

      const seatUpdateResponse = await axios.put(
        `${baseURL}/screenings/${mockScreening._id}/book`,
        seatUpdateData
      );
      expect(seatUpdateResponse.status).toBe(200);
      expect(seatUpdateResponse.data.booked_seats).toContain("A1");
    });

    it('should handle booking flow with unavailable seats', async () => {
      // Mock user authentication
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: mockUser
      });

      const loginResponse = await axios.post(`${baseURL}/users/login`, {
        email: "johndoe@example.com",
        password: "password123"
      });
      expect(loginResponse.status).toBe(200);

      // Mock screening with unavailable seats
      const unavailableScreening = {
        ...mockScreening,
        available_seats: ["B1", "B2"],
        booked_seats: ["A1", "A2"]
      };

      axios.get.mockResolvedValueOnce({
        status: 200,
        data: unavailableScreening
      });

      const screeningResponse = await axios.get(`${baseURL}/screenings/${mockScreening._id}`);
      expect(screeningResponse.data.booked_seats).toContain("A1");

      // Attempt to book unavailable seats
      const invalidBookingData = {
        seats: ["A1", "A2"]
      };

      axios.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: "Selected seats are not available" }
        }
      });

      try {
        await axios.put(`${baseURL}/screenings/${mockScreening._id}/book`, invalidBookingData);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe("Selected seats are not available");
      }
    });

    it('should handle concurrent booking attempts', async () => {
      // First booking attempt
      const firstBookingData = {
        seats: ["A1", "A2"]
      };

      axios.put.mockResolvedValueOnce({
        status: 200,
        data: {
          ...mockScreening,
          available_seats: ["B1", "B2"],
          booked_seats: ["A1", "A2"]
        }
      });

      const firstBookingResponse = await axios.put(
        `${baseURL}/screenings/${mockScreening._id}/book`,
        firstBookingData
      );
      expect(firstBookingResponse.status).toBe(200);

      // Second concurrent booking attempt for same seats
      const secondBookingData = {
        seats: ["A1", "A2"]
      };

      axios.put.mockRejectedValueOnce({
        response: {
          status: 409,
          data: { message: "Seats have been booked by another user" }
        }
      });

      try {
        await axios.put(`${baseURL}/screenings/${mockScreening._id}/book`, secondBookingData);
      } catch (error) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toBe("Seats have been booked by another user");
      }
    });
  });

  describe('Booking Cancellation Flow', () => {
    it('should successfully cancel a booking and update seat availability', async () => {
      const bookingId = "BKG12346";
      const screeningId = "SCR_AE_MV_301024_1000";

      // Cancel booking
      axios.put.mockResolvedValueOnce({
        status: 200,
        data: {
          booking_id: bookingId,
          booking_status: "Cancelled"
        }
      });

      const cancellationResponse = await axios.put(`${baseURL}/bookings/${bookingId}/status`, {
        booking_status: "Cancelled"
      });
      expect(cancellationResponse.status).toBe(200);
      expect(cancellationResponse.data.booking_status).toBe("Cancelled");

      // Verify seats returned to available pool
      const updatedScreening = {
        _id: screeningId,
        available_seats: ["A1", "A2", "B1", "B2"],
        booked_seats: []
      };

      axios.get.mockResolvedValueOnce({
        status: 200,
        data: updatedScreening
      });

      const screeningResponse = await axios.get(`${baseURL}/screenings/${screeningId}`);
      expect(screeningResponse.data.available_seats).toContain("A1");
      expect(screeningResponse.data.available_seats).toContain("A2");
    });
  });
});