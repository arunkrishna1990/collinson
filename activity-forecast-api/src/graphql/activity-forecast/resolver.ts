import { WeatherProviderHttpClient } from "@collinson-test/weather-provider";
import { ActivityScoreConfigDAO } from "../../dao/db/ActivtyScoreConfigDAO";
import { ActivityScoringEngine } from "../../services/ActivityScoringEngine";
import { ActivityForecastService } from "../../services/ActivityForecastService";

export const activityForecastResolver = {
  Query: {
    getActivityForecastByCoords: async (_: unknown, { latitude, longitude }: { latitude: number; longitude: number }) => {
      const webProviderHttpClient = WeatherProviderHttpClient.getInstance();
      const activityScoreConfigDAO = new ActivityScoreConfigDAO();
      const activityScoringEngine = new ActivityScoringEngine();
      const service = ActivityForecastService.getInstance(
        webProviderHttpClient,
        activityScoreConfigDAO,
        activityScoringEngine
      );
      const forecastResult = await service.getActivityScoresByCoords(latitude, longitude);
      if (forecastResult.success === false) {
        throw new Error(`Failed to get activity forecast: ${forecastResult.error.message}`);
      }
      return forecastResult.result;
    }
  },
}