import { ActivityForecastService } from './ActivityForecastService';
import { Operator, ActivityType, IActivityScoreConfigDAO } from '../dao/db/ActivtyScoreConfigDAO';
import { IWeatherProviderHttpClient, ParsedWeatherForecast } from '@collinson-test/weather-provider';
import { IActivityScoringEngine } from './ActivityScoringEngine';
import { ActivityForecastConfig } from '../dao/db/ActivtyScoreConfigDAO';
import { success } from '@collinson-test/types';
import { mock } from 'node:test';

type MockWeatherProviderHttpClient = jest.Mocked<IWeatherProviderHttpClient>;

function getMockWeatherProviderHttpClient(): MockWeatherProviderHttpClient {
  return {
    getDailyForecast: jest.fn(),
    searchByLocationName: jest.fn(),
  }
}

export function resetMockWeatherProviderHttpClient(service: MockWeatherProviderHttpClient): void {
  service.getDailyForecast.mockReset();
  service.searchByLocationName.mockReset();
}

type MockActivityScoreConfigDAO = jest.Mocked<IActivityScoreConfigDAO>;
function getMockActivityScoreConfigDAO(): MockActivityScoreConfigDAO {
  return {
    getConfig: jest.fn(),
  };
}

function resetMockActivityScoreConfigDAO(service: MockActivityScoreConfigDAO): void {
  service.getConfig.mockReset();
}

type MockActivityScoringEngine = jest.Mocked<IActivityScoringEngine>;
function getMockActivityScoringEngine(): MockActivityScoringEngine {
  return {
    calculateScore: jest.fn(),
  };
}
function resetMockActivityScoringEngine(service: MockActivityScoringEngine): void {
  service.calculateScore.mockReset();
}

describe('ActivityForecastService ', () => {
  const mockConfig: ActivityForecastConfig[] = [
    {
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      conditions: [
        {
          field: 'sunshine',
          operator: Operator.GREATER_THAN,
          value: 36000,
          weight: 1,
          reason: 'High sunshine hours are ideal for outdoor sightseeing',
        },
      ],
    },
  ];
  const mockWeatherProviderHttpClient = getMockWeatherProviderHttpClient();
  const mockActivityScoreConfigDAO = getMockActivityScoreConfigDAO();
  const mockActivityScoringEngine = getMockActivityScoringEngine();
  let service: ActivityForecastService;
  beforeEach(() => {
    service = ActivityForecastService.getInstance(
      mockWeatherProviderHttpClient,
      mockActivityScoreConfigDAO,
      mockActivityScoringEngine
    );
  });

  afterEach(() => {
    resetMockWeatherProviderHttpClient(mockWeatherProviderHttpClient);
    resetMockActivityScoreConfigDAO(mockActivityScoreConfigDAO);
    resetMockActivityScoringEngine(mockActivityScoringEngine);
  });

  describe('getActivityScoresByCoords', () => {
    it('should return correct desirability scores based on sunshine value', async () => {
      mockActivityScoreConfigDAO.getConfig.mockReturnValue(mockConfig);
      const mockForecast = new ParsedWeatherForecast(
        51.5074,
        -0.1278,
        'Europe/London',
        [
          {
            date: '2025-06-01',
            sunshine: 40000,
            precipitation: 0.2,
          },
          {
            date: '2025-06-02',
            sunshine: 18000,
            precipitation: 1.0,
          },
          {
            date: '2025-06-03',
            sunshine: 10000,
            precipitation: 5.6,
          },
        ]
      );
      mockWeatherProviderHttpClient.getDailyForecast.mockResolvedValue(success(mockForecast));
      mockActivityScoringEngine.calculateScore
        .mockReturnValueOnce(success(1))
        .mockReturnValueOnce(success(0))
        .mockReturnValueOnce(success(0));
      mockActivityScoreConfigDAO.getConfig.mockReturnValue(mockConfig);

      const result = await service.getActivityScoresByCoords(51.5, -0.12);
      if (result.success === false) {
        fail(`Failed to get activity scores: ${result.error.message}`);
      }

      expect(result.success).toBe(true);
      const expectedResult = {
        "latitude": 51.5074,
        "longitude": -0.1278,
        "dailyForecasts": [
          {
            "date": "2025-06-01",
            "weather": {
              "sunshine": 40000,
              "precipitation": 0.2
            },
            "activityDesirability": [
              {
                "activity": "outdoor_sightseeing",
                "score": 1,
                "reasons": [
                  "High sunshine hours are ideal for outdoor sightseeing"
                ]
              }
            ]
          },
          {
            "date": "2025-06-02",
            "weather": {
              "sunshine": 18000,
              "precipitation": 1
            },
            "activityDesirability": [
              {
                "activity": "outdoor_sightseeing",
                "score": 0,
                "reasons": [
                  "High sunshine hours are ideal for outdoor sightseeing"
                ]
              }
            ]
          },
          {
            "date": "2025-06-03",
            "weather": {
              "sunshine": 10000,
              "precipitation": 5.6
            },
            "activityDesirability": [
              {
                "activity": "outdoor_sightseeing",
                "score": 0,
                "reasons": [
                  "High sunshine hours are ideal for outdoor sightseeing"
                ]
              }
            ]
          }
        ]
      }

      expect(result.result).toEqual(expectedResult);
    });

    it('should return failure if weather provider fails to fetch forecast', async () => {
      const mockError = new Error('Failed to fetch forecast');
      mockWeatherProviderHttpClient.getDailyForecast.mockResolvedValue({ success: false, error: mockError });

      const result = await service.getActivityScoresByCoords(51.5, -0.12);
      if (result.success === true) {
        fail(`Expected failure but got success: ${JSON.stringify(result.result)}`);
      }
      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it('should not cause any issue if we get an empty config', async () => {
      mockActivityScoreConfigDAO.getConfig.mockReturnValue([]);
      const mockForecast = new ParsedWeatherForecast(
        51.5074,
        -0.1278,
        'Europe/London',
        [
          {
            date: '2025-06-01',
            sunshine: 40000,
            precipitation: 0.2,
          },
          {
            date: '2025-06-02',
            sunshine: 18000,
            precipitation: 1.0,
          },
          {
            date: '2025-06-03',
            sunshine: 10000,
            precipitation: 5.6,
          },
        ]
      );
      mockWeatherProviderHttpClient.getDailyForecast.mockResolvedValue(success(mockForecast));
      const result = await service.getActivityScoresByCoords(51.5, -0.12);
      if (result.success === false) {
        fail(`Failed to get activity scores: ${result.error.message}`);
      }
      expect(result.success).toBe(true);
      const expectedResult = {
        "latitude": 51.5074,
        "longitude": -0.1278,
        "dailyForecasts": [
          {
            "date": "2025-06-01",
            "weather": {
              "sunshine": 40000,
              "precipitation": 0.2
            },
            "activityDesirability": []
          },
          {
            "date": "2025-06-02",
            "weather": {
              "sunshine": 18000,
              "precipitation": 1
            },
            "activityDesirability": []
          },
          {
            "date": "2025-06-03",
            "weather": {
              "sunshine": 10000,
              "precipitation": 5.6
            },
            "activityDesirability": []
          }
        ]
      }
      expect(result.result).toEqual(expectedResult);
    });
  })
});
