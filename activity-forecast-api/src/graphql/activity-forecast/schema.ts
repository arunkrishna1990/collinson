import gql from "graphql-tag";

export const activityForecastTypeDefs = gql`
  type ActivityDesirability {
    activity: String!
    score: Float!
    reasons: [String]
  }

  type Weather {
    sunshine: Float!
    precipitation: Float!
  }

  type DailyForecast {
    date: String!
    weather: Weather!
    activityDesirability: [ActivityDesirability!]!
  }

  type ActivityForecast {
    latitude: Float!
    longitude: Float!
    dailyForecasts: [DailyForecast!]!
  }

  extend type Query {
    getActivityForecastByCoords(latitude: Float!, longitude: Float!): ActivityForecast!
  }
`