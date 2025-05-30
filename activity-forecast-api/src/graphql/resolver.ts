import { activityForecastResolver } from "./activity-forecast/resolver";
import { locationResolvers } from "./location";

export const resolvers = {
  Query: {
    ...locationResolvers.Query,
    ...activityForecastResolver.Query,
  },
}