import { gql } from '@apollo/client'

export const SEARCH_LOCATIONS = gql`
  query SearchLocation($name: String!) {
    searchLocation(name: $name) {
      name
      country
      latitude
      longitude
    }
  }
`

export const GET_ACTIVITY_FORECAST = gql`
  query GetForecast($latitude: Float!, $longitude: Float!) {
    getActivityForecastByCoords(latitude: $latitude, longitude: $longitude) {
      latitude
      longitude
      dailyForecasts {
        date
        weather {
          sunshine
          precipitation
        }
        activityDesirability {
          activity
          score
          reasons
        }
      }
    }
  }
`