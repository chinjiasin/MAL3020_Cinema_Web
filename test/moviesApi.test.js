const axios = require('axios');
jest.mock('axios');  // Mock axios for API calls

describe('Movies API', () => {
  const movieUrl = 'http://localhost:3000/api/movies';

  test('fetches movies from the API', async () => {
    // Sample mock response from the API
    const mockResponse = {
      data: [
        {
          _id: '1',
          title: 'Inception',
          genre: ['Action', 'Sci-Fi'],
          duration: 148,
          language: ['English'],
          formats: ['2D', 'IMAX'],
        },
        {
          _id: '2',
          title: 'The Dark Knight',
          genre: ['Action', 'Crime', 'Drama'],
          duration: 152,
          language: ['English'],
          formats: ['2D'],
        },
      ],
    };

    // Mock axios.get to return the mock response
    axios.get.mockResolvedValue(mockResponse);

    // Call the API and test the response
    const response = await axios.get(movieUrl);

    // Assertions
    expect(response.data).toHaveLength(2);
    expect(response.data[0].title).toBe('Inception');
    expect(response.data[1].title).toBe('The Dark Knight');
    expect(response.data[0].genre).toContain('Sci-Fi');
  });

  test('returns error when the API fails', async () => {
    // Mock axios to simulate an error response
    axios.get.mockRejectedValue(new Error('Network Error'));

    // Test that an error is thrown
    await expect(axios.get(movieUrl)).rejects.toThrow('Network Error');
  });
});
