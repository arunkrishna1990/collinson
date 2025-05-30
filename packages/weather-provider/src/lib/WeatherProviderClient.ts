import { failure, Result, success } from "@collinson-test/types";
import axios from "axios";
import { WeatherProviderForecastApiResponse, WeatherProviderLocationApiResponse } from "./types";
import { ParsedLocation } from "./adapters/ParsedLocation";
import { ParsedWeatherForecast } from "./adapters/ParsedWeatherForecast";

export interface IWeatherProviderHttpClient {
  searchByLocationName(location: string): Promise<Result<Error, ParsedLocation[]>>;
  getDailyForecast(latitude: number, longitude: number): Promise<Result<Error, ParsedWeatherForecast>>;
}

export class WeatherProviderHttpClient implements IWeatherProviderHttpClient {
  private readonly WEATHER_FORECAST_API_BASE_URL = "https://api.open-meteo.com/v1";
  public readonly GEOCODING_API_BASE_URL = "https://geocoding-api.open-meteo.com/v1";

  private static instance: WeatherProviderHttpClient;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): WeatherProviderHttpClient {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  public async searchByLocationName(location: string): Promise<Result<Error, ParsedLocation[]>> {
    try {
      const { data } = await axios.get<{ results: WeatherProviderLocationApiResponse[] }>(`${this.GEOCODING_API_BASE_URL}/search`, {
        params: { name: location },
      });

      return success(data.results.map(result => ParsedLocation.fromApiResponse(result)));
    } catch (error: unknown) {
      return failure(error as Error);
    }
  }

  public async getDailyForecast(latitude: number, longitude: number): Promise<Result<Error, ParsedWeatherForecast>> {
    try {
      const { data } = await axios.get<WeatherProviderForecastApiResponse>(`${this.WEATHER_FORECAST_API_BASE_URL}/forecast`, {
        params: {
          latitude,
          longitude,
          daily: 'sunshine_duration,precipitation_sum',
          timezone: 'auto',
        },
      })
      return success(ParsedWeatherForecast.fromApiResponse(data))
    } catch (error: unknown) {
      return failure(error as Error);
    }
  }
}