import { WeatherProviderForecastApiResponse } from "../types"

export type ParsedWeatherDailyForecast = {
  date: string;
  sunshine: number;
  precipitation: number;
}

export class ParsedWeatherForecast {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly timezone: string,
    public readonly dailyForecasts: ParsedWeatherDailyForecast[]
  ) { }

  static fromApiResponse(apiResponse: WeatherProviderForecastApiResponse): ParsedWeatherForecast {
    const { latitude, longitude, timezone, daily } = apiResponse

    const dailyForecasts = daily.time.map((date, index) => ({
      date,
      sunshine: daily.sunshine_duration[index],
      precipitation: daily.precipitation_sum[index],
    }))

    return new ParsedWeatherForecast(latitude, longitude, timezone, dailyForecasts)
  }
}