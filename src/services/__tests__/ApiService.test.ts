/**
 * Test file for ApiService
 */

import { apiService, ApiResponse } from '../ApiService';

// Mock the fetch function
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getSubjects', () => {
    it('should fetch subjects successfully', async () => {
      // Mock response
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: [],
        message: 'Success'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await apiService.getSubjects();

      expect(response.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/subjects',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await apiService.getSubjects();

      expect(response.success).toBe(false);
      expect(response.message).toBe('Network error');
    });
  });

  describe('getRandomQuestion', () => {
    it('should fetch a random question without parameters', async () => {
      const mockResponse: ApiResponse<any> = {
        success: true,
        data: {},
        message: 'Success'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await apiService.getRandomQuestion();

      expect(response.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/questions/random',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should fetch a random question with parameters', async () => {
      const mockResponse: ApiResponse<any> = {
        success: true,
        data: {},
        message: 'Success'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await apiService.getRandomQuestion('subject123', 'easy');

      expect(response.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/questions/random?subjectId=subject123&difficulty=easy',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });
});