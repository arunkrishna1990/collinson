import { Result, success } from "@collinson-test/types";
import { IWeatherProviderHttpClient, ParsedLocation } from "@collinson-test/weather-provider";


export class Location {
  constructor(
    public readonly name: string,
    public readonly country: string,
    public readonly latitude: number,
    public readonly longitude: number
  ) { }

  static fromParsedLocationApiResponse(apiResponse: ParsedLocation): Location {
    return new Location(
      apiResponse.name,
      apiResponse.country,
      apiResponse.latitude,
      apiResponse.longitude
    );
  }
}

export interface ILocationService {
  search(location: string): Promise<Result<Error, Location[]>>;
}

export class LocationService implements ILocationService {
  private static instance: LocationService;

  private constructor(private readonly weatherProviderHttpClient: IWeatherProviderHttpClient) { }

  public static getInstance(weatherProviderHttpClient: IWeatherProviderHttpClient): LocationService {
    if (!this.instance) {
      this.instance = new LocationService(weatherProviderHttpClient);
    }
    return this.instance;
  }

  public async search(location: string): Promise<Result<Error, Location[]>> {
    const searchResult = await this.weatherProviderHttpClient.searchByLocationName(location);
    if (searchResult.success === false) {
      throw new Error(`Failed to search for location: ${searchResult.error.message}`);
    }

    const locations = searchResult.result.map(Location.fromParsedLocationApiResponse);

    return success(locations);
  }
}   