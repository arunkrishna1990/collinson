import { ParsedWeatherDailyForecast } from "@collinson-test/weather-provider"
import { ActivityForecastConfig, Operator } from "../dao/db/ActivtyScoreConfigDAO"
import { failure, Result, success } from "@collinson-test/types"

type ForecastField = keyof ParsedWeatherDailyForecast

export interface IActivityScoringEngine {
  calculateScore(day: ParsedWeatherDailyForecast, config: ActivityForecastConfig): Result<Error, number>;
}

export class ActivityScoringEngine implements IActivityScoringEngine {
  public calculateScore(day: ParsedWeatherDailyForecast, config: ActivityForecastConfig): Result<Error, number> {
    try {
      const score = config.conditions.reduce((score, condition) => {
        const actual = day[condition.field as ForecastField];

        if (typeof actual !== 'number') return score;

        const matched = this.evaluateCondition(actual, condition.operator, condition.value);
        return matched ? score + condition.weight : score;
      }, 0);
      return success(score);
    } catch (error: unknown) {
      return failure(new Error(`Error calculating score: ${(error as Error).message}`));
    }
  }

  private evaluateCondition(actual: number, operator: Operator, expected: number): boolean {
    switch (operator) {
      case Operator.GREATER_THAN: return actual > expected;
      case Operator.GREATER_THAN_OR_EQUAL: return actual >= expected;
      case Operator.LESS_THAN: return actual < expected;
      case Operator.LESS_THAN_OR_EQUAL: return actual <= expected;
      case Operator.EQUALS: return actual === expected;
      default: return false;
    }
  }
}