import axios from 'axios';

jest.mock('axios');

describe('Screenings API', () => {
  const baseURL = 'http://localhost:3000/api/screenings';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/screenings', () => {
    const mockScreenings = [
      {
        "_id": "SCR_AE_MV_301024_1000",
        "movie_id": "1",
        "theater_id": "GSC_MV_01",
        "cinema_name": "GSC Mid Valley",
        "date": "2024-12-30",
        "time": "10:00 AM",
        "format": "IMAX 3D",
        "price": {
          "standard": 20,
          "premium": 25
        },
        "available_seats": ["A4", "A5", "A6"],
        "booked_seats": ["A1", "A2", "A3"]
      }
    ];

    it('should fetch all screenings successfully', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockScreenings
      });

      const response = await axios.get(baseURL);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockScreenings);
      expect(axios.get).toHaveBeenCalledWith(baseURL);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      const networkError = new Error('Network Error');
      axios.get.mockRejectedValue(networkError);

      await expect(axios.get(baseURL)).rejects.toThrow('Network Error');
    });
  });

  describe('GET /api/screenings/:id', () => {
    const screeningId = 'SCR_AE_MV_301024_1000';
    const mockScreening = {
      "_id": screeningId,
      "movie_id": "1",
      "theater_id": "GSC_MV_01",
      "cinema_name": "GSC Mid Valley",
      "date": "2024-12-30",
      "time": "10:00 AM",
      "format": "IMAX 3D",
      "price": {
        "standard": 20,
        "premium": 25
      },
      "available_seats": ["A4", "A5", "A6"],
      "booked_seats": ["A1", "A2", "A3"]
    };

    it('should fetch a specific screening by ID', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockScreening
      });

      const response = await axios.get(`${baseURL}/${screeningId}`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockScreening);
      expect(axios.get).toHaveBeenCalledWith(`${baseURL}/${screeningId}`);
    });

    it('should handle non-existent screening ID', async () => {
      const nonExistentId = 'INVALID_ID';
      
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Screening not found' }
        }
      });

      try {
        await axios.get(`${baseURL}/${nonExistentId}`);
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Screening not found');
      }
    });
  });

  describe('POST /api/screenings', () => {
    const newScreening = {
      "movie_id": "1",
      "theater_id": "GSC_MV_01",
      "cinema_name": "GSC Mid Valley",
      "date": "2024-12-30",
      "time": "10:00 AM",
      "format": "IMAX 3D",
      "price": {
        "standard": 20,
        "premium": 25
      },
      "available_seats": ["A4", "A5", "A6"],
      "booked_seats": []
    };

    it('should create a new screening successfully', async () => {
      const mockResponse = { 
        _id: 'SCR_NEW_ID',
        ...newScreening 
      };

      axios.post.mockResolvedValue({
        status: 201,
        data: mockResponse
      });

      const response = await axios.post(baseURL, newScreening);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith(baseURL, newScreening);
    });

    it('should handle validation errors', async () => {
      const invalidScreening = {
        movie_id: "1"
        // Missing required fields
      };

      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Validation failed' }
        }
      });

      try {
        await axios.post(baseURL, invalidScreening);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Validation failed');
      }
    });
  });

  describe('PUT /api/screenings/:id/book', () => {
    const screeningId = 'SCR_AE_MV_301024_1000';
    const bookingRequest = {
      seats: ["A4", "A5"]
    };

    it('should book seats successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Seats booked successfully',
        updatedScreening: {
          "_id": screeningId,
          "booked_seats": ["A1", "A2", "A3", "A4", "A5"],
          "available_seats": ["A6"]
        }
      };

      axios.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      });

      const response = await axios.put(`${baseURL}/${screeningId}/book`, bookingRequest);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.updatedScreening.booked_seats).toContain("A4");
      expect(response.data.updatedScreening.booked_seats).toContain("A5");
    });

    it('should handle booking unavailable seats', async () => {
      const unavailableSeats = {
        seats: ["A1", "A2"] // Already booked seats
      };

      axios.put.mockRejectedValue({
        response: {
          status: 400,
          data: { 
            success: false,
            message: 'Selected seats are not available'
          }
        }
      });

      try {
        await axios.put(`${baseURL}/${screeningId}/book`, unavailableSeats);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.message).toBe('Selected seats are not available');
      }
    });
  });
});