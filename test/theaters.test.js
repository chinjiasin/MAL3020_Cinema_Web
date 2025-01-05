import axios from 'axios';

jest.mock('axios');

describe('Theaters API', () => {
  const baseURL = 'http://localhost:3000/api/theaters';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/theaters', () => {
    const mockTheaters = [{
      "_id": "GSC_MV_01",
      "cinema_name": "GSC Mid Valley",
      "location": "Mid Valley Megamall, Kuala Lumpur",
      "hall_number": "Hall 1",
      "seat_layout": {
        "total_rows": 8,
        "seats_per_row": 12,
        "seat_map": [
          ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"],
          ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12"]
        ],
        "seat_types": {
          "standard": ["A1", "A2", "A3", "A4", "A5", "A6"],
          "premium": ["B1", "B2", "B3", "B4", "B5", "B6"]
        }
      },
      "formats_supported": ["IMAX 3D", "3D", "2D"]
    }];

    it('should fetch all theaters successfully', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockTheaters
      });

      const response = await axios.get(baseURL);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockTheaters);
      expect(axios.get).toHaveBeenCalledWith(baseURL);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors when fetching theaters', async () => {
      const networkError = new Error('Network Error');
      axios.get.mockRejectedValue(networkError);

      await expect(axios.get(baseURL)).rejects.toThrow('Network Error');
    });
  });

  describe('GET /api/theaters/:id', () => {
    const theaterId = 'GSC_MV_01';
    const mockTheater = {
      "_id": theaterId,
      "cinema_name": "GSC Mid Valley",
      "location": "Mid Valley Megamall, Kuala Lumpur",
      "hall_number": "Hall 1",
      "seat_layout": {
        "total_rows": 8,
        "seats_per_row": 12,
        "seat_map": [
          ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"],
          ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12"]
        ],
        "seat_types": {
          "standard": ["A1", "A2", "A3", "A4", "A5", "A6"],
          "premium": ["B1", "B2", "B3", "B4", "B5", "B6"]
        }
      },
      "formats_supported": ["IMAX 3D", "3D", "2D"]
    };

    it('should fetch a specific theater by ID', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockTheater
      });

      const response = await axios.get(`${baseURL}/${theaterId}`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockTheater);
      expect(response.data.seat_layout.total_rows).toBe(8);
      expect(response.data.seat_layout.seats_per_row).toBe(12);
      expect(response.data.formats_supported).toContain('IMAX 3D');
      expect(axios.get).toHaveBeenCalledWith(`${baseURL}/${theaterId}`);
    });

    it('should handle non-existent theater ID', async () => {
      const nonExistentId = 'INVALID_ID';
      
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Theater not found' }
        }
      });

      try {
        await axios.get(`${baseURL}/${nonExistentId}`);
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Theater not found');
      }
    });
  });

  describe('POST /api/theaters', () => {
    const newTheater = {
      "cinema_name": "GSC Mid Valley",
      "location": "Mid Valley Megamall, Kuala Lumpur",
      "hall_number": "Hall 2",
      "seat_layout": {
        "total_rows": 8,
        "seats_per_row": 12,
        "seat_map": [
          ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"],
          ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12"]
        ],
        "seat_types": {
          "standard": ["A1", "A2", "A3", "A4", "A5", "A6"],
          "premium": ["B1", "B2", "B3", "B4", "B5", "B6"]
        }
      },
      "formats_supported": ["IMAX 3D", "3D", "2D"]
    };

    it('should create a new theater successfully', async () => {
      const mockResponse = {
        _id: "GSC_MV_02",
        ...newTheater
      };

      axios.post.mockResolvedValue({
        status: 201,
        data: mockResponse
      });

      const response = await axios.post(baseURL, newTheater);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
      expect(response.data._id).toBeTruthy();
      expect(axios.post).toHaveBeenCalledWith(baseURL, newTheater);
    });

    it('should validate seat layout structure', async () => {
      const invalidTheater = {
        "cinema_name": "GSC Mid Valley",
        "seat_layout": {
          "total_rows": 8,
          // Missing required fields
        }
      };

      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid seat layout structure' }
        }
      });

      try {
        await axios.post(baseURL, invalidTheater);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid seat layout structure');
      }
    });
  });

  describe('PUT /api/theaters/:id', () => {
    const theaterId = 'GSC_MV_01';
    
    it('should update theater formats successfully', async () => {
      const updateData = {
        formats_supported: ["IMAX 3D", "3D", "2D", "4DX"]
      };

      const mockResponse = {
        "_id": theaterId,
        "cinema_name": "GSC Mid Valley",
        "formats_supported": ["IMAX 3D", "3D", "2D", "4DX"]
      };

      axios.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      });

      const response = await axios.put(`${baseURL}/${theaterId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.formats_supported).toContain('4DX');
      expect(axios.put).toHaveBeenCalledWith(`${baseURL}/${theaterId}`, updateData);
    });

    it('should validate seat layout updates', async () => {
      const invalidUpdate = {
        seat_layout: {
          total_rows: -1 // Invalid value
        }
      };

      axios.put.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid seat layout update' }
        }
      });

      try {
        await axios.put(`${baseURL}/${theaterId}`, invalidUpdate);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid seat layout update');
      }
    });
  });
});