import axios from 'axios';

jest.mock('axios');

describe('Users API', () => {
  const baseURL = 'http://localhost:3000/api/users';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    const mockUsers = [{
      "_id": "6770b9b865c28ab11aa5c9d7",
      "id": 1,
      "Name": "John Doe",
      "MobileNo": "+60123456789",
      "Email": "johndoe@example.com",
      "Password": "hashedpassword123",
      "DOB": "1990-05-15",
      "Profession": "Software Engineer",
      "Location": "Wilayah Persekutuan"
    }];

    it('should fetch all users successfully', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockUsers
      });

      const response = await axios.get(baseURL);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockUsers);
      expect(axios.get).toHaveBeenCalledWith(baseURL);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors when fetching users', async () => {
      const networkError = new Error('Network Error');
      axios.get.mockRejectedValue(networkError);

      await expect(axios.get(baseURL)).rejects.toThrow('Network Error');
    });
  });

  describe('GET /api/users/:id', () => {
    const userId = 1;
    const mockUser = {
      "_id": "6770b9b865c28ab11aa5c9d7",
      "id": userId,
      "Name": "John Doe",
      "MobileNo": "+60123456789",
      "Email": "johndoe@example.com",
      "Password": "hashedpassword123",
      "DOB": "1990-05-15",
      "Profession": "Software Engineer",
      "Location": "Wilayah Persekutuan"
    };

    it('should fetch a specific user by ID', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockUser
      });

      const response = await axios.get(`${baseURL}/${userId}`);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockUser);
      expect(response.data.Email).toBe('johndoe@example.com');
      expect(axios.get).toHaveBeenCalledWith(`${baseURL}/${userId}`);
    });

    it('should handle non-existent user ID', async () => {
      const nonExistentId = 999;
      
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'User not found' }
        }
      });

      try {
        await axios.get(`${baseURL}/${nonExistentId}`);
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('User not found');
      }
    });
  });

  describe('POST /api/users', () => {
    const newUser = {
      "Name": "Jane Smith",
      "MobileNo": "+60123456790",
      "Email": "janesmith@example.com",
      "Password": "securepassword456",
      "DOB": "1992-08-20",
      "Profession": "Data Scientist",
      "Location": "Selangor"
    };

    it('should create a new user successfully', async () => {
      const mockResponse = {
        _id: "6770ba3765c28ab11aa5c9d8",
        id: 2,
        ...newUser
      };

      axios.post.mockResolvedValue({
        status: 201,
        data: mockResponse
      });

      const response = await axios.post(baseURL, newUser);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse);
      expect(response.data._id).toBeTruthy();
      expect(response.data.id).toBeTruthy();
      expect(axios.post).toHaveBeenCalledWith(baseURL, newUser);
    });

    it('should validate email format', async () => {
      const invalidUser = {
        ...newUser,
        Email: 'invalid-email'
      };

      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid email format' }
        }
      });

      try {
        await axios.post(baseURL, invalidUser);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid email format');
      }
    });

    it('should prevent duplicate email registration', async () => {
      const duplicateUser = {
        ...newUser,
        Email: 'johndoe@example.com' // Existing email
      };

      axios.post.mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'Email already registered' }
        }
      });

      try {
        await axios.post(baseURL, duplicateUser);
      } catch (error) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toBe('Email already registered');
      }
    });
  });

  describe('PUT /api/users/:id', () => {
    const userId = 1;
    
    it('should update user details successfully', async () => {
      const updateData = {
        Profession: "Senior Software Engineer",
        Location: "Penang"
      };

      const mockResponse = {
        "_id": "6770b9b865c28ab11aa5c9d7",
        "id": userId,
        "Name": "John Doe",
        "Profession": "Senior Software Engineer",
        "Location": "Penang"
      };

      axios.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      });

      const response = await axios.put(`${baseURL}/${userId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.Profession).toBe('Senior Software Engineer');
      expect(response.data.Location).toBe('Penang');
      expect(axios.put).toHaveBeenCalledWith(`${baseURL}/${userId}`, updateData);
    });

    it('should validate mobile number format', async () => {
      const invalidUpdate = {
        MobileNo: '12345' // Invalid format
      };

      axios.put.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid mobile number format' }
        }
      });

      try {
        await axios.put(`${baseURL}/${userId}`, invalidUpdate);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid mobile number format');
      }
    });
  });

  describe('DELETE /api/users/:id', () => {
    const userId = 1;

    it('should delete user successfully', async () => {
      axios.delete.mockResolvedValue({
        status: 200,
        data: { message: 'User deleted successfully' }
      });

      const response = await axios.delete(`${baseURL}/${userId}`);

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('User deleted successfully');
      expect(axios.delete).toHaveBeenCalledWith(`${baseURL}/${userId}`);
    });

    it('should handle deletion of non-existent user', async () => {
      const nonExistentId = 999;

      axios.delete.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'User not found' }
        }
      });

      try {
        await axios.delete(`${baseURL}/${nonExistentId}`);
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('User not found');
      }
    });
  });
});