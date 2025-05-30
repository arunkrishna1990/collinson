import { ActivityScoringEngine } from './ActivityScoringEngine';
import { ParsedWeatherDailyForecast } from '@collinson-test/weather-provider';
import { ActivityForecastConfig, Operator, ActivityType } from '../dao/db/ActivtyScoreConfigDAO';

const service = new ActivityScoringEngine();

describe('ActivityScoringEngine', () => {
  const sampleForecast: ParsedWeatherDailyForecast = {
    date: '2025-06-01',
    sunshine: 40000,
    precipitation: 2
  };

  it('should return correct score when condition matches', () => {
    const config: ActivityForecastConfig = {
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      conditions: [
        {
          field: 'sunshine',
          operator: Operator.GREATER_THAN,
          value: 36000,
          weight: 2,
          reason: 'Sunny is good'
        }
      ]
    };

    const result = service.calculateScore(sampleForecast, config);
    if (result.success === false) {
      fail(`Failed to calculate score: ${result.error.message}`);
    }

    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  it('should return 0 when condition does not match', () => {
    const config: ActivityForecastConfig = {
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      conditions: [
        {
          field: 'sunshine',
          operator: Operator.GREATER_THAN,
          value: 50000,
          weight: 2,
          reason: 'Too much sun'
        }
      ]
    };

    const result = service.calculateScore(sampleForecast, config);
    if (result.success === false) {
      fail(`Failed to calculate score: ${result.error.message}`);
    }
    expect(result.success).toBe(true);
    expect(result.result).toBe(0);
  });

  it('should accumulate scores for multiple matching conditions', () => {
    const config: ActivityForecastConfig = {
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      conditions: [
        {
          field: 'sunshine',
          operator: Operator.GREATER_THAN,
          value: 36000,
          weight: 1,
          reason: 'Sunny'
        },
        {
          field: 'precipitation',
          operator: Operator.LESS_THAN,
          value: 5,
          weight: 1,
          reason: 'Low rain'
        }
      ]
    };

    const result = service.calculateScore(sampleForecast, config);
    if (result.success === false) {
      fail(`Failed to calculate score: ${result.error.message}`);
    }
    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  it('should ignore non-numeric fields and not fail', () => {
    const config: ActivityForecastConfig = {
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      conditions: [
        {
          field: 'invalidField',
          operator: Operator.GREATER_THAN,
          value: 10,
          weight: 1,
          reason: 'Invalid'
        }
      ]
    };

    const result = service.calculateScore(sampleForecast, config);
    if (result.success === false) {
      fail(`Failed to calculate score: ${result.error.message}`);
    }
    expect(result.success).toBe(true);
    expect(result.result).toBe(0);
  });
});
