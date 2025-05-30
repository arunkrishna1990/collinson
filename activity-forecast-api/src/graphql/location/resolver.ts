import { WeatherProviderHttpClient } from "@collinson-test/weather-provider";
import { Location, LocationService } from "../../services/LocationService";

export const locationResolvers = {
  Query: {
    searchLocation: async (_parent: unknown, { name }: { name: string }): Promise<Location[]> => {
      const webProviderHttpClient = WeatherProviderHttpClient.getInstance();
      const locationService = LocationService.getInstance(webProviderHttpClient);
      const searchResult = await locationService.search(name)
      if (searchResult.success === false) {
        throw new Error(`Failed to search for location: ${searchResult.error.message}`);
      }
      return searchResult.result;
    }
  },
}