import axios from 'axios';
import { ParsedLocation } from './adapters/ParsedLocation';
import { ParsedWeatherForecast } from './adapters/ParsedWeatherForecast';
import { WeatherProviderHttpClient } from './WeatherProviderClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherProviderHttpClient', () => {
  let client: WeatherProviderHttpClient;

  beforeEach(() => {
    client = WeatherProviderHttpClient.getInstance();
  });

  describe('searchByLocationName', () => {
    it('should return parsed locations on success', async () => {
      const mockApiResponse = {
        results: [
          {
            name: 'London',
            country: 'United Kingdom',
            latitude: 51.5085,
            longitude: -0.1257,
          },
        ],
      };

      mockedAxios.get.mockResolvedValue({ data: mockApiResponse });

      const result = await client.searchByLocationName('London');
      if (result.success === false) {
        fail(`Expected success but got failure: ${result.error.message}`);
      }

      expect(result.success).toBe(true);
      expect(result.result).toEqual([
        new ParsedLocation('London', 'United Kingdom', 51.5085, -0.1257),
      ]);
    });

    it('should return failure on error', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      const result = await client.searchByLocationName('Invalid');
      if (result.success === true) {
        fail('Expected failure but got success');
      }

      expect(result.success).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('getDailyForecast', () => {
    it('should return parsed forecast on success', async () => {
      const mockApiResponse = {
        "latitude": 51.5,
        "longitude": -0.120000124,
        "generationtime_ms": 0.09298324584960938,
        "utc_offset_seconds": 3600,
        "timezone": "Europe/London",
        "timezone_abbreviation": "GMT+1",
        "elevation": 23.0,
        "daily_units": {
          "time": "iso8601",
          "sunshine_duration": "s",
          "precipitation_sum": "mm"
        },
        "daily": {
          "time": [
            "2025-05-30",
            "2025-05-31",
            "2025-06-01",
            "2025-06-02",
            "2025-06-03",
            "2025-06-04",
            "2025-06-05"
          ],
          "sunshine_duration": [
            45105.81,
            36599.15,
            40110.35,
            46173.46,
            34291.04,
            39687.89,
            25673.99
          ],
          "precipitation_sum": [
            0.00,
            0.00,
            0.00,
            0.00,
            4.80,
            0.00,
            3.90
          ]
        }
      };

      mockedAxios.get.mockResolvedValue({ data: mockApiResponse });

      const result = await client.getDailyForecast(51.5085, -0.1257);
      if (result.success === false) {
        fail(`Expected success but got failure: ${result.error.message}`);
      }
      expect(result.success).toBe(true);
      expect(result.result).toEqual(
        ParsedWeatherForecast.fromApiResponse(mockApiResponse)
      );
    });

    it('should return failure on error when the API call is rejected', async () => {
      const error = new Error('API error');
      mockedAxios.get.mockRejectedValue(error);

      const result = await client.getDailyForecast(0, 0);
      if (result.success === true) {
        fail('Expected failure but got success');
      }
      expect(result.success).toBe(false);
      expect(result.error).toEqual(error);
    });
  });
});
