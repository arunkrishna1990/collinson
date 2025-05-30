import { LocationService, Location } from './LocationService';
import { IWeatherProviderHttpClient, ParsedLocation } from '@collinson-test/weather-provider';
import { success, failure } from '@collinson-test/types';

describe('LocationService', () => {
  const mockHttpClient: jest.Mocked<IWeatherProviderHttpClient> = {
    getDailyForecast: jest.fn(),
    searchByLocationName: jest.fn(),
  };

  const locationService = LocationService.getInstance(mockHttpClient);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return parsed locations on successful search', async () => {
    const mockApiResponse: ParsedLocation[] = [
      {
        name: 'London',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278,
      },
      {
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
      },
    ];

    mockHttpClient.searchByLocationName.mockResolvedValue(success(mockApiResponse));

    const result = await locationService.search('test');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toHaveLength(2);
      expect(result.result[0]).toBeInstanceOf(Location);
      expect(result.result[0].name).toBe('London');
      expect(result.result[1].name).toBe('Paris');
    }
  });

  it('should throw an error when searchByLocationName fails', async () => {
    mockHttpClient.searchByLocationName.mockResolvedValue(failure(new Error('API failure')));

    await expect(locationService.search('test')).rejects.toThrow('Failed to search for location: API failure');
  });
});
