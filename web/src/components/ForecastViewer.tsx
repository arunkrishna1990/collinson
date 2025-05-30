import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVITY_FORECAST } from '../graphql/queries';
import { Coordinates } from '../types';
import { ActivityForecastResult } from "@collinson-test/weather-ranking";

const ForecastViewer: React.FC<Coordinates> = ({ latitude, longitude, name, country }) => {
  const { data, loading, error } = useQuery<{ getActivityForecastByCoords: ActivityForecastResult }>(GET_ACTIVITY_FORECAST, {
    variables: { latitude, longitude },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading forecast</p>;

  return (
    <div className="forecast-viewer">
      <h2>Forecast for {name},{country}({latitude}, {longitude})</h2>
        {data?.getActivityForecastByCoords.dailyForecasts.map((day: any) => (
          <div key={day.date} className="forecast-day">
            <h3>{day.date}</h3>
            <ul>
              {day.activityDesirability
                .filter((score: any) => score.score > 0)
                .sort((a: any, b: any) => b.score - a.score)
                .map((score: any) => (
                  <li key={score.activity}>
                    <strong>{score.activity}</strong>
                    <br />
                    <small>
                      {score.reasons?.length > 0
                        ? score.reasons.join(', ')
                        : 'Low chance this activity is suitable today'}
                    </small>
                  </li>
                ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default ForecastViewer;