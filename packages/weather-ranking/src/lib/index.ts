export type DailyForecast = {
  date: string
  weather: {
    sunshine: number
    precipitation: number
  }
  activityDesirability: {
    activity: string;
    score: number;
    reasons: string[];
  }[]
}

export type ActivityForecastResult = {
  latitude: number
  longitude: number
  dailyForecasts: DailyForecast[]
}