import { failure, Result, success } from "@collinson-test/types";
import { IWeatherProviderHttpClient, ParsedWeatherDailyForecast } from "@collinson-test/weather-provider";
import { ActivityForecastResult, DailyForecast } from "@collinson-test/weather-ranking"
import { ActivityForecastConfig, IActivityScoreConfigDAO } from "../dao/db/ActivtyScoreConfigDAO";
import { IActivityScoringEngine } from "./ActivityScoringEngine";

export class ActivityForecastService {
  private static instance: ActivityForecastService;
  private constructor(
    private readonly weatherProviderHttpClient: IWeatherProviderHttpClient,
    private readonly activityScoreConfigDAO: IActivityScoreConfigDAO,
    private readonly activityScoringEngine: IActivityScoringEngine
  ) { }

  public static getInstance(
    weatherProviderHttpClient: IWeatherProviderHttpClient,
    activityScoreConfigDAO: IActivityScoreConfigDAO,
    activityScoringEngine: IActivityScoringEngine
  ): ActivityForecastService {
    if (!this.instance) {
      this.instance = new ActivityForecastService(weatherProviderHttpClient, activityScoreConfigDAO, activityScoringEngine);
    }
    return this.instance;
  }

  public async getActivityScoresByCoords(latitude: number, longitude: number): Promise<Result<Error, ActivityForecastResult>> {
    const forecast = await this.weatherProviderHttpClient.getDailyForecast(latitude, longitude)
    if (forecast.success === false) {
      return failure(forecast.error);
    }

    const configs = this.activityScoreConfigDAO.getConfig();
    const dailyForecasts = [];

    for (const dailyForecast of forecast.result.dailyForecasts) {
      const activityDesirability = this.getActivityDesirability(dailyForecast, configs);
      if (activityDesirability.success === false) {
        return failure(activityDesirability.error);
      }

      dailyForecasts.push({
        date: dailyForecast.date,
        weather: {
          sunshine: dailyForecast.sunshine,
          precipitation: dailyForecast.precipitation
        },
        activityDesirability: activityDesirability.result
      });
    }
    return success({
      latitude: forecast.result.latitude,
      longitude: forecast.result.longitude,
      dailyForecasts
    })
  }

  private getActivityDesirability(dailyForecast: ParsedWeatherDailyForecast, configs: ActivityForecastConfig[]): Result<Error, DailyForecast['activityDesirability']> {
    const activityDesirability = [];
    for (const config of configs) {
      const scoreResult = this.activityScoringEngine.calculateScore(dailyForecast, config);
      if (scoreResult.success === false) {
        return failure(scoreResult.error);
      }
      activityDesirability.push({
        activity: config.activity,
        score: scoreResult.result,
        reasons: config.conditions.map(condition => condition.reason)
      });
    }

    return success(activityDesirability);
  }
}