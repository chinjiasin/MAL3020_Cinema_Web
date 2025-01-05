import axios from 'axios';

jest.mock('axios');

describe('Bookings API', () => {
  const baseURL = 'http://localhost:3000/api/bookings';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bookings', () => {
    const mockBookings = [{
      "_id": "6770bbd265c28ab11aa5c9de",
      "booking_id": "BKG12346",
      "user": {
        "id": 1,
        "Name": "John Doe",
        "MobileNo": "+60123456789",
        "Email": "johndoe@example.com"
      },
      "movie": {
        "_id": "1",
        "title": "Avengers: Endgame",
        "date": "2024-12-31",
        "showtime": "06:00 PM",
        "cinema": {
          "name": "TGV Sunway Pyramid",
          "location": "Sunway Pyramid, Selangor"
        }
      },
      "seats": ["B1", "B2"],
      "total_price": 40,
      "booking_date": "2024-12-29",
      "booking_status": "Pending"
    }];

    it('should fetch all bookings successfully', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockBookings
      });

      const response = await axios.get(baseURL);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockBookings);
      expect(axios.get).toHaveBeenCalledWith(baseURL);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors when fetching bookings', async () => {
      const networkError = new Error('Network Error');
      axios.get.mockRejectedValue(networkError);

      await expect(axios.get(baseURL)).rejects.toThrow('Network Error');
    });
  });

  describe('GET /api/bookings/:id', () => {
    const bookingId = 'BKG12346';
    const mockBooking = {
      "_id": "6770bbd265c28ab11aa5c9de",
      "booking_id": bookingId,
      "user": {
        "id": 1,
        "Name": "John Doe",
        "MobileNo": "+60123456789",
        "Email": "johndoe@example.com"
      },
      "movie": {
        "_id": "1",
        "title": "Avengers: Endgame",
        "date": "2024-12-31",
        "showtime": "06:00 PM",
        "cinema": {
          "name": "TGV Sunway Pyramid",
          "location": "Sunway Pyramid, Selangor"
        }
      },
      "seats": ["B1", "B2"],
      "total_price": 40,
      "booking_date": "2024-12-29",
      "booking_status": "Pending"
    };

    it('should fetch a specific booking by ID', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockBooking
      });

      const response = await axios.get(`${baseURL}/${bookingId}`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockBooking);
      expect(axios.get).toHaveBeenCalledWith(`${baseURL}/${bookingId}`);
    });

    it('should handle non-existent booking ID', async () => {
      const nonExistentId = 'INVALID_ID';
      
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Booking not found' }
        }
      });

      try {
        await axios.get(`${baseURL}/${nonExistentId}`);
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Booking not found');
      }
    });
  });

  describe('POST /api/bookings', () => {
    const newBooking = {
      "user": {
        "id": 1,
        "Name": "John Doe",
        "MobileNo": "+60123456789",
        "Email": "johndoe@example.com"
      },
      "movie": {
        "_id": "1",
        "title": "Avengers: Endgame",
        "date": "2024-12-31",
        "showtime": "06:00 PM",
        "cinema": {
          "name": "TGV Sunway Pyramid",
          "location": "Sunway Pyramid, Selangor"
        }
      },
      "seats": ["B1", "B2"],
      "total_price": 40
    };

    it('should create a new booking successfully', async () => {
      const mockResponse = {
        _id: "6770bbd265c28ab11aa5c9de",
        booking_id: "BKG12346",
        booking_date: "2024-12-29",
        booking_status: "Pending",
        ...newBooking
      };

      axios.post.mockResolvedValue({
        status: 201,
        data: mockResponse
      });

      const response = await axios.post(baseURL, newBooking);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
      expect(response.data.booking_status).toBe('Pending');
      expect(response.data.booking_id).toBeTruthy();
      expect(axios.post).toHaveBeenCalledWith(baseURL, newBooking);
    });

    it('should handle validation errors', async () => {
      const invalidBooking = {
        user: {
          Name: "John Doe"
          // Missing required fields
        }
      };

      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Validation failed: Missing required fields' }
        }
      });

      try {
        await axios.post(baseURL, invalidBooking);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Validation failed');
      }
    });
  });

  describe('PUT /api/bookings/:id/status', () => {
    const bookingId = 'BKG12346';
    
    it('should update booking status successfully', async () => {
      const statusUpdate = {
        booking_status: "Confirmed"
      };

      const mockResponse = {
        "_id": "6770bbd265c28ab11aa5c9de",
        "booking_id": bookingId,
        "booking_status": "Confirmed"
      };

      axios.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      });

      const response = await axios.put(`${baseURL}/${bookingId}/status`, statusUpdate);

      expect(response.status).toBe(200);
      expect(response.data.booking_status).toBe('Confirmed');
      expect(axios.put).toHaveBeenCalledWith(`${baseURL}/${bookingId}/status`, statusUpdate);
    });

    it('should handle invalid status updates', async () => {
      const invalidStatus = {
        booking_status: "InvalidStatus"
      };

      axios.put.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid booking status' }
        }
      });

      try {
        await axios.put(`${baseURL}/${bookingId}/status`, invalidStatus);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid booking status');
      }
    });
  });
});