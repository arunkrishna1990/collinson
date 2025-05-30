import { WeatherProviderLocationApiResponse } from "../types";

export class ParsedLocation {
  constructor(
    public readonly name: string,
    public readonly country: string,
    public readonly latitude: number,
    public readonly longitude: number
  ) { }

  static fromApiResponse(apiResponse: WeatherProviderLocationApiResponse): ParsedLocation {
    return new ParsedLocation(
      apiResponse.name,
      apiResponse.country,
      apiResponse.latitude,
      apiResponse.longitude
    );
  }
}